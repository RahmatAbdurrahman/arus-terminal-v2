import { describe, expect, it } from "vitest";
import { computeSectorRotation, StockSnapshot } from "../sectorRotation";

function makeClimbing(ticker: string, subSector: string, startPrice: number, days = 25): StockSnapshot {
  const closes = [];
  const base = new Date("2026-08-31T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const close = startPrice + i * (startPrice * 0.01);
    closes.push({ date: d.toISOString().slice(0, 10), close, marketCap: close * 1e9 });
  }
  return { ticker, subSector, closes };
}

function makeFlat(ticker: string, subSector: string, price: number, days = 25): StockSnapshot {
  const closes = [];
  const base = new Date("2026-08-31T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    closes.push({ date: d.toISOString().slice(0, 10), close: price, marketCap: price * 1e9 });
  }
  return { ticker, subSector, closes };
}

describe("computeSectorRotation", () => {
  it("subsektor yang naik terus dapat breadth & momentum tinggi", () => {
    const rows = computeSectorRotation([
      makeClimbing("A", "Banks", 1000),
      makeClimbing("B", "Banks", 2000),
      makeFlat("C", "Retail", 500),
      makeFlat("D", "Retail", 800),
    ]);

    const banks = rows.find((r) => r.subSector === "Banks")!;
    const retail = rows.find((r) => r.subSector === "Retail")!;

    expect(banks.breadth).toBe(100); // semua di atas MA20 karena naik terus
    expect(banks.momentum).toBeGreaterThan(0);
    expect(banks.compositeScore).toBeGreaterThan(retail.compositeScore);
  });

  it("mengecualikan saham dengan histori < 20 hari, bukan mengikutsertakan dengan data kosong", () => {
    const rows = computeSectorRotation([makeClimbing("A", "New", 1000, 10)]);
    expect(rows.find((r) => r.subSector === "New")).toBeUndefined();
  });

  it("tidak pernah menghasilkan NaN pada composite score", () => {
    const rows = computeSectorRotation([makeClimbing("A", "Solo", 1000), makeFlat("B", "Solo2", 500)]);
    rows.forEach((r) => expect(Number.isNaN(r.compositeScore)).toBe(false));
  });

  it("label termasuk salah satu dari 4 kategori yang valid", () => {
    const rows = computeSectorRotation([makeClimbing("A", "X", 1000), makeFlat("B", "Y", 500)]);
    rows.forEach((r) => expect(["Hot", "Warming", "Cold", "Distribution"]).toContain(r.label));
  });
});
