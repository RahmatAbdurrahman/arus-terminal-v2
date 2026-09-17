import { describe, expect, it } from "vitest";
import { validate, ExplainInput } from "../gemini";

const input: ExplainInput = { ticker: "ANTM", smfi: 78, divergenceDelta: 62, confluence: "akumulasi_senyap" };

describe("validate — lapisan AI, PRD.md bagian 9", () => {
  it("menerima narasi bersih yang cuma pakai angka dari input", () => {
    expect(validate("ANTM punya SMFI 78, menandakan arus asing cukup kuat dibanding biasanya.", input)).toBe(true);
  });

  it("menolak narasi yang mengandung kata terlarang", () => {
    expect(validate("Sebaiknya kamu beli ANTM sekarang karena SMFI 78.", input)).toBe(false);
    expect(validate("Ini rekomendasi kuat buat ANTM.", input)).toBe(false);
  });

  it("menolak narasi yang menyebut angka baru yang tidak ada di input", () => {
    expect(validate("ANTM naik 15% hari ini dengan SMFI 78.", input)).toBe(false);
  });

  it("menolak narasi yang kepanjangan atau kosong", () => {
    expect(validate("x".repeat(600), input)).toBe(false);
    expect(validate("pendek", input)).toBe(false);
  });

  it("menolak narasi yang membalik arah divergence", () => {
    const negatif: ExplainInput = { ...input, divergenceDelta: -30 };
    // divergence negatif = harga duluan gerak, bukan arus
    expect(validate("Arus di ANTM lebih dulu mendahului pergerakan harga.", negatif)).toBe(false);
  });

  it("menerima angka negatif divergence yang ditulis sebagai nilai absolut", () => {
    const negatif: ExplainInput = { ...input, divergenceDelta: -30 };
    expect(validate("ANTM punya divergence delta -30, harga sudah bergerak lebih dulu.", negatif)).toBe(true);
  });
});
