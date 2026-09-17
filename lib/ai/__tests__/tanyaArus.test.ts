import { describe, expect, it } from "vitest";
import { isValidFilter } from "../tanyaArus";

describe("isValidFilter — pagar sebelum filter dipakai query DB", () => {
  it("menerima filter kosong (semua null)", () => {
    expect(isValidFilter({ subSector: null, minSmfi: null, minDivergenceDelta: null, confluence: null })).toBe(true);
  });

  it("menerima filter lengkap yang valid", () => {
    expect(isValidFilter({ subSector: "Banks", minSmfi: 60, minDivergenceDelta: 20, confluence: "akumulasi_senyap" })).toBe(true);
  });

  it("menolak minSmfi di luar rentang 0-100", () => {
    expect(isValidFilter({ subSector: null, minSmfi: 150, minDivergenceDelta: null, confluence: null })).toBe(false);
    expect(isValidFilter({ subSector: null, minSmfi: -5, minDivergenceDelta: null, confluence: null })).toBe(false);
  });

  it("menolak confluence yang bukan salah satu dari 4 label valid", () => {
    expect(isValidFilter({ subSector: null, minSmfi: null, minDivergenceDelta: null, confluence: "bukan_label_valid" })).toBe(false);
  });

  it("menolak bentuk yang sama sekali bukan objek", () => {
    expect(isValidFilter(null)).toBe(false);
    expect(isValidFilter("string")).toBe(false);
    expect(isValidFilter(42)).toBe(false);
  });
});
