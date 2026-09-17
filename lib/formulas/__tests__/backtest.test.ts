import { describe, expect, it } from "vitest";
import { runBacktest } from "../backtest";
import { TickerInput } from "../types";

function series(ticker: string, days: number, priceStart: number, priceStep: number, flowStart: number): {
  ticker: string;
  prices: TickerInput["prices"];
  brokerFlow: TickerInput["brokerFlow"];
  freeFloatPct: number | null;
} {
  const prices: TickerInput["prices"] = [];
  const brokerFlow: TickerInput["brokerFlow"] = [];
  const base = new Date("2026-06-01T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    prices.push({ date, close: priceStart + i * priceStep, volume: 2_000_000, marketCap: 5e13 });
    brokerFlow.push({ date, netForeignBuy: flowStart, institutionalValue: 2e10, totalValue: 4e10 });
  }
  return { ticker, prices, brokerFlow, freeFloatPct: 40 };
}

describe("runBacktest", () => {
  it("menghasilkan observasi dan summary yang konsisten (nAboveThreshold <= nObservations)", () => {
    const history = [
      series("A", 60, 1000, 3, 3e9),
      series("B", 60, 2000, 0.5, 0.5e9),
    ];
    const { observations, summary } = runBacktest(history, 60);

    expect(observations.length).toBeGreaterThan(0);
    expect(summary.nObservations).toBe(observations.length);
    expect(summary.nAboveThreshold).toBeLessThanOrEqual(summary.nObservations);
    observations.forEach((o) => {
      expect(Number.isNaN(o.smfi)).toBe(false);
      expect(Number.isNaN(o.forwardReturn10d)).toBe(false);
    });
  });

  it("nggak menghasilkan observasi kalau histori kurang dari lookback+forward window", () => {
    const history = [series("A", 25, 1000, 1, 1e9)]; // 25 hari: 20 lookback + 10 forward = butuh 30
    const { observations } = runBacktest(history);
    expect(observations.length).toBe(0);
  });
});
