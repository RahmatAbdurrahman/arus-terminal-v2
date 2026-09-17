import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { explainScore, ExplainInput } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/jelaskan — satu panggilan Gemini per (ticker, skor), di-cache.
 * Dipanggil dari tombol "jelaskan" di halaman detail. TIDAK pernah manggil
 * Sectors API — cuma baca angka yang udah dikirim dari klien (yang mana
 * angka itu sendiri berasal dari Supabase, bukan dari klien secara bebas).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ExplainInput | null;
  if (!body || typeof body.ticker !== "string" || typeof body.smfi !== "number") {
    return NextResponse.json({ error: "payload tidak valid" }, { status: 400 });
  }

  const cacheKey = `explain:${body.ticker}:${body.smfi}:${body.divergenceDelta}`;
  const db = supabaseAdmin();

  const { data: cached } = await db
    .from("narratives_cache")
    .select("output,source")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (cached) {
    return NextResponse.json({ narrative: cached.output, source: cached.source, cached: true });
  }

  const result = await explainScore(body);

  await db.from("narratives_cache").upsert({
    cache_key: cacheKey,
    ticker: body.ticker,
    output: result.narrative,
    source: result.source,
  });

  return NextResponse.json({ ...result, cached: false });
}
