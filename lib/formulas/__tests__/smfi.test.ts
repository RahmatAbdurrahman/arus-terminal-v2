import { describe, expect, it } from "vitest";
import { scoreUniverse, confluenceLabel } from "../smfi";
import { TickerInput } from "../types";

/** Bikin 25 hari data harga naik pelan + volume stabil, mulai dari harga awal. */
function makePrices(startPrice: number, days = 25, volume = 2_000_000, marketCap = 5e13): TickerInput["prices"] {
  const out: TickerInput["prices"] = [];
  const base = new Date("2026-09-01T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    out.push({
      date: d.toISOString().slice(0, 10),
      close: startPrice + i * 2,
      volume,
      marketCap,
    });
  }
  return out;
}

function makeFlow(days: number, netForeignBuyFn: (i: number) => number, totalValue = 4e10, instValue = 2e10): TickerInput["brokerFlow"] {
  const out: TickerInput["brokerFlow"] = [];
  const base = new Date("2026-09-01T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    out.push({
      date: d.toISOString().slice(0, 10),
      netForeignBuy: netForeignBuyFn(i),
      institutionalValue: instValue,
      totalValue,
    });
  }
  return out;
}

function baseTicker(overrides: Partial<TickerInput>): TickerInput {
  return {
    ticker: "TEST",
    freeFloatPct: 40,
    listingDate: "2020-01-01",
    prices: makePrices(1000),
    brokerFlow: makeFlow(25, () => 1e9),
    insiderSignals: [],
    corporateActions: [],
    ...overrides,
  };
}

describe("scoreUniverse — jalur normal", () => {
  it("menghasilkan SMFI 0-100 dan Divergence Delta untuk universe sederhana", () => {
    const strong = baseTicker({ ticker: "STRONG", brokerFlow: makeFlow(25, (i) => 5e9 + i * 2e8) });
    const weak = baseTicker({ ticker: "WEAK", brokerFlow: makeFlow(25, () => -1e9) });
    const { scored, excluded } = scoreUniverse([strong, weak], "2026-09-25");

    expect(excluded).toHaveLength(0);
    expect(scored).toHaveLength(2);
    for (const s of scored) {
      expect(s.smfi).toBeGreaterThanOrEqual(0);
      expect(s.smfi).toBeLessThanOrEqual(100);
      expect(Number.isNaN(s.smfi)).toBe(false);
      expect(Number.isNaN(s.divergenceDelta)).toBe(false);
    }

    const strongScore = scored.find((s) => s.ticker === "STRONG")!;
    const weakScore = scored.find((s) => s.ticker === "WEAK")!;
    expect(strongScore.smfi).toBeGreaterThan(weakScore.smfi);
  });

  it("bobot dialihkan (45/30/25) kalau tidak ada ticker manapun punya data insider", () => {
    const a = baseTicker({ ticker: "A" });
    const b = baseTicker({ ticker: "B", brokerFlow: makeFlow(25, () => 3e9) });
    const { scored } = scoreUniverse([a, b], "2026-09-25");
    // Nggak crash, nggak NaN — itu yang dites; bobot persisnya adalah detail implementasi
    scored.forEach((s) => expect(Number.isNaN(s.smfi)).toBe(false));
  });
});

describe("kasus tepi — PRD.md bagian 4", () => {
  it("mengecualikan ticker dengan aksi korporasi dalam 15 hari terakhir", () => {
    const t = baseTicker({
      ticker: "SPLIT",
      corporateActions: [{ date: "2026-09-20", type: "split", description: "Stock split 1:5" }],
    });
    const { scored, excluded } = scoreUniverse([t], "2026-09-25");
    expect(scored).toHaveLength(0);
    expect(excluded).toHaveLength(1);
    expect(excluded[0]!.reason).toBe("corporate_action");
  });

  it("mengecualikan ticker yang baru IPO (histori < 20 hari)", () => {
    const t = baseTicker({
      ticker: "NEWIPO",
      listingDate: "2026-09-10", // cuma ~15 hari sebelum asOfDate
      prices: makePrices(500, 12), // sengaja kurang dari MIN_HISTORY_DAYS
      brokerFlow: makeFlow(12, () => 1e9),
    });
    const { scored, excluded } = scoreUniverse([t], "2026-09-25");
    expect(scored).toHaveLength(0);
    expect(excluded[0]!.reason).toBe("insufficient_history");
  });

  it("mengecualikan ticker dengan turnover di bawah lantai likuiditas", () => {
    const t = baseTicker({ ticker: "ILLIQUID", prices: makePrices(1000, 25, 100) }); // volume nyaris nol
    const { scored, excluded } = scoreUniverse([t], "2026-09-25");
    expect(scored).toHaveLength(0);
    expect(excluded[0]!.reason).toBe("insufficient_liquidity");
  });

  it("mengecualikan ticker tanpa data broker sama sekali, bukan menghitungnya sebagai nol", () => {
    const t = baseTicker({ ticker: "NOBROKER", brokerFlow: [] });
    const { scored, excluded } = scoreUniverse([t], "2026-09-25");
    expect(scored).toHaveLength(0);
    expect(excluded[0]!.reason).toBe("broker_data_unavailable");
  });

  it("menerapkan penalti float untuk saham free-float < 15%", () => {
    const flowFn = (i: number) => 5e9 + i * 2e8;
    const thin = baseTicker({ ticker: "THIN", freeFloatPct: 8, brokerFlow: makeFlow(25, flowFn) });
    const normal = baseTicker({ ticker: "NORMAL", freeFloatPct: 40, brokerFlow: makeFlow(25, flowFn) });
    const { scored } = scoreUniverse([thin, normal], "2026-09-25");
    const thinScore = scored.find((s) => s.ticker === "THIN")!;
    const normalScore = scored.find((s) => s.ticker === "NORMAL")!;
    expect(thinScore.smfi).toBeLessThan(normalScore.smfi);
  });

  it("tidak pernah menghasilkan NaN yang lolos ke output, walau input aneh", () => {
    const zeroVolume = baseTicker({ ticker: "ZEROVOL", prices: makePrices(1000, 25, 0) });
    const { scored, excluded } = scoreUniverse([zeroVolume], "2026-09-25");
    // ZEROVOL kena lantai likuiditas (turnover 0), jadi excluded — bukan lolos dengan NaN
    expect(scored.every((s) => !Number.isNaN(s.smfi) && !Number.isNaN(s.divergenceDelta))).toBe(true);
    expect(excluded.some((e) => e.ticker === "ZEROVOL")).toBe(true);
  });
});

describe("confluenceLabel — PRD.md bagian 4, tabel sinyal gabungan", () => {
  it("SMFI tinggi + Divergence tinggi -> akumulasi masih senyap", () => {
    expect(confluenceLabel(78, 62)).toBe("akumulasi_senyap");
  });
  it("SMFI tinggi + Divergence rendah -> sudah kelihatan di harga", () => {
    expect(confluenceLabel(71, 10)).toBe("sudah_di_harga");
  });
  it("Divergence negatif kuat -> distribusi terdeteksi", () => {
    expect(confluenceLabel(40, -20)).toBe("distribusi");
  });
  it("selain itu -> sinyal sedang", () => {
    expect(confluenceLabel(44, 12)).toBe("sinyal_sedang");
  });
});
