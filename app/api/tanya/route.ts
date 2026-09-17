import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { translateQuestion } from "@/lib/ai/tanyaArus";

export const dynamic = "force-dynamic";

/**
 * POST /api/tanya — PRD.md bagian 9. Satu panggilan Gemini buat
 * nerjemahin pertanyaan jadi filter, lalu query LOKAL ke Supabase.
 * TIDAK PERNAH manggil Sectors API di sini.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.slice(0, 300) : ""; // batasi panjang, rate-limit sederhana lewat pembatasan input
  if (!question) return NextResponse.json({ error: "pertanyaan kosong" }, { status: 400 });

  const db = supabaseAdmin();

  const { data: latest } = await db
    .from("derived_scores_daily")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) return NextResponse.json({ results: [], filter: null });

  const { data: subSectorRows } = await db.from("companies").select("sub_sector").not("sub_sector", "is", null);
  const availableSubSectors = [...new Set((subSectorRows ?? []).map((r: any) => r.sub_sector as string))];

  const filter = await translateQuestion(question, availableSubSectors);

  let query = db
    .from("derived_scores_daily")
    .select("ticker,smfi_score,divergence_delta,confluence_label,companies!inner(name,sub_sector)")
    .eq("date", latest.date);

  if (filter.minSmfi !== null) query = query.gte("smfi_score", filter.minSmfi);
  if (filter.minDivergenceDelta !== null) query = query.gte("divergence_delta", filter.minDivergenceDelta);
  if (filter.confluence !== null) query = query.eq("confluence_label", filter.confluence);
  if (filter.subSector !== null) query = query.eq("companies.sub_sector", filter.subSector);

  const { data } = await query.order("smfi_score", { ascending: false }).limit(10);

  const results = (data ?? []).map((r: any) => ({
    ticker: r.ticker,
    name: r.companies?.name ?? r.ticker,
    sector: r.companies?.sub_sector ?? null,
    smfi: r.smfi_score,
    divergenceDelta: r.divergence_delta,
    confluence: r.confluence_label,
  }));

  return NextResponse.json({ results, filter });
}
