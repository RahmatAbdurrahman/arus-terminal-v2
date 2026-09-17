/**
 * Tipe respons Sectors API v2 — HANYA untuk endpoint yang sudah
 * diverifikasi langsung ke docs.sectors.app. Lihat PRD.md bagian 6.
 *
 * JANGAN tambah tipe untuk filings/suspensions/sector-report di sini
 * sebelum endpoint-nya dikonfirmasi nyata di Fase 0 — lihat
 * lib/sectors/UNVERIFIED.md.
 */

export interface DailyTransactionRow {
  symbol: string;
  date: string;
  close: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number;
  market_cap: number;
}

export interface BrokerSummaryRow {
  broker_code: string;
  bfreq: number;
  blot: number;
  bval: number;
  bavg_per_share: number;
  sfreq: number;
  slot: number;
  sval: number;
  savg_per_share: number;
  nlot: number;
  nval: number;
  navg_per_share: number;
}

export interface BrokerSummaryDay {
  date: string;
  summary: BrokerSummaryRow[];
}

export interface BrokerSummaryResponse {
  symbol: string;
  start: string;
  end: string;
  data: BrokerSummaryDay[];
}

export interface BrokerRegistryEntry {
  code: string;
  name: string;
  is_foreign: boolean;
  cohort: "institutional" | "mixed" | "retail" | "unknown" | null;
  license_type: string | null;
}

export interface CompanyReportOverview {
  listing_board: string;
  industry: string;
  sub_industry: string;
  sector: string;
  sub_sector: string;
  market_cap: number;
  market_cap_rank: number;
  listing_date: string;
  last_close_price: number;
  latest_close_date: string;
  indices: string[]; // cek "LQ45" di sini buat definisi universe
}

export interface ShareholderRow {
  name: string;
  share_value: number;
  share_amount: number;
  share_percentage: string; // fraksi string, mis. "0.44642" — BUKAN persen (dikali 100 sebelum dipakai)
}

export interface CompanyReportOwnership {
  major_shareholders: ShareholderRow[];
}

export interface CompanyReportResponse {
  symbol: string;
  company_name: string;
  overview: CompanyReportOverview;
  ownership?: CompanyReportOwnership; // hanya ada kalau diminta lewat sections=
  valuation?: Record<string, unknown>;
  financials?: Record<string, unknown>;
}

export interface CorporateActionsResponse {
  symbol: string;
  corporate_actions: {
    agm: { agm_date: string; agm_time: string; agm_place: string; agm_result: string | null }[];
    bonus: unknown;
    warrant: unknown;
    dividend: { ex_date: string; [k: string]: unknown }[];
    split?: { date: string; ratio: string }[];
    rights_issue?: { date: string; ratio: string }[];
  };
}

export interface FullUniverseCloseRow {
  symbol: string;
  date: string;
  close: number;
}

export interface FullUniverseClosePage {
  results: FullUniverseCloseRow[];
  pagination: {
    total_count: number;
    showing: number;
    limit: number;
    offset: number;
    has_next: boolean;
    next_offset: number | null;
  };
}

export interface CompanyScreenerResult {
  symbol: string;
  company_name: string;
  query_values: Record<string, unknown>;
}

export interface CompanyScreenerResponse {
  results: CompanyScreenerResult[];
  pagination: { total_count: number; has_next: boolean; next_offset: number | null };
}

/** Verifikasi 17 Sep 2026 — GET /v2/filings/?symbol={sym}. Lihat UNVERIFIED.md. */
export interface FilingRow {
  title: string;
  timestamp: string; // ISO datetime
  symbol: string; // "BBCA.JK"
  transaction_type: "buy" | "sell" | string;
  holder_type: "insider" | string;
  holder_name: string;
  transaction_value: number;
  amount_transaction: number;
  price: number;
}

export interface FilingsResponse {
  results: FilingRow[];
  pagination: { total_count: number; has_next: boolean; next_offset: number | null };
}

/** Verifikasi 17 Sep 2026 — GET /v2/suspensions/?symbol={sym}. */
export interface SuspensionRow {
  symbol: string;
  suspension_date: string;
  reason: string;
  pdf_url: string;
}

export interface SuspensionsResponse {
  results: SuspensionRow[];
  pagination: { total_count: number; has_next: boolean; next_offset: number | null };
}

/** Verifikasi 17 Sep 2026 — GET /v2/subsector/report/{slug}/ (path param, bukan query). */
export interface SubsectorReportResponse {
  sector: string;
  sub_sector: string;
  statistics: {
    total_companies: number;
    filtered_median_pe: number;
    filtered_weighted_avg_pe: number;
    min_company_pe: number;
    max_company_pe: number;
  };
  market_cap: { total_market_cap: number; avg_market_cap: number };
}
