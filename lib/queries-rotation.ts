import { supabasePublic } from "./supabase/server";

export interface RotationRow {
  subSector: string;
  breadth: number;
  momentum: number;
  moneyFlow: number;
  label: "Hot" | "Warming" | "Cold" | "Distribution";
}

export async function getSectorRotation(): Promise<{ rows: RotationRow[]; asOfDate: string | null }> {
  const db = supabasePublic();
  const { data: latest } = await db
    .from("sector_rotation_daily")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) return { rows: [], asOfDate: null };

  const { data } = await db
    .from("sector_rotation_daily")
    .select("*")
    .eq("date", latest.date)
    .order("breadth", { ascending: false });

  const rows: RotationRow[] = (data ?? []).map((r: any) => ({
    subSector: r.sub_sector,
    breadth: r.breadth,
    momentum: r.momentum,
    moneyFlow: r.money_flow,
    label: r.label,
  }));

  return { rows, asOfDate: latest.date };
}

export async function getTopTickersInSubSector(subSector: string, limit = 5) {
  const db = supabasePublic();
  const { data: latest } = await db
    .from("derived_scores_daily")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!latest) return [];

  const { data } = await db
    .from("derived_scores_daily")
    .select("ticker,smfi_score,companies!inner(name,sub_sector)")
    .eq("date", latest.date)
    .eq("companies.sub_sector", subSector)
    .order("smfi_score", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r: any) => ({ ticker: r.ticker, name: r.companies?.name ?? r.ticker, smfi: r.smfi_score }));
}
