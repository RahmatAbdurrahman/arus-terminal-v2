import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getBrokerRegistry,
  getBrokerSummary,
  getCompanyReport,
  getCorporateActions,
  getDailyTransactions,
  getFilings,
  screenCompanies,
} from "@/lib/sectors/client";
import { scoreUniverse } from "@/lib/formulas/smfi";
import { computeInsiderSignal } from "@/lib/formulas/insider";
import { computeSectorRotation, StockSnapshot } from "@/lib/formulas/sectorRotation";
import { TickerInput, CorporateAction } from "@/lib/formulas/types";

/**
 * Pengaman keras — PRD.md bagian 12. Lebih baik satu siklus terlewat/parsial
 * daripada kredit tim habis diam-diam sebelum penjurian.
 */
const MAX_API_CALLS_PER_RUN = 250;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Senin→0, Rabu→1, Jumat→2 — cocok dengan jadwal cron di vercel.json. Hari lain (mis. pemicu manual) jatuh ke batch 0. */
function dayOfWeekBatchIndex(): number {
  const day = new Date().getUTCDay();
  if (day === 3) return 1;
  if (day === 5) return 2;
  return 0;
}

/**
 * Sectors nggak punya field "free float" langsung — diverifikasi live 17 Sep
 * 2026 (lihat lib/sectors/UNVERIFIED.md): `ownership.major_shareholders`
 * konsisten punya satu entri bernama persis "Public" (dicek di BBCA & TLKM)
 * dengan `share_percentage` sebagai FRAKSI string ("0.44642"), bukan persen.
 * Dipakai sebagai proxy free float — kalau entrinya nggak ada, null (aman,
 * nggak memicu penalti float di smfi.ts, bukan dianggap 0%).
 */
function extractFreeFloatPct(ownership: { major_shareholders: { name: string; share_percentage: string }[] } | undefined): number | null {
  const publicRow = ownership?.major_shareholders.find((s) => s.name.trim().toLowerCase() === "public");
  if (!publicRow) return null;
  const frac = Number(publicRow.share_percentage);
  return Number.isFinite(frac) ? frac * 100 : null;
}

/**
 * POST /api/cron/ingest — lihat PRD.md bagian 6.
 * Satu-satunya rute yang boleh memanggil Sectors API hidup. Semua fitur
 * lain baca dari Supabase. Dipanggil terjadwal (vercel.json), 3x/minggu.
 */
