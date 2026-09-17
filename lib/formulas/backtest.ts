import { scoreUniverse } from "./smfi";
import { TickerInput } from "./types";

export interface BacktestObservation {
  ticker: string;
  date: string;
  smfi: number;
  forwardReturn10d: number; // % perubahan harga 10 hari bursa ke depan dari tanggal ini
}

export interface BacktestSummary {
  nObservations: number;
  smfiThreshold: number;
  nAboveThreshold: number;
  avgForwardReturnAboveThreshold: number;
  avgForwardReturnBaseline: number; // rata-rata SEMUA observasi, bukan cuma yang di bawah ambang
}

/**
 * Backtest sederhana — PRD.md bagian 3 & 18. Menghitung ulang SMFI di
 * SETIAP hari histori (bukan cuma hari terakhir), lalu bandingkan sama
 * return 10 hari ke depan dari hari itu. Sengaja dijaga sederhana:
 * pooling semua observasi jadi satu angka, bukan model statistik rumit
 * yang susah dipertanggungjawabkan ke juri.
 */
export function runBacktest(
  history: { ticker: string; prices: TickerInput["prices"]; brokerFlow: TickerInput["brokerFlow"]; freeFloatPct: number | null }[],
  smfiThreshold = 60
): { observations: BacktestObservation[]; summary: BacktestSummary } {
  const observations: BacktestObservation[] = [];

  const nDays = history[0]?.prices.length ?? 0;
  const MIN_LOOKBACK = 20; // sama kayak baseline turnover SMFI
  const FORWARD_WINDOW = 10;

  for (let dayIdx = MIN_LOOKBACK; dayIdx < nDays - FORWARD_WINDOW; dayIdx++) {
    const asOfDate = history[0]?.prices[dayIdx]?.date;
    if (!asOfDate) continue;

    const inputs: TickerInput[] = history.map((h) => ({
      ticker: h.ticker,
      freeFloatPct: h.freeFloatPct,
      listingDate: "2010-01-01", // asumsi listing lama — sampel backtest sengaja saham LQ45 mapan
      prices: h.prices.slice(0, dayIdx + 1),
      brokerFlow: h.brokerFlow.filter((f) => f.date <= asOfDate),
      insiderSignals: [],
      corporateActions: [], // disederhanakan buat backtest — bukan dipakai buat skor produksi
    }));

    const { scored } = scoreUniverse(inputs, asOfDate);

    for (const s of scored) {
      const h = history.find((x) => x.ticker === s.ticker);
      const todayPrice = h?.prices[dayIdx];
      const futurePrice = h?.prices[dayIdx + FORWARD_WINDOW];
      if (!todayPrice || !futurePrice || todayPrice.close <= 0) continue;

      const forwardReturn10d = ((futurePrice.close - todayPrice.close) / todayPrice.close) * 100;
      observations.push({ ticker: s.ticker, date: asOfDate, smfi: s.smfi, forwardReturn10d });
    }
  }

  const above = observations.filter((o) => o.smfi >= smfiThreshold);
  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const summary: BacktestSummary = {
    nObservations: observations.length,
    smfiThreshold,
    nAboveThreshold: above.length,
    avgForwardReturnAboveThreshold: avg(above.map((o) => o.forwardReturn10d)),
    avgForwardReturnBaseline: avg(observations.map((o) => o.forwardReturn10d)),
  };

  return { observations, summary };
}
