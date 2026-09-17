"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Client buat komponen "use client" — anon key aman diekspos ke browser,
 * scope-nya cuma baca (RLS "public read", lihat migrasi 0001_init).
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}
