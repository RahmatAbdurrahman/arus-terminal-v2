/**
 * Isi Supabase dengan data contoh — SAMA dengan yang dipakai mockup/index.html,
 * biar app asli dan mockup konsisten pas didiskusikan ke tim.
 *
 * Jalankan: npx tsx scripts/seed-fixtures.ts
 * (butuh NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY di .env.local)
 */
import { config } from "dotenv";
// next tidak auto-load .env.local di luar runtime Next — muat manual di sini
config({ path: ".env.local" });

import { supabaseAdmin } from "../lib/supabase/server";
import { scoreUniverse } from "../lib/formulas/smfi";
import { TickerInput } from "../lib/formulas/types";

const COMPANIES = [
  { ticker: "ANTM", name: "Aneka Tambang", sector: "Basic Materials", sub_sector: "Metals & Minerals", free_float_pct: 35 },
  { ticker: "BBNI", name: "Bank Negara Indonesia", sector: "Financials", sub_sector: "Banks", free_float_pct: 40 },
  { ticker: "PGAS", name: "Perusahaan Gas Negara", sector: "Energy", sub_sector: "Oil, Gas & Coal", free_float_pct: 43 },
  { ticker: "SMGR", name: "Semen Indonesia", sector: "Basic Materials", sub_sector: "Nonmetallic Minerals", free_float_pct: 49 },
  { ticker: "INDF", name: "Indofood Sukses Makmur", sector: "Consumer Non-Cyclicals", sub_sector: "Food & Beverages", free_float_pct: 20 },
];

function makeSeries(startPrice: number, startFlow: number, flowStep: number, days = 25) {
  const prices: TickerInput["prices"] = [];
  const brokerFlow: TickerInput["brokerFlow"] = [];
  const base = new Date("2026-08-31T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    const price = startPrice + i * (startPrice > 5000 ? 8 : 1.5);
    prices.push({ date, close: price, volume: 3_000_000 + i * 50_000, marketCap: price * 3_000_000_000 });
    const flow = startFlow + i * flowStep;
    brokerFlow.push({
      date,
      netForeignBuy: flow,
      institutionalValue: Math.max(flow, 0) * 2.5 + 5e9,
      totalValue: Math.max(flow, 0) * 2.5 + 5e9 + 8e9,
    });
  }
  return { prices, brokerFlow };
}

const RAW: Record<string, ReturnType<typeof makeSeries>> = {
  ANTM: makeSeries(1600, 1.0e9, 0.65e9),
  BBNI: makeSeries(5400, 0.8e9, 0.42e9),
  PGAS: makeSeries(1475, 0.35e9, 0.55e9),
  SMGR: makeSeries(3270, 0.25e9, 0.02e9),
  INDF: makeSeries(7050, -0.4e9, -0.22e9),
};

async function main() {
  const asOfDate = "2026-09-24";
  const inputs: TickerInput[] = COMPANIES.map((c) => {
    const raw = RAW[c.ticker];
    if (!raw) throw new Error(`Data contoh untuk ${c.ticker} tidak ditemukan di RAW`);
    return {
      ticker: c.ticker,
      freeFloatPct: c.free_float_pct,
      listingDate: "2010-01-01",
      prices: raw.prices,
      brokerFlow: raw.brokerFlow,
      insiderSignals: [],
      corporateActions: [],
    };
  });

  const { scored, excluded } = scoreUniverse(inputs, asOfDate);
  console.log(`Dihitung: ${scored.length} skor, ${excluded.length} dikecualikan`);

  const db = supabaseAdmin();

  await db.from("companies").upsert(
    COMPANIES.map((c) => ({ ...c, is_lq45: true, updated_at: new Date().toISOString() }))
  );

  for (const c of COMPANIES) {
    const raw = RAW[c.ticker];
    if (!raw) continue;
    const { prices, brokerFlow } = raw;
    await db.from("price_daily").upsert(
      prices.map((p) => ({ ticker: c.ticker, date: p.date, close: p.close, volume: p.volume, market_cap: p.marketCap }))
    );
    await db.from("broker_flow_daily").upsert(
      brokerFlow.map((f) => ({
        ticker: c.ticker,
        date: f.date,
        net_foreign_buy: f.netForeignBuy,
        institutional_value: f.institutionalValue,
        total_value: f.totalValue,
        excluded_corporate_action: false,
      }))
    );
  }

  await db.from("derived_scores_daily").upsert(
    scored.map((s) => ({
      ticker: s.ticker,
      date: s.date,
      smfi_score: s.smfi,
      divergence_delta: s.divergenceDelta,
      confluence_label: s.confluence,
      computed_at: new Date().toISOString(),
    }))
  );

  await db.from("ingestion_runs").insert({
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    tickers_processed: COMPANIES.length,
    api_calls: 0,
    status: "success",
    errors: { note: "seed data contoh, bukan dari Sectors API sungguhan" },
  });

  console.log("Seed selesai.");
  scored.forEach((s) => console.log(`  ${s.ticker}: SMFI ${s.smfi}, Divergence ${s.divergenceDelta}, ${s.confluence}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
