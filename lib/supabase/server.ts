import { createClient } from "@supabase/supabase-js";

/**
 * Client service-role — server saja (route handler, cron, script ingest).
 * Melewati RLS. JANGAN pernah import dari komponen "use client".
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set di .env.local"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Client baca-publik — dipakai server component/route handler yang cuma
 * SELECT dari tabel dengan policy "public read" (lihat migrasi 0001_init).
 * Aman dipakai walau kuncinya bocor ke klien, karena scope-nya cuma baca.
 */
export function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set di .env.local"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
