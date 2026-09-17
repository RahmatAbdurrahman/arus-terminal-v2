/**
 * Wrapper tipis di atas Sectors API v2 — HANYA endpoint yang sudah
 * diverifikasi (lihat PRD.md bagian 6, tabel "Sudah terverifikasi
 * langsung ke docs.sectors.app").
 *
 * Server-side saja. SECTORS_API_KEY tidak boleh pernah masuk bundle klien —
 * jangan import file ini dari komponen "use client".
 */

import type {
  BrokerRegistryEntry,
  BrokerSummaryResponse,
  CompanyReportResponse,
  CompanyScreenerResponse,
  CorporateActionsResponse,
  DailyTransactionRow,
  FilingsResponse,
  FullUniverseClosePage,
  SubsectorReportResponse,
  SuspensionsResponse,
} from "./types";

const BASE_URL = "https://api.sectors.app";

function apiKey(): string {
  const key = process.env.SECTORS_API_KEY;
  if (!key) {
    throw new Error(
      "SECTORS_API_KEY belum di-set. Isi .env.local (lihat .env.example) — jangan hardcode key di kode."
    );
  }
  return key;
}

const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sectors punya rate limit TERPISAH dari kuota kredit — terkonfirmasi 429
 * "RATE_LIMIT_EXCEEDED" pas ingest jalan beruntun tanpa jeda (17 Sep 2026,
 * lihat PRD.md bagian 13). Backoff eksponensial di sini, bukan cuma dicatat
 * sebagai risiko di dokumen.
 */
async function sectorsGet<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey() },
      // Cache di lapisan pemanggil (Supabase), bukan di sini — endpoint ini
      // cuma dipanggil dari proses ingest terjadwal, bukan per-request pengguna.
      cache: "no-store",
    });

    if (res.status === 429) {
      if (attempt === MAX_RETRIES) {
        const body = await res.text().catch(() => "");
        throw new Error(`Sectors API 429 pada ${path} — habis ${MAX_RETRIES} kali retry: ${body.slice(0, 200)}`);
      }
      const retryAfter = res.headers.get("retry-after");
      const delay = retryAfter ? Number(retryAfter) * 1000 : BASE_BACKOFF_MS * 2 ** attempt;
      await sleep(delay);
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Sectors API ${res.status} pada ${path}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<T>;
  }
  throw new Error(`Sectors API: tidak terduga keluar dari retry loop pada ${path}`);
}

/** 1 kredit. Harga+volume+market cap, sampai 90 hari sekaligus. */
export function getDailyTransactions(
  symbol: string,
  opts?: { start?: string; end?: string }
): Promise<DailyTransactionRow[]> {
  return sectorsGet(`/v2/daily/${symbol}/`, {
    ...(opts?.start ? { start: opts.start } : {}),
    ...(opts?.end ? { end: opts.end } : {}),
  });
}

/** 1 kredit. Rincian broker per hari untuk satu ticker, sampai 14 hari sekaligus. */
export function getBrokerSummary(
  symbol: string,
  opts?: { start?: string; end?: string; brokerCode?: string }
): Promise<BrokerSummaryResponse> {
  return sectorsGet(`/v2/broker-summary/${symbol}/`, {
    ...(opts?.start ? { start: opts.start } : {}),
    ...(opts?.end ? { end: opts.end } : {}),
    ...(opts?.brokerCode ? { broker_code: opts.brokerCode } : {}),
  });
}

/** 1 kredit. Registry broker — sumber is_foreign/cohort. Refresh mingguan, bukan tiap siklus. */
export function getBrokerRegistry(opts?: {
  cohort?: "institutional" | "mixed" | "retail" | "unknown";
  origin?: "domestic" | "foreign";
}): Promise<BrokerRegistryEntry[]> {
  return sectorsGet("/v2/brokers/", {
    ...(opts?.cohort ? { cohort: opts.cohort } : {}),
    ...(opts?.origin ? { origin: opts.origin } : {}),
  });
}

/**
 * 1 kredit. Sektor, market cap, valuasi peer, keanggotaan indeks (cek LQ45 di sini).
 * `sections` opsional buat motong payload — misal ["overview"] kalau cuma butuh itu.
 * Verifikasi 17 Sep 2026: parameter ini beneran mengecilkan respons.
 */
export function getCompanyReport(
  symbol: string,
  sections?: string[]
): Promise<CompanyReportResponse> {
  return sectorsGet(`/v2/company/report/${symbol}/`, sections ? { sections: sections.join(",") } : undefined);
}

/**
 * 1 kredit. Insider buy/sell (dan transaksi lain) dari keterbukaan informasi.
 * Verifikasi 17 Sep 2026 — path yang benar `/v2/filings/`, BUKAN `/v2/news/filings/`.
 * Dipakai buat komponen sinyal_insider di SMFI (bobot 10%).
 */
export function getFilings(symbol: string, opts?: { limit?: number }): Promise<FilingsResponse> {
  return sectorsGet("/v2/filings/", {
    symbol,
    ...(opts?.limit ? { limit: String(opts.limit) } : {}),
  });
}

/** 1 kredit. Histori suspensi saham. Verifikasi 17 Sep 2026. */
export function getSuspensions(symbol?: string): Promise<SuspensionsResponse> {
  return sectorsGet("/v2/suspensions/", symbol ? { symbol } : undefined);
}

/**
 * 1 kredit. Median/rata-rata PE per subsektor — dasar perbandingan peer.
 * Verifikasi 17 Sep 2026: path parameter pakai SLUG sub-sektor (mis. "banks"),
 * bukan query string `?sector=`/`?sub_sector=` seperti dugaan awal. Ambil slug
 * valid dari getSubsectors().
 */
export function getSubsectorReport(subSectorSlug: string): Promise<SubsectorReportResponse> {
  return sectorsGet(`/v2/subsector/report/${subSectorSlug}/`);
}

/** 1 kredit. Daftar {sector, subsector} slug resmi — sumber slug buat getSubsectorReport(). */
export function getSubsectors(): Promise<{ sector: string; subsector: string }[]> {
  return sectorsGet("/v2/subsectors/");
}

/** 1 kredit. Split, rights issue, dividen, AGM — dasar penjaga aksi korporasi. */
export function getCorporateActions(symbol: string): Promise<CorporateActionsResponse> {
  return sectorsGet(`/v2/company/corporate-actions/${symbol}/`);
}

/** 1 kredit per halaman. Harga penutupan SEMUA ticker dalam satu tanggal. */
export function getFullUniverseClose(opts?: {
  date?: string;
  limit?: number;
  offset?: number;
}): Promise<FullUniverseClosePage> {
  return sectorsGet("/v2/close/", {
    ...(opts?.date ? { date: opts.date } : {}),
    ...(opts?.limit ? { limit: String(opts.limit) } : {}),
    ...(opts?.offset ? { offset: String(opts.offset) } : {}),
  });
}

/** 1 kredit (structured) / 3 kredit (natural language). Dipakai buat narik universe LQ45. */
export function screenCompanies(opts: {
  where?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}): Promise<CompanyScreenerResponse> {
  return sectorsGet("/v2/companies/", {
    ...(opts.where ? { where: opts.where } : {}),
    ...(opts.orderBy ? { order_by: opts.orderBy } : {}),
    ...(opts.limit ? { limit: String(opts.limit) } : {}),
    ...(opts.offset ? { offset: String(opts.offset) } : {}),
  });
}
