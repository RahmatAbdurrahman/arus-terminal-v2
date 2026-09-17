# ARUS Terminal

**IDX Smart Money & Capital Flow Terminal** — Sectors Hackathon 2026, Track 3 (Market Intelligence)

Web publik tanpa login yang menjawab satu pertanyaan tiap hari: *saham mana yang sedang
diakumulasi institusi/asing secara diam-diam, sebelum kelihatan di harga?* Jawabannya dua skor
turunan (SMFI, Divergence Delta) yang dihitung dari data transaksi broker dan arus dana asing
resmi di IDX — dengan rumus yang terbuka, bisa diaudit siapa pun. Lihat halaman **/metodologi**.

Spesifikasi lengkap: [`PRD.md`](./PRD.md). Mockup diskusi tim: [`mockup/index.html`](./mockup/index.html).

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi Supabase + Sectors key, lihat di bawah
npm run seed                 # isi data contoh (sama seperti di mockup)
npm run dev
```

## Environment yang dibutuhkan (`.env.local`)

| Variabel | Dari mana |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sudah terisi — project `arus-terminal` di Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → arus-terminal → Project Settings → API |
| `SECTORS_API_KEY` | Klaim kredit tim di portal hackathon |
| `CRON_SECRET` | Bikin sendiri, string acak — dipakai proteksi `/api/cron/ingest` |

## Struktur

```
app/                    Halaman Next.js (App Router)
  page.tsx              Beranda — daftar pendek harian
  saham/[ticker]/        Detail saham
  metodologi/            Rumus terbuka
  api/cron/ingest/       Satu-satunya endpoint yang boleh manggil Sectors API hidup
lib/
  formulas/              SMFI, Divergence Delta, kasus tepi — fungsi murni, ada unit test
  sectors/                Wrapper endpoint Sectors yang SUDAH terverifikasi
    UNVERIFIED.md          Daftar endpoint yang masih perlu dicek sebelum dipakai
  supabase/               Client Supabase (admin = service role, public = anon/baca)
  queries.ts              Query baca yang dipakai halaman
supabase/migrations/     Skema database + RLS
scripts/seed-fixtures.ts Isi data contoh ke Supabase
mockup/                  Mockup statis buat diskusi tim (sudah disepakati)
PRD.md                   Spesifikasi produk lengkap
```

## Testing

```bash
npm test          # unit test formula (SMFI, Divergence Delta, kasus tepi)
npx tsc --noEmit   # type-check
```

## Status Fase 0 (lihat PRD.md bagian 13)

Endpoint yang **sudah** dipakai di `lib/sectors/client.ts`: `daily`, `broker-summary`,
`brokers` (registry), `company/report`, `company/corporate-actions`, `companies` (screener),
`close` (full-universe).

Endpoint yang **belum** diverifikasi — jangan diasumsikan ada sebelum dicek langsung, lihat
[`lib/sectors/UNVERIFIED.md`](./lib/sectors/UNVERIFIED.md): sinyal insider (`filings`),
`suspensions`, `sector-report`, parameter `sections=`.

## Deploy

Project ini dirancang buat Vercel — cron terjadwal ada di `vercel.json` (Senin/Rabu/Jumat,
16:15 WIB). Vercel otomatis mengirim header `Authorization: Bearer $CRON_SECRET` ke endpoint
cron kalau `CRON_SECRET` di-set sebagai environment variable project.

## Aturan yang wajib dijaga (lihat PRD.md bagian 2)

- Semua komponen skor relatif (persentil), tidak pernah ambang absolut
- Tidak pernah ada kata beli/jual/rekomendasi di UI maupun narasi AI
- Fitur AI (kalau dibangun) tidak pernah memanggil Sectors API langsung per pengguna
- Kode ditulis fresh — referensi visual boleh, migrasi kode dari proyek lain tidak

---

Sectors Hackathon 2026 · Track 3 — Market Intelligence · Tim ARUS (4 orang)
