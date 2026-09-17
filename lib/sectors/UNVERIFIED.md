# Riwayat verifikasi endpoint

Semua endpoint yang tadinya diragukan sudah dicek langsung ke API asli (17 September 2026)
dan sekarang dipakai di `lib/sectors/client.ts`. Dokumen ini disimpan sebagai catatan —
nama path-nya ternyata beda dari dugaan awal di PDF ideation, jadi worth diingat.

## Hasil verifikasi

| Klaim awal | Path asli yang benar | Catatan |
|---|---|---|
| `news/filings` | `GET /v2/filings/?symbol={sym}` | Bukan di bawah `/news/`. Field: `transaction_type` (buy/sell), `holder_type` (insider/dst), `transaction_value`, `timestamp` |
| `news/suspensions` | `GET /v2/suspensions/?symbol={sym}` | Field: `symbol`, `suspension_date`, `reason`, `pdf_url` |
| `report/sector-report` | `GET /v2/subsector/report/{slug}/` | **Path parameter pakai slug sub-sektor** (mis. `banks`), BUKAN query param `?sector=`/`?sub_sector=`. Slug valid dari `GET /v2/subsectors/` |
| `sections=` di company-report | `GET /v2/company/report/{sym}/?sections=overview,valuation` | Beneran motong payload (1127 byte utk `overview` doang vs 2700 byte utk dua section) |

## Free float — 17 September 2026

Sectors nggak punya field `free_float_pct` langsung di mana pun. Dicek satu-satu
lewat `GET /v2/company/report/{sym}/?sections=overview,ownership` (BBCA dan TLKM,
data asli, bukan dugaan): section `ownership.major_shareholders` konsisten punya
satu entri bernama PERSIS `"Public"`, dengan `share_percentage` sebagai FRAKSI
string (`"0.44642"`, bukan `"44.642"` — kali 100 dulu sebelum dipakai). Dipakai
sebagai proxy free-float di `extractFreeFloatPct()` (`app/api/cron/ingest/route.ts`).
Bukan definisi free-float resmi bursa — kalau entri "Public" nggak ada di suatu
ticker, hasilnya `null` (aman, nggak memicu penalti), bukan dianggap 0%.

## Kalau ada endpoint baru yang mau dipakai nanti

Jangan tebak nama path dari deskripsi fitur — banyak yang meleset (contoh: `sector-report`
ternyata bukan di bawah `/report/` sama sekali, tapi di bawah `/subsector/report/{slug}/`
dengan path parameter, bukan query string). Cek langsung dengan `curl` + API key asli sebelum
nulis kode yang bergantung padanya.
