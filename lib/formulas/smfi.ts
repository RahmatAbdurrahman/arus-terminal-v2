import { checkEligibility, computeRawComponents } from "./eligibility";
import { percentileRank } from "./percentile";
import {
  ConfluenceLabel,
  Excluded,
  FLOAT_PENALTY_POINTS,
  FLOAT_PENALTY_THRESHOLD_PCT,
  ScoredTicker,
  TickerInput,
} from "./types";

/**
 * Bobot SMFI — PRD.md bagian 4. Kalau sinyal insider nggak tersedia
 * (endpoint filings belum terverifikasi di Fase 0), bobotnya dialihkan
 * ke tiga komponen lain (45/30/25) — BUKAN dipaksa pakai data kosong.
 */
const WEIGHTS_WITH_INSIDER = { flow: 0.4, institutional: 0.3, turnover: 0.2, insider: 0.1 };
const WEIGHTS_WITHOUT_INSIDER = { flow: 0.45, institutional: 0.3, turnover: 0.25, insider: 0 };

function safePctl(v: number): number {
  return Number.isFinite(v) ? v : 0; // komponen yang gagal dihitung tidak boleh menyumbang skor
}

/**
 * Hitung SMFI + Divergence Delta buat SEMUA ticker sekaligus, hari yang sama.
 * Ini fungsi utama yang dipanggil cron ingest tiap siklus — persentil
 * cuma masuk akal dihitung lintas seluruh universe pada hari yang sama,
 * jadi tidak ada versi "per ticker" yang berdiri sendiri.
 */
export function scoreUniverse(
  inputs: TickerInput[],
  asOfDate: string
): { scored: ScoredTicker[]; excluded: Excluded[] } {
  const excluded: Excluded[] = [];
  const eligible: { input: TickerInput; raw: ReturnType<typeof computeRawComponents> }[] = [];

  for (const input of inputs) {
    const reason = checkEligibility(input, asOfDate);
    if (reason) {
      excluded.push(reason);
      continue;
    }
    eligible.push({ input, raw: computeRawComponents(input) });
  }

  const hasInsiderData = eligible.some((e) => e.raw.insiderSignal !== null);
  const weights = hasInsiderData ? WEIGHTS_WITH_INSIDER : WEIGHTS_WITHOUT_INSIDER;

  const pctlFlow = percentileRank(eligible.map((e) => e.raw.flowIntensity));
  const pctlInst = percentileRank(eligible.map((e) => e.raw.institutionalDominance));
  const pctlTurn = percentileRank(eligible.map((e) => e.raw.turnoverRelative));
  const pctlInsider = percentileRank(eligible.map((e) => e.raw.insiderSignal ?? NaN));

  // Divergence Delta butuh persentil 15-hari flow & perubahan harga —
  // dihitung terpisah karena basisnya beda (kumulatif 15 hari, bukan hari ini saja).
  const flow15d = eligible.map((e) => sum15dFlow(e.input));
  const priceChange15d = eligible.map((e) => priceChange15dPct(e.input));
  const pctlFlow15d = percentileRank(flow15d);
  const pctlPriceChange15d = percentileRank(priceChange15d);

  const scored: ScoredTicker[] = eligible.map((e, i) => {
    const smfiRaw =
      weights.flow * safePctl(pctlFlow[i] ?? NaN) +
      weights.institutional * safePctl(pctlInst[i] ?? NaN) +
      weights.turnover * safePctl(pctlTurn[i] ?? NaN) +
      weights.insider * safePctl(pctlInsider[i] ?? NaN);

    const floatPenalty =
      e.input.freeFloatPct !== null && e.input.freeFloatPct < FLOAT_PENALTY_THRESHOLD_PCT
        ? FLOAT_PENALTY_POINTS
        : 0;

    const smfi = clamp(Math.round(smfiRaw - floatPenalty), 0, 100);

    const divergenceDelta = Math.round(
      safePctl(pctlFlow15d[i] ?? NaN) - safePctl(pctlPriceChange15d[i] ?? NaN)
    );

    return {
      ticker: e.input.ticker,
      date: asOfDate,
      raw: e.raw,
      percentiles: {
        // percentileRank() sudah 0-100 (lihat percentile.ts) — JANGAN dikali 100 lagi.
        flowPctl: Math.round(safePctl(pctlFlow[i] ?? NaN)),
        institutionalPctl: Math.round(safePctl(pctlInst[i] ?? NaN)),
        turnoverPctl: Math.round(safePctl(pctlTurn[i] ?? NaN)),
        insiderPctl: hasInsiderData ? Math.round(safePctl(pctlInsider[i] ?? NaN)) : null,
      },
      smfi,
      divergenceDelta,
      confluence: confluenceLabel(smfi, divergenceDelta),
    };
  });

  return { scored, excluded };
}

/** PRD.md bagian 4 — tabel sinyal gabungan (confluence read). */
export function confluenceLabel(smfi: number, divergenceDelta: number): ConfluenceLabel {
  if (divergenceDelta < -15) return "distribusi";
  if (smfi >= 65 && divergenceDelta >= 45) return "akumulasi_senyap";
  if (smfi >= 55 && divergenceDelta < 20) return "sudah_di_harga";
  return "sinyal_sedang";
}

function sum15dFlow(input: TickerInput): number {
  const last15 = input.brokerFlow.slice(-15);
  if (last15.length === 0) return NaN;
  const totalFlow = last15.reduce((a, f) => a + f.netForeignBuy, 0);
  const latestPrice = input.prices[input.prices.length - 1];
  if (!latestPrice || latestPrice.marketCap <= 0) return NaN;
  return totalFlow / latestPrice.marketCap; // dinormalisasi, biar sebanding lintas ukuran perusahaan
}

function priceChange15dPct(input: TickerInput): number {
  const last15 = input.prices.slice(-15);
  const first = last15[0];
  const latest = last15[last15.length - 1];
  if (!first || !latest || first.close <= 0) return NaN;
  return (latest.close - first.close) / first.close;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
