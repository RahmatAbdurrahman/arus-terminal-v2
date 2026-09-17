import { supabasePublic } from "./supabase/server";
import { ConfluenceLabel } from "./formulas/types";

export interface ShortlistRow {
  ticker: string;
  name: string;
  sector: string | null;
  smfi: number;
  divergenceDelta: number;
  confluence: ConfluenceLabel;
  date: string;
  smfiHistory: number[];
}

const CONFLUENCE_TEXT: Record<ConfluenceLabel, string> = {
  akumulasi_senyap: "Akumulasi masih senyap",
  sudah_di_harga: "Sudah kelihatan di harga",
  distribusi: "Distribusi terdeteksi",
  sinyal_sedang: "Sinyal sedang",
};

export function confluenceText(label: ConfluenceLabel): string {
  return CONFLUENCE_TEXT[label];
}

/** Tanggal terbaru yang punya skor — dipakai semua query lain biar konsisten. */
async function latestScoreDate(): Promise<string | null> {
  const db = supabasePublic();
  const { data } = await db
    .from("derived_scores_daily")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.date ?? null;
}

export async function getShortlist(limit = 5): Promise<{ rows: ShortlistRow[]; asOfDate: string | null }> {
  const asOfDate = await latestScoreDate();
  if (!asOfDate) return { rows: [], asOfDate: null };

  const db = supabasePublic();
  const { data, error } = await db
    .from("derived_scores_daily")
    .select("ticker,date,smfi_score,divergence_delta,confluence_label,companies(name,sector)")
    .eq("date", asOfDate)
    .order("smfi_score", { ascending: false })
    .limit(limit);

  if (error || !data) return { rows: [], asOfDate };

  const tickers = data.map((r: any) => r.ticker);
  const { data: historyRows } = await db
    .from("derived_scores_daily")
    .select("ticker,date,smfi_score")
    .in("ticker", tickers)
    .order("date", { ascending: true })
    .limit(300);

  const historyByTicker = new Map<string, number[]>();
  for (const h of historyRows ?? []) {
    const arr = historyByTicker.get((h as any).ticker) ?? [];
    arr.push((h as any).smfi_score);
    historyByTicker.set((h as any).ticker, arr);
  }

  const rows: ShortlistRow[] = data.map((r: any) => ({
    ticker: r.ticker,
    name: r.companies?.name ?? r.ticker,
    sector: r.companies?.sector ?? null,
    smfi: r.smfi_score,
    divergenceDelta: r.divergence_delta,
    confluence: r.confluence_label as ConfluenceLabel,
    date: r.date,
    smfiHistory: historyByTicker.get(r.ticker) ?? [],
  }));

  return { rows, asOfDate };
}

export async function getTickerDetail(ticker: string) {
  const db = supabasePublic();
  const asOfDate = await latestScoreDate();

  const [{ data: company }, { data: score }, { data: prices }, { data: flows }, { data: scoreHistory }] = await Promise.all([
    db.from("companies").select("*").eq("ticker", ticker).maybeSingle(),
    asOfDate
      ? db.from("derived_scores_daily").select("*").eq("ticker", ticker).eq("date", asOfDate).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("price_daily").select("*").eq("ticker", ticker).order("date", { ascending: true }).limit(90),
    db.from("broker_flow_daily").select("*").eq("ticker", ticker).order("date", { ascending: true }).limit(90),
    db.from("derived_scores_daily").select("date,smfi_score,divergence_delta").eq("ticker", ticker).order("date", { ascending: true }).limit(90),
  ]);

  return { company, score, prices: prices ?? [], flows: flows ?? [], scoreHistory: scoreHistory ?? [] };
}
