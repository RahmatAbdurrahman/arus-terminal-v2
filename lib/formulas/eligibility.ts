import { mean } from "./percentile";
import {
  ComponentScores,
  Excluded,
  MIN_AVG_TURNOVER_IDR,
  MIN_HISTORY_DAYS,
  TickerInput,
} from "./types";

/**
 * Kasus tepi wajib — PRD.md bagian 4, "Kasus tepi — wajib ditangani".
 * Cek ini SEBELUM ticker masuk perhitungan SMFI/Divergence. Kalau
 * dikecualikan, jangan dipaksa dihitung dengan data yang nggak lengkap —
 * itu yang bikin skor jadi NaN atau menyesatkan.
 */
export function checkEligibility(input: TickerInput, asOfDate: string): Excluded | null {
  // 1) Aksi korporasi di window yang relevan (15 hari terakhir dari asOfDate)
  const windowStart = daysBefore(asOfDate, 15);
  const recentAction = input.corporateActions.find(
    (a) => a.date >= windowStart && a.date <= asOfDate
  );
  if (recentAction) {
    return {
      ticker: input.ticker,
      reason: "corporate_action",
      detail: `${recentAction.type}: ${recentAction.description} (${recentAction.date})`,
    };
  }

  // 2) IPO baru — histori belum cukup buat baseline turnover 20 hari
  const listingAgeDays = daysBetween(input.listingDate, asOfDate);
  if (listingAgeDays < MIN_HISTORY_DAYS || input.prices.length < MIN_HISTORY_DAYS) {
    return {
      ticker: input.ticker,
      reason: "insufficient_history",
      detail: `Baru listing ${listingAgeDays} hari / histori harga ${input.prices.length} baris — minimal ${MIN_HISTORY_DAYS} hari`,
    };
  }

  // 3) Lantai likuiditas — saham nyaris nggak ditransaksikan bikin rasio meledak dari noise
  const last20 = input.prices.slice(-MIN_HISTORY_DAYS);
  const avgTurnover = mean(last20.map((b) => b.close * b.volume));
  if (avgTurnover === null || avgTurnover < MIN_AVG_TURNOVER_IDR) {
    return {
      ticker: input.ticker,
      reason: "insufficient_liquidity",
      detail: `Rata-rata turnover 20 hari Rp${Math.round(avgTurnover ?? 0).toLocaleString("id-ID")} — di bawah lantai Rp${MIN_AVG_TURNOVER_IDR.toLocaleString("id-ID")}`,
    };
  }

  // 4) Data broker sama sekali nggak ada buat window ini
  if (input.brokerFlow.length === 0) {
    return {
      ticker: input.ticker,
      reason: "broker_data_unavailable",
      detail: "Tidak ada baris broker-summary untuk ticker ini di window yang diminta",
    };
  }

  return null;
}

/**
 * Hitung komponen mentah (SEBELUM di-persentil-kan lintas universe).
 * Persentil-nya sendiri baru bisa dihitung di lapisan yang melihat SEMUA
 * ticker sekaligus — lihat scoreUniverse() di smfi.ts.
 */
export function computeRawComponents(input: TickerInput): ComponentScores {
  const last20 = input.prices.slice(-MIN_HISTORY_DAYS);
  const avgTurnover20 = mean(last20.map((b) => b.close * b.volume)) ?? 0;
  const avgVolume20 = mean(last20.map((b) => b.volume)) ?? 0;

  const todayFlow = input.brokerFlow[input.brokerFlow.length - 1];
  const todayPrice = input.prices[input.prices.length - 1];

  const flowIntensity = avgTurnover20 > 0 ? (todayFlow?.netForeignBuy ?? 0) / avgTurnover20 : NaN;

  // Broker dengan cohort 'unknown' sudah dikeluarkan dari totalValue di lapisan
  // ingest (lihat lib/sectors) — jadi institutionalValue/totalValue di sini aman
  // dibaca langsung, bukan diasumsikan.
  const institutionalDominance =
    todayFlow && todayFlow.totalValue > 0 ? todayFlow.institutionalValue / todayFlow.totalValue : NaN;

  const turnoverRelative = avgVolume20 > 0 ? (todayPrice?.volume ?? 0) / avgVolume20 : NaN;

  const latestInsider = input.insiderSignals[input.insiderSignals.length - 1];
  const insiderSignal = latestInsider ? latestInsider.signal : null;

  return { flowIntensity, institutionalDominance, turnoverRelative, insiderSignal };
}

function daysBefore(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T00:00:00Z").getTime();
  const b = new Date(to + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86_400_000);
}
