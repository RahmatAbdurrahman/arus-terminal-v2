/**
 * Backtest sederhana — versi hemat kredit, 6 ticker representatif
 * (bukan semua 30). Lihat PRD.md bagian 3, 12, 18.
 *
 * Biaya: per ticker — 1 panggilan `daily` (range 90 hari, TETAP 1 kredit
 * berapa pun lebar range-nya) + ~7 panggilan `broker-summary` (maks 14
 * hari per panggilan) = ~8 kredit/ticker × 6 ticker ≈ 48 kredit.
 *
 * Jalankan: npx tsx scripts/backtest.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDailyTransactions, getBrokerSummary, getBrokerRegistry } from "../lib/sectors/client";
import { runBacktest } from "../lib/formulas/backtest";
import { supabaseAdmin } from "../lib/supabase/server";

const SAMPLE_TICKERS = ["BMRI", "AMRT", "ADRO", "ANTM", "TLKM", "GOTO"]; // lintas 6 sektor beda, spread SMFI 19-86

async function fetchNinetyDayBrokerFlow(symbol: string, registryMap: Map<string, { is_foreign: boolean; cohort: string | null }>) {
  const end = new Date();
  const windows: { start: string; end: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const winEnd = new Date(end);
    winEnd.setDate(winEnd.getDate() - i * 14);
    const winStart = new Date(winEnd);
    winStart.setDate(winStart.getDate() - 13);
    windows.push({ start: winStart.toISOString().slice(0, 10), end: winEnd.toISOString().slice(0, 10) });
  }

  const results: { date: string; netForeignBuy: number; institutionalValue: number; totalValue: number }[] = [];
  for (const w of windows) {
    const res = await getBrokerSummary(symbol, w);
    for (const day of res.data) {
      let institutionalValue = 0;
      let totalValue = 0;
      let netForeignBuy = 0;
      for (const row of day.summary) {
        const broker = registryMap.get(row.broker_code);
        if (!broker || broker.cohort === "unknown" || broker.cohort === null) continue;
        totalValue += row.bval + row.sval;
        if (broker.cohort === "institutional") institutionalValue += row.bval + row.sval;
        if (broker.is_foreign) netForeignBuy += row.nval;
      }
      results.push({ date: day.date, netForeignBuy, institutionalValue, totalValue });
    }
    await new Promise((r) => setTimeout(r, 350)); // throttle proaktif, sama kayak /api/cron/ingest
  }
  results.sort((a, b) => a.date.localeCompare(b.date));
  // Buang duplikat tanggal dari window yang overlap
  const seen = new Set<string>();
  return results.filter((r) => (seen.has(r.date) ? false : (seen.add(r.date), true)));
}

async function main() {
  console.log(`Backtest ${SAMPLE_TICKERS.length} ticker, ~90 hari histori. Estimasi ~48 kredit.`);

  const registry = await getBrokerRegistry();
  const registryMap = new Map(registry.map((b) => [b.code, { is_foreign: b.is_foreign, cohort: b.cohort }]));

  const history = [];
  for (const ticker of SAMPLE_TICKERS) {
    console.log(`Narik histori ${ticker}...`);
    const daily = await getDailyTransactions(ticker, {
      start: new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10),
      end: new Date().toISOString().slice(0, 10),
    });
    const brokerFlow = await fetchNinetyDayBrokerFlow(ticker, registryMap);

    history.push({
      ticker,
      prices: daily.map((d) => ({ date: d.date, close: d.close, volume: d.volume, marketCap: d.market_cap })),
      brokerFlow,
      freeFloatPct: null,
    });
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log("Menjalankan backtest...");
  const { observations, summary } = runBacktest(history, 60);

  console.log(`\nHasil: ${summary.nObservations} observasi, ${summary.nAboveThreshold} di atas SMFI ${summary.smfiThreshold}`);
  console.log(`Rata-rata return 10 hari (SMFI >= ${summary.smfiThreshold}): ${summary.avgForwardReturnAboveThreshold.toFixed(2)}%`);
  console.log(`Rata-rata return 10 hari (semua observasi):        ${summary.avgForwardReturnBaseline.toFixed(2)}%`);

  const db = supabaseAdmin();
  await db.from("backtest_results").insert({
    tickers_sampled: SAMPLE_TICKERS,
    n_observations: summary.nObservations,
    smfi_threshold: summary.smfiThreshold,
    n_above_threshold: summary.nAboveThreshold,
    avg_forward_return_above: summary.avgForwardReturnAboveThreshold,
    avg_forward_return_baseline: summary.avgForwardReturnBaseline,
    window_days: 90,
    forward_days: 10,
  });

  console.log("\nTersimpan ke backtest_results.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