export async function POST(req: NextRequest) {
  // Vercel Cron otomatis mengirim header ini kalau CRON_SECRET di-set sebagai
  // env var project. Kalau pakai pemicu eksternal (fallback, lihat PRD.md
  // bagian 6), kirim header yang sama secara manual.
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const startedAt = new Date().toISOString();
  let apiCalls = 0;
  const errors: { ticker?: string; message: string }[] = [];

  // Mode "cached": kalau sudah ada >=20 ticker LQ45 tersimpan dari siklus
  // sebelumnya, langsung proses ticker itu — SKIP fase screening (60 kandidat)
  // + cek keanggotaan per-kandidat (60 panggilan, sebagian besar berakhir
  // ditolak). Itu yang bikin satu invocation lewat plafon waktu Vercel Hobby.
  // Keanggotaan LQ45 IDX di-rebalance triwulanan, bukan tiap siklus, jadi
  // cache ini aman dipakai berulang. Refresh penuh (?rediscover=1) tetap
  // tersedia untuk re-scan manual kalau ada perubahan komposisi.
  const forceRediscover = req.nextUrl.searchParams.get("rediscover") === "1";
  const { data: cachedCompanies } = await db
    .from("companies")
    .select("ticker, name, sector, sub_sector, listing_date, free_float_pct")
    .eq("is_lq45", true)
    .order("ticker", { ascending: true }); // urutan wajib eksplisit — tanpa ini slicing per-batch nggak deterministik
  const useCache = !forceRediscover && (cachedCompanies?.length ?? 0) >= 20;

  type Candidate = {
    symbol: string;
    needsMembershipCheck: boolean;
    knownName?: string;
    knownSector?: string | null;
    knownSubSector?: string | null;
    knownListingDate?: string | null;
    knownFreeFloatPct?: number | null;
  };

  try {
    let candidates: Candidate[];

    if (useCache) {
      // Baris lama (sebelum kolom listing_date/free_float_pct terisi) belum
      // punya nilai ini — untuk baris itu SAJA, tetap ambil lewat overview
      // call sekali supaya cek "histori kurang" di eligibility.ts dan
      // penalti float di smfi.ts nggak diam-diam ke-skip. Siklus berikutnya
      // baris itu sudah terisi dan lewat jalur cepat tanpa panggilan tambahan.
      candidates = (cachedCompanies ?? []).map((c) => ({
        symbol: c.ticker,
        needsMembershipCheck: c.listing_date === null || c.free_float_pct === null,
        knownName: c.name,
        knownSector: c.sector,
        knownSubSector: c.sub_sector,
        knownListingDate: c.listing_date,
        knownFreeFloatPct: c.free_float_pct,
      }));
    } else {
      // Universe: saham anggota LQ45, ditarik lewat screener — bukan hardcode.
      const universeRes = await screenCompanies({
        where: "sub_sector IS NOT NULL",
        orderBy: "-market_cap",
        limit: 60,
      });
      apiCalls += 1;
      candidates = universeRes.results.map((c) => ({
        symbol: c.symbol.replace(/\.JK$/i, ""),
        needsMembershipCheck: true,
      }));
    }

    // Vercel Hobby plan mengeksekusi function paling lama 60 detik (plafon
    // keras, terbukti langsung dari FUNCTION_INVOCATION_TIMEOUT di produksi —
    // menaikkan maxDuration lagi nggak akan menolong). Daripada memaksa
    // seluruh ~30 ticker LQ45 masuk satu invocation dan berisiko timeout
    // (gagal total, nol data baru), tiap invocation cuma proses satu batch.
    // Cron jalan 3x/minggu (vercel.json) — index batch mengikuti hari, jadi
    // Senin/Rabu/Jumat masing-masing nutup sepertiga universe, dan satu
    // minggu penuh selalu nyakup semua ticker. ?batch=N override manual buat
    // testing. Ini trade-off sadar: skor derived_scores_daily di satu hari
    // cuma dipersentil-kan atas ticker di batch hari itu (bukan ke-30
    // sekaligus) — lebih sempit dari desain awal PRD, tapi cron yang PASTI
    // selesai lebih penting buat bukti otonom daripada breadth maksimal yang
    // sering gagal total.
    const totalCandidates = candidates.length;
    const BATCH_SIZE = Math.max(1, Math.ceil(totalCandidates / 3));
    const batchParam = req.nextUrl.searchParams.get("batch");
    const batchIndex = batchParam !== null ? Number(batchParam) : dayOfWeekBatchIndex();
    candidates = candidates.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);

    // Registry broker — cache lama, cukup refresh tiap ingest (murah, 1 kredit)
    const registry = await getBrokerRegistry();
    apiCalls += 1;
    const registryMap = new Map(registry.map((b) => [b.code, b]));

    const inputs: TickerInput[] = [];
    const subSectorByTicker = new Map<string, string>();

    let circuitBroken = false;
    const THROTTLE_MS = 350; // jeda proaktif antar ticker — rate limit Sectors terpisah dari kuota kredit, lihat PRD.md bagian 13

    for (const cand of candidates) {
      if (apiCalls >= MAX_API_CALLS_PER_RUN) {
        circuitBroken = true;
        break;
      }
      if (apiCalls > 0) await new Promise((r) => setTimeout(r, THROTTLE_MS));
      const symbol = cand.symbol;
      try {
        let companyName: string;
        let sector: string | null | undefined;
        let subSector: string;
        let listingDate: string;
        let freeFloatPct: number | null;

        if (cand.needsMembershipCheck) {
          // Cek keanggotaan LQ45 DULU (1 kredit, section overview+ownership)
          // sebelum narik data lain — kandidat non-LQ45 nggak boleh nyeret 4
          // panggilan tambahan yang percuma. Lihat PRD.md bagian 6, "aturan
          // hemat". ownership disatukan di panggilan yang sama (bukan
          // panggilan terpisah) supaya backfill listing_date/free_float_pct
          // nggak nambah kredit di luar yang memang sudah wajib.
          const report = await getCompanyReport(symbol, ["overview", "ownership"]);
          apiCalls += 1;
          if (!report.overview.indices?.includes("LQ45")) continue;
          companyName = report.company_name;
          sector = report.overview.sector;
          subSector = report.overview.sub_sector;
          listingDate = report.overview.listing_date;
          freeFloatPct = extractFreeFloatPct(report.ownership);
        } else {
          companyName = cand.knownName!;
          sector = cand.knownSector;
          subSector = cand.knownSubSector!;
          listingDate = cand.knownListingDate!;
          freeFloatPct = cand.knownFreeFloatPct ?? null;
        }

        const [daily, brokerSummary, corpActions, filings] = await Promise.all([
          getDailyTransactions(symbol),
          getBrokerSummary(symbol),
          getCorporateActions(symbol),
          getFilings(symbol, { limit: 30 }),
        ]);
        apiCalls += 4;

        await db.from("companies").upsert({
          ticker: symbol,
          name: companyName,
          sector,
          sub_sector: subSector,
          is_lq45: true,
          listing_date: listingDate,
          free_float_pct: freeFloatPct,
          updated_at: new Date().toISOString(),
        });

        const prices = daily.map((d) => ({ date: d.date, close: d.close, volume: d.volume, marketCap: d.market_cap }));
        await db.from("price_daily").upsert(
          prices.map((p) => ({ ticker: symbol, date: p.date, close: p.close, volume: p.volume, market_cap: p.marketCap }))
        );

        const brokerFlow = brokerSummary.data.map((day) => {
          let institutionalValue = 0;
          let totalValue = 0;
          let netForeignBuy = 0;
          for (const row of day.summary) {
            const broker = registryMap.get(row.broker_code);
            if (!broker || broker.cohort === "unknown" || broker.cohort === null) continue; // jangan diasumsikan salah satu — lihat PRD bagian 4
            totalValue += row.bval + row.sval;
            if (broker.cohort === "institutional") institutionalValue += row.bval + row.sval;
            if (broker.is_foreign) netForeignBuy += row.nval;
          }
          return { date: day.date, netForeignBuy, institutionalValue, totalValue };
        });
        await db.from("broker_flow_daily").upsert(
          brokerFlow.map((f) => ({
            ticker: symbol,
            date: f.date,
            net_foreign_buy: f.netForeignBuy,
            institutional_value: f.institutionalValue,
            total_value: f.totalValue,
            excluded_corporate_action: false,
          }))
        );

        const corporateActions: CorporateAction[] = [
          ...(corpActions.corporate_actions.split ?? []).map((s) => ({
            date: s.date,
            type: "split" as const,
            description: `Stock split ${s.ratio}`,
          })),
          ...(corpActions.corporate_actions.rights_issue ?? []).map((r) => ({
            date: r.date,
            type: "rights_issue" as const,
            description: `Rights issue ${r.ratio}`,
          })),
        ];

        const asOfDate = new Date().toISOString().slice(0, 10);
        const insiderSignals = computeInsiderSignal(filings.results, asOfDate);
        if (insiderSignals.length > 0) {
          await db.from("insider_signal_daily").upsert(
            insiderSignals.map((s) => ({ ticker: symbol, date: s.date, signal: s.signal }))
          );
        }

        inputs.push({
          ticker: symbol,
          freeFloatPct,
          listingDate,
          prices,
          brokerFlow,
          insiderSignals,
          corporateActions,
        });
        subSectorByTicker.set(symbol, subSector);
      } catch (err) {
        errors.push({ ticker: symbol, message: err instanceof Error ? err.message : String(err) });
      }
    }

    const asOfDate = new Date().toISOString().slice(0, 10);
    const { scored, excluded } = scoreUniverse(inputs, asOfDate);

    if (scored.length > 0) {
      await db.from("derived_scores_daily").upsert(
        scored.map((s) => ({
          ticker: s.ticker,
          date: s.date,
          smfi_score: s.smfi,
          divergence_delta: s.divergenceDelta,
          confluence_label: s.confluence,
          flow_pctl: s.percentiles.flowPctl,
          institutional_pctl: s.percentiles.institutionalPctl,
          turnover_pctl: s.percentiles.turnoverPctl,
          insider_pctl: s.percentiles.insiderPctl,
          computed_at: new Date().toISOString(),
        }))
      );
    }

    // Sector Rotation Heatmap — PRD.md bagian 5. NOL panggilan API tambahan,
    // dihitung ulang dari price_daily yang udah ditarik di atas.
    const snapshots: StockSnapshot[] = inputs
      .map((inp) => {
        const subSector = subSectorByTicker.get(inp.ticker);
        if (!subSector) return null;
        return {
          ticker: inp.ticker,
          subSector,
          closes: inp.prices.map((p) => ({ date: p.date, close: p.close, marketCap: p.marketCap })),
        };
      })
      .filter((s): s is StockSnapshot => s !== null);

    const rotation = computeSectorRotation(snapshots);
    if (rotation.length > 0) {
      await db.from("sector_rotation_daily").upsert(
        rotation.map((r) => ({
          sub_sector: r.subSector,
          date: asOfDate,
          breadth: r.breadth,
          momentum: r.momentum,
          money_flow: r.moneyFlow,
          label: r.label,
        }))
      );
    }

    await db.from("ingestion_runs").insert({
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      tickers_processed: inputs.length,
      api_calls: apiCalls,
      status: circuitBroken ? "partial" : errors.length === 0 ? "success" : inputs.length > 0 ? "partial" : "failed",
      errors: { items: errors, excluded, circuitBroken },
    });

    if (circuitBroken) {
      // TODO: kirim notifikasi Telegram ke ADMIN_TELEGRAM_CHAT_ID kalau bot
      // sudah dipasang (fitur pendukung, lihat PRD.md bagian 3). Sampai itu
      // ada, admin wajib cek ingestion_runs manual kalau status = partial.
      console.warn(`Ingest berhenti di ${apiCalls} panggilan (ambang ${MAX_API_CALLS_PER_RUN})`);
    }

    return NextResponse.json({
      ok: true,
      mode: useCache ? "cached" : "discover",
      batchIndex,
      batchSize: BATCH_SIZE,
      totalCandidates,
      candidates: candidates.length,
      scored: scored.length,
      excluded: excluded.length,
      errors: errors.length,
      apiCalls,
      circuitBroken,
    });
  } catch (err) {
    await db.from("ingestion_runs").insert({
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      tickers_processed: 0,
      api_calls: apiCalls,
      status: "failed",
      errors: { fatal: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ ok: false, error: "ingest gagal, lihat ingestion_runs" }, { status: 500 });
  }
}
