/**
 * Tipe data buat rules engine ARUS Terminal.
 * Lihat PRD.md bagian 4 buat spesifikasi lengkap tiap formula.
 */

export interface DailyBar {
  date: string; // YYYY-MM-DD
  close: number;
  volume: number;
  marketCap: number;
}

export interface BrokerFlowDay {
  date: string; // YYYY-MM-DD
  netForeignBuy: number; // IDR, bisa negatif (net sell)
  institutionalValue: number; // IDR, nilai transaksi broker cohort='institutional'
  totalValue: number; // IDR, total nilai transaksi hari itu (semua broker)
}

export interface InsiderSignalDay {
  date: string;
  signal: 1 | 0.5 | 0; // 1 = net-buy, 0.5 = netral, 0 = net-sell
}

export interface CorporateAction {
  date: string;
  type: "split" | "rights_issue" | "bonus_share" | "dividend" | "agm";
  description: string;
}

/** Input mentah satu ticker, siap dipakai rules engine. */
export interface TickerInput {
  ticker: string;
  freeFloatPct: number | null;
  listingDate: string; // buat cek kasus tepi "IPO < 20 hari"
  prices: DailyBar[]; // urut tanggal menaik, minimal 20 hari buat baseline turnover
  brokerFlow: BrokerFlowDay[]; // sejajar tanggal dengan prices idealnya
  insiderSignals: InsiderSignalDay[]; // opsional — kosong kalau endpoint filings belum terverifikasi
  corporateActions: CorporateAction[];
}

export type ExclusionReason =
  | "corporate_action"
  | "insufficient_history"
  | "insufficient_liquidity"
  | "broker_data_unavailable";

export interface Excluded {
  ticker: string;
  reason: ExclusionReason;
  detail: string;
}

export interface ComponentScores {
  flowIntensity: number; // net_foreign_buy / rata-rata turnover 20 hari, sebelum di-persentil-kan
  institutionalDominance: number; // 0-1, sebelum di-persentil-kan
  turnoverRelative: number; // volume hari ini / rata-rata 20 hari, sebelum di-persentil-kan
  insiderSignal: number | null; // null kalau data insider nggak tersedia
}

export interface ScoredTicker {
  ticker: string;
  date: string;
  raw: ComponentScores;
  smfi: number; // 0-100, setelah persentil + bobot + penalti float
  divergenceDelta: number; // -100..100
  confluence: ConfluenceLabel;
}

export type ConfluenceLabel =
  | "akumulasi_senyap" // SMFI tinggi, divergence tinggi
  | "sudah_di_harga" // SMFI tinggi, divergence rendah
  | "distribusi" // divergence negatif kuat
  | "sinyal_sedang"; // selain di atas

export const MIN_HISTORY_DAYS = 20;
export const MIN_AVG_TURNOVER_IDR = 500_000_000; // lantai likuiditas — lihat PRD bagian 4, "kasus tepi"
export const FLOAT_PENALTY_THRESHOLD_PCT = 15;
export const FLOAT_PENALTY_POINTS = 8; // dikurangi langsung dari SMFI final
