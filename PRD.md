# PRD — ARUS Terminal

**IDX Smart Money & Capital Flow Terminal**

| | |
|---|---|
| Versi | 1.0 |
| Tanggal | 14 September 2026 |
| Konteks | Sectors Hackathon 2026 — Track 3 (Market Intelligence) |
| Tim | 4 orang |
| Batas registrasi | 22 September 2026, 23:59 WIB |
| Batas submission | 30 September 2026, 23:59 WIB |
| Sisa waktu dari hari ini | 16 hari |
| Status | Siap implementasi |

### Rubrik penjurian (acuan)

Penjurian asinkron, 1–8 Oktober 2026, tanpa presentasi live. Juri cuma lihat repo dan dua video. Gate lolos/tidak lebih dulu: submission lengkap, produk berfungsi, Sectors sebagai sumber data inti, onboarding semua 4 anggota tim terverifikasi.

**Syarat khusus Track 3, ini gate tersendiri sebelum skor apa pun dihitung:**

> "The project must produce **derived insight**: analysis generated from the data rather than the data itself... A product that only displays raw Sectors data in a different visual form, however well presented, **does not qualify** for this track."

Dua skor kita (SMFI, Divergence Delta) adalah jawaban buat gate ini. Begitu ada, kita nggak gugur — tapi lolos gate bukan berarti menang. Skor beneran ditentukan tiga kriteria berikut, sama buat semua track:

| Kriteria | Bobot | Yang dinilai |
|---|---|---|
| Real-world usability | 40% | Bisa dipakai orang beneran, hari ini, dan bermanfaat |
| Video demo & storytelling | 30% | Seberapa jelas video menyampaikan masalah untuk audiensnya |
| Technical depth & execution | 30% | Diverifikasi dari repo — orisinal, nyata, nggak dipalsukan buat demo |

Item submission wajib: repo publik (tetap publik ≥90 hari setelah pengumuman 9 Okt), teaser 1 menit publik, video penjurian ≤3 menit, problem statement satu kalimat, pilihan track + nama 4 peserta, post medsos tag akun Sectors.

---

## 1. Ringkasan

**Masalah:** Forum dan grup "bandarmologi" di Indonesia besar sekali, tapi hampir semuanya isinya opini dan sinyal tanpa perhitungan — "ACC gaskeun" tanpa bukti. Nggak ada yang nunjukkin datanya secara terbuka.

**ARUS Terminal** adalah web publik, tanpa login, yang menjawab satu pertanyaan tiap hari: **saham mana yang sedang diakumulasi institusi/asing secara diam-diam, sebelum kelihatan di harga?** Jawabannya bukan opini, tapi dua skor yang dihitung dari data transaksi broker dan arus dana asing resmi di IDX — dengan rumus yang terbuka, bisa diaudit siapa pun.

**Problem statement (untuk submission):**

> ARUS Terminal membantu investor ritel dan trader aktif Indonesia mengenali akumulasi institusional/asing yang belum tercermin di harga saham, lewat skor turunan yang transparan dan bisa dipertanggungjawabkan — bukan sinyal tanpa bukti dari grup bandarmologi.

**Kenapa ini beda dari sekadar dashboard data:** halaman depan bukan tabel besar berisi ratusan angka. Halaman depan adalah **daftar pendek harian** — lima saham dengan sinyal terkuat hari ini. Terminal lengkap (log 15 hari, grafik, ranking) ada di baliknya, buat yang mau ngecek buktinya.

---

## 2. Prinsip produk

Delapan aturan yang nggak boleh dilanggar. Kalau keputusan teknis bertabrakan dengan salah satunya, prinsipnya yang menang.

1. **Skor turunan, bukan data mentah.** Produk harus kehilangan fungsi intinya kalau data Sectors dicabut. Ini bukan cuma prinsip, ini syarat lolos gate Track 3.
2. **Semua komponen relatif, tidak pernah absolut.** Ambang kayak "Rp15 miliar" itu keliru — besar buat saham kecil, receh buat BBCA. Semua dihitung persentil lintas universe, bukan angka rupiah tetap.
3. **Formula terbuka, bukan black box.** Rumus, bobot, dan alasannya ditulis di halaman metodologi, bisa dibaca siapa pun. Ini pembeda utama dari grup sinyal yang nggak pernah nunjukkin perhitungannya.
4. **Daftar pendek dulu, terminal lengkap kemudian.** Halaman depan jawab "yang mana yang layak dilihat hari ini", bukan dump semua angka sekaligus.
5. **Menandai, tidak menyuruh.** Nggak pernah ada kata beli, jual, rekomendasi — termasuk di narasi AI dan hasil backtest (bagian 7).
6. **Harga terpisah dari akumulasi.** Momentum harga cuma hidup di Divergence Delta. SMFI nggak pernah dicampur sama pergerakan harga, biar dua angka itu masing-masing tetap jelas artinya.
7. **AI menulis dalam batas ketat, kode menghitung semuanya.** Fitur AI (kalau dibangun) cuma boleh baca dari data yang udah dihitung. Nggak pernah manggil API Sectors langsung per pengguna.
8. **Kejujuran soal batasan menaikkan kredibilitas.** Sampel backtest kecil, universe terbatas, update bukan real-time — semua disebut eksplisit di halaman metodologi, bukan disembunyikan.

---

## 3. Pengguna dan prioritas

**Persona.** Trader aktif dan investor ritel yang terbiasa nongkrong di forum/grup bandarmologi, tapi capek sama sinyal tanpa dasar — mau lihat datanya sendiri, bukan percaya omongan orang.

**User story inti:**

> Sebagai trader ritel yang sering lihat sinyal "ACC gaskeun" tanpa bukti, saya ingin tau saham mana yang beneran sedang diakumulasi institusi/asing, dengan perhitungan yang bisa saya cek sendiri — bukan opini orang di grup.

### Prioritas fitur (MoSCoW)

| Prioritas | Fitur |
|---|---|
| **Must** | Pipeline ingest otomatis, formula SMFI + Divergence Delta, daftar pendek harian, halaman detail per saham, halaman metodologi, disclaimer |
| **Should** | Riwayat skor (trend), Sector Rotation Heatmap, watchlist (localStorage), penjaga aksi korporasi |
| **Could** | Tombol "jelaskan" (AI), "Tanya ARUS" (pencarian bahasa natural), snapshot yang bisa dibagikan, backtest sederhana, notifikasi Telegram opsional, analitik trafik |
| **Won't** | Eksekusi transaksi apa pun (dilarang aturan hackathon), akun/login wajib, agent otonom multi-step, rekomendasi personal per pengguna |

### Garis potong

Kalau tertinggal jadwal, potong dalam urutan ini:

1. ~~Backtest~~ — **selesai** dengan versi hemat: 6 ticker representatif (BMRI, AMRT, ADRO, ANTM, TLKM, GOTO, lintas 6 sektor), 90 hari histori, ~48 kredit (bukan ~210 kalau full 30 ticker). Hasil: SMFI≥60 TIDAK menunjukkan return lebih baik dibanding baseline di sampel ini — ditampilkan apa adanya, bukan di-cherry-pick
2. Notifikasi Telegram opsional
3. "Tanya ARUS"
4. Snapshot yang bisa dibagikan
5. Watchlist
6. Sector Rotation Heatmap
7. Tombol "jelaskan"

Yang tidak boleh dipotong dalam keadaan apa pun: dua skor inti (SMFI + Divergence Delta), daftar pendek harian, halaman metodologi, disclaimer, dan bukti pipeline berjalan otomatis (bagian 10).

---

## 4. Model skor — dua sumbu

Ini jantung produk, dan bagian yang paling diperiksa juri (technical depth, 30%). Ada **dua skor independen**, sengaja dipisah biar masing-masing tetap jelas artinya.

### Sumbu A — SMFI (Smart Money Flow Index): seberapa kuat akumulasinya

Skor 0–100. Menjawab: *"seberapa besar tanda-tanda institusi/asing lagi ngumpulin saham ini, dibanding hari-hari normal dan dibanding saham lain?"*

```
Komponen (dihitung dulu per saham, per hari):

1. flow_intensity      = net_foreign_buy ÷ rata-rata_turnover_20_hari
                          (arus asing dibanding aktivitas NORMAL saham ini —
                           bukan dibanding ukuran perusahaan, biar saham besar
                           yang jarang ditransaksikan juga kejaring)

2. dominasi_institusi   = nilai transaksi broker ber-cohort "institutional"
                          ÷ total nilai transaksi hari itu
                          (dari registry broker: field is_foreign + cohort)

3. turnover_relatif     = volume hari ini ÷ rata-rata volume 20 hari

4. sinyal_insider       = insider net-buy 30 hari (dari filings, KALAU
                          endpoint-nya terverifikasi — lihat bagian 10)
                          buy=1, netral=0.5, sell=0

Tiap komponen di-RANKING SEBAGAI PERSENTIL lintas seluruh universe hari itu
(bukan angka absolut — lihat Prinsip 2).

SMFI = 40%·persentil(1) + 30%·persentil(2) + 20%·persentil(3) + 10%·persentil(4)
       − penalti_float

penalti_float: saham dengan free-float < 15% dikurangi skornya. Saham
float kecil paling gampang "digoreng" — mengecilkan bobotnya bikin skor
lebih tahan dari sinyal palsu.

Sectors nggak punya field "free float" langsung. Diverifikasi live 17 Sep
2026: `GET /v2/company/report/{sym}/?sections=ownership` punya
`major_shareholders` dengan satu entri bernama persis `"Public"` (dicek di
BBCA 44.642% dan TLKM 41.65%) — dipakai sebagai proxy free-float. Bukan
definisi bursa yang presisi (free float resmi IDX bisa beda tipis dari
kepemilikan "Public" versi Sectors), tapi ini satu-satunya sumber
terverifikasi yang ada, jadi dicatat eksplisit sebagai proxy — bukan
diklaim sebagai angka resmi.

SMFI > 70  → ditandai "Akumulasi Kuat"
SMFI < 30  → ditandai "Distribusi Kuat"
```

**Kalau sinyal_insider belum terverifikasi datanya sampai Fase 0 selesai**, bobotnya dialihkan ke komponen 1–3 (jadi 45/30/25), bukan dipaksakan pakai data kosong.

### Sumbu B — Divergence Delta: seberapa jauh arus ketinggalan dari harga

Skor persentil-selisih, kira-kira -100 sampai +100. Menjawab: *"asingnya udah masuk, tapi harganya udah gerak apa belum?"*

```
1. flow_intensity_15d   = persentil dari total net foreign buy 15 hari
                          (pakai komponen yang sama kayak SMFI, dijumlah 15 hari)

2. price_change_15d     = persentil dari perubahan harga 15 hari

Divergence Delta = persentil(flow_intensity_15d) − persentil(price_change_15d)
```

Nilai tinggi = arus masuk deras tapi harga belum banyak bergerak — pola "akumulasi senyap sebelum markup". Nilai rendah/negatif = harga udah duluan naik, mungkin bukan smart money tapi FOMO retail.

**Kenapa persentil, bukan z-score:** data finansial berekor panjang — beberapa hari ekstrem bisa bikin rata-rata dan standar deviasi jadi nggak stabil. Persentil (ranking, bukan jarak dari rata-rata) jauh lebih tahan outlier.

### Sinyal gabungan (confluence read)

Baca SMFI dan Divergence Delta bareng — insight tingkat ketiga, gratis karena cuma fungsi dari dua angka yang udah dihitung:

| SMFI | Divergence Delta | Artinya |
|---|---|---|
| Tinggi | Tinggi | Akumulasi masih senyap, harga belum bergerak — paling menarik |
| Tinggi | Rendah | Arus deras tapi harga udah lari duluan — mungkin FOMO, bukan smart money |
| Sedang | Tinggi | Awal akumulasi, baru mulai kelihatan |

### Kasus tepi — wajib ditangani

- **Aksi korporasi.** Stock split, rights issue, bonus share bisa bikin volume/harga melonjak tanpa hubungan sama akumulasi institusi. Cek `corporate-actions` sebelum hitung skor — kalau ada aksi korporasi dalam window itu, kecualikan hari itu dari perhitungan, jangan biarkan formula salah baca.
- **Saham baru IPO (<20 hari histori).** `rata-rata_turnover_20_hari` nggak valid. Kecualikan dari universe sampai histori cukup, tandai status "data belum cukup" — bukan dipaksa dihitung dengan baseline yang nggak lengkap.
- **Float sangat tipis / volume nyaris nol.** Rasio bisa meledak jadi angka ekstrem dari noise kecil. Tetapkan lantai turnover minimum — di bawah itu, saham dikecualikan dari universe, bukan cuma didiskon lewat penalti float.
- **Broker tanpa klasifikasi (`cohort = unknown`).** Jangan dihitung sebagai institusional maupun retail — keluarkan dari pembilang dominasi_institusi, jangan diasumsikan salah satu.
- **Satu skor tinggi karena SATU broker outlier.** Kalau memungkinkan, cek juga distribusi antar broker (bukan cuma total) — satu broker yang tiba-tiba transaksi besar sendirian beda ceritanya dari banyak broker institusi kompak beli.

---

## 5. Metodologi tambahan — Sector Rotation Heatmap (Should have)

Formula konkret, bukan konsep kosong, per subsektor per hari:

```
breadth        = % saham di subsektor yang closing di atas MA20
                 (dari transaction/close full-universe, 1 panggilan)

momentum_index = median return 7 hari & 30 hari seluruh saham di subsektor

money_flow     = perubahan total market cap subsektor
                 + proporsi kemunculan di ranking most-traded/top-changes

Label: Hot / Warming / Cold / Distribution, dengan drill-down 5 ticker
teratas per sektor.
```

Harus tegas ditampilkan sebagai skor turunan (breadth + flow dihitung, bukan cuma chart IHSG per sektor) — kalau narasinya lemah, ini bisa dibaca juri sebagai "market overview" biasa, bukan derived insight.

---

## 6. Arsitektur

### Pola single-ingestion cache

Satu prinsip yang menjaga anggaran kredit tetap aman: **cuma proses ingest yang boleh manggil API Sectors hidup.** Semua fitur lain — daftar pendek, detail saham, watchlist, "Tanya ARUS" — baca dari Supabase, nggak pernah manggil Sectors langsung.

```
┌──────────────────────────────────────────────────────────┐
│ CRON — ingest, 3x/minggu (Senin/Rabu/Jumat, 16:15 WIB)     │
├──────────────────────────────────────────────────────────┤
│ 1. Tarik universe (saham anggota LQ45, lewat company/report│
│    atau screener — bukan hardcode manual)                  │
│ 2. Per ticker: panggil daily (harga+volume+market cap) dan  │
│    broker-summary (flow + dominasi, satu panggilan berdua)  │
│ 3. Cek corporate-actions, kecualikan hari yang kena aksi    │
│ 4. Simpan RAW ke tabel histori (append, bukan overwrite)    │
│ 5. Hitung ulang SMFI + Divergence Delta buat SEMUA ticker   │
│    (persentil dihitung ulang tiap refresh — relatif ke hari │
│    itu)                                                      │
│ 6. Simpan skor + timestamp "terakhir diperbarui"            │
│ 7. Tulis log ingesti (bukti data hidup, lihat bagian 10)    │
└──────────────────────────────────────────────────────────┘
```

Registry broker (`brokers/`) dan aksi korporasi dicek jauh lebih jarang — klasifikasi broker nggak sering berubah, cukup di-refresh mingguan.

### Endpoint yang dipakai

**Sudah terverifikasi langsung ke docs.sectors.app:**

| Endpoint | Fungsi | Biaya |
|---|---|---|
| `GET /v2/daily/{symbol}/` | Harga, volume, market cap — sampai 90 hari sekaligus | 1 kredit |
| `GET /v2/broker-summary/{symbol}/` | Rincian tiap broker per hari (flow + dominasi) — sampai 14 hari sekaligus | 1 kredit |
| `GET /v2/brokers/` | Registry broker: `is_foreign`, `cohort` (institutional/mixed/retail/unknown) | 1 kredit |
| `GET /v2/company/report/{symbol}/` | Sektor, market cap, valuasi peer, keanggotaan indeks (flag LQ45) | 1 kredit |
| `GET /v2/company/corporate-actions/{symbol}/` | Stock split, rights issue, dividen, AGM | 1 kredit |
| `GET /v2/companies/` | Screener SQL-like lintas semua emiten | 1 kredit (3 kalau natural language) |
| `GET /v2/close/` | Harga penutupan SEMUA ~950 ticker dalam satu feed | 1 kredit/halaman |
| `GET /v2/filings/?symbol={sym}` | Insider buy/sell — verifikasi 17 Sep 2026. **Path aslinya bukan `news/filings`** | 1 kredit |
| `GET /v2/suspensions/?symbol={sym}` | Histori suspensi — verifikasi 17 Sep 2026 | 1 kredit |
| `GET /v2/subsector/report/{slug}/` | Median/rata-rata PE per subsektor — verifikasi 17 Sep 2026. **Path parameter pakai slug** (mis. `banks`), bukan query `?sector=` | 1 kredit |
| `GET /v2/company/report/{symbol}/?sections=...` | Parameter `sections=` terkonfirmasi motong payload (1127 byte vs 2700 byte pada uji 2 section) | 1 kredit |

Semua 4 endpoint yang tadinya diragukan sudah terverifikasi langsung dengan API key asli
tanggal 17 September 2026 — detail lengkap di `lib/sectors/UNVERIFIED.md` pada repo. Nama
path aslinya beberapa beda dari dugaan awal di riset tim (khususnya `filings` dan
`sector-report`), jadi SMFI sekarang pakai 4 komponen penuh, bukan 3.

### Keandalan operasional

- **Idempotensi**: insert data harian pakai `ON CONFLICT DO NOTHING` — re-run cron yang gagal separuh jalan nggak boleh crash di baris duplikat
- **Retry**: kalau satu ticker gagal di-ingest, jangan gagalkan seluruh batch — catat error, lanjut ke ticker berikutnya, retry ticker yang gagal di siklus berikutnya
- **Rate limit Sectors**: verifikasi ada/tidaknya limit per detik di luar kuota kredit total (Fase 0)

---

## 7. Model data (Supabase)

```sql
companies                         -- seed dari screener, refresh mingguan
  ticker        text PK
  name          text
  sector        text
  sub_sector    text
  is_lq45       bool
  free_float_pct numeric nullable
  updated_at    timestamptz

price_daily                       -- histori, bukan snapshot
  ticker        text FK
  date          date
  close         numeric
  volume        bigint
  market_cap    numeric
  UNIQUE(ticker, date)

broker_flow_daily                 -- agregat dari broker-summary + brokers registry
  ticker           text FK
  date             date
  net_foreign_buy  numeric        -- sum(net_value) WHERE is_foreign = true
  institutional_value numeric     -- sum(net_value) WHERE cohort = 'institutional'
  total_value      numeric
  excluded_corporate_action bool default false
  UNIQUE(ticker, date)

brokers_registry                  -- cache dari /v2/brokers/, refresh mingguan
  broker_code   text PK
  is_foreign    bool
  cohort        text              -- 'institutional' | 'mixed' | 'retail' | 'unknown'
  updated_at    timestamptz

insider_signal_daily              -- HANYA dibuat kalau filings terverifikasi (Fase 0)
  ticker        text FK
  date          date
  signal        numeric           -- 1 / 0.5 / 0
  UNIQUE(ticker, date)

derived_scores_daily              -- hasil formula, dihitung ulang tiap refresh
  ticker            text FK
  date              date
  smfi_score        numeric
  divergence_delta  numeric
  confluence_label  text
  computed_at       timestamptz
  UNIQUE(ticker, date)

sector_rotation_daily             -- Should have
  sub_sector    text
  date          date
  breadth       numeric
  momentum      numeric
  money_flow    numeric
  label         text              -- Hot | Warming | Cold | Distribution
  UNIQUE(sub_sector, date)

ingestion_runs                    -- bukti data hidup
  id               uuid PK
  started_at       timestamptz
  finished_at      timestamptz nullable
  tickers_processed int
  api_calls        int
  status           text           -- 'success' | 'partial' | 'failed'
  errors           jsonb nullable

narratives_cache                  -- kalau "jelaskan"/"Tanya ARUS" dibangun (Could)
  ticker        text nullable
  cache_key     text              -- hash dari pertanyaan/parameter
  output        text
  source        text              -- 'gemini' | 'template'
  created_at    timestamptz
  UNIQUE(cache_key)
```

### RLS

| Tabel | Kebijakan |
|---|---|
| `companies`, `price_daily`, `broker_flow_daily`, `derived_scores_daily`, `sector_rotation_daily`, `narratives_cache` | Baca publik (produk ini nggak pakai akun) — tulis cuma service role |
| `brokers_registry`, `insider_signal_daily`, `ingestion_runs` | Baca dan tulis service role saja |

RLS wajib aktif di semua tabel meski nggak ada data pribadi pengguna — mencegah siapa pun menulis langsung ke database lewat anon key.

---

## 8. Kontrak tampilan

Pipeline menghasilkan objek ini. Frontend baca objek yang sama, nggak boleh nyusun angka sendiri.

```json
{
  "dataAsOf": "2026-09-24",
  "lastUpdated": "2026-09-24T16:15:00+07:00",
  "shortlist": [
    {
      "ticker": "ANTM",
      "smfi": 78,
      "divergenceDelta": 62,
      "confluence": "Akumulasi masih senyap",
      "smfiTrend": "naik dari 41 ke 78 dalam 5 hari",
      "sector": "Basic Materials"
    }
  ],
  "excluded": [
    { "ticker": "XYZ", "reason": "aksi korporasi: rights issue 2026-09-20" }
  ],
  "insufficientData": [
    { "ticker": "NEWIPO", "reason": "histori < 20 hari sejak listing" }
  ]
}
```

---

## 9. Lapisan AI (Could — dua fitur, dua-duanya dibatasi ketat)

**Peran AI:** menerjemahkan dan menarasikan, bukan menghitung atau mengambil keputusan. Sama persis prinsip yang dipegang di proyek Kabari sebelumnya.

### Tombol "jelaskan"

Satu panggilan Gemini per saham, hasilnya di-cache di `narratives_cache`. Input cuma angka yang udah dihitung (SMFI, Divergence, komponen). Output satu paragraf bahasa Indonesia.

### "Tanya ARUS"

Pencarian bahasa natural — **tapi bukan agent.** Ini batas keras:

```
Pertanyaan pengguna
   │
   ▼
SATU panggilan Gemini — ekstrak jadi filter terstruktur
   (contoh: sektor=Perbankan, divergence_delta > persentil_70)
   │
   ▼
Filter terhadap derived_scores_daily YANG UDAH ADA di Supabase
   (NOL panggilan ke Sectors API per pertanyaan)
   │
   ▼
Tampilkan hasil
```

**Aturan yang nggak bisa ditawar:** fitur ini nggak pernah manggil API Sectors langsung per pertanyaan pengguna. Kalau ini dilanggar, dua hal rusak sekaligus — konsumsi kredit jadi fungsi dari traffic (bukan lagi jadwal yang bisa diprediksi), dan produk berisiko dibaca juri sebagai "agent" yang harusnya masuk Track 1, bukan Track 3.

**Validasi wajib buat kedua fitur** (sama seperti disiplin Kabari):

1. Cek angka di output cocok sama input — angka baru ditolak
2. Cek arah — nggak boleh bilang "naik" kalau datanya turun
3. Cek daftar kata terlarang (beli, jual, rekomendasi, target, sebaiknya)
4. Gagal validasi atau API error → jangan tampilkan apa-apa, bukan dipaksa nampilin hasil buruk

---

## 10. Keamanan dan privasi

### Rahasia

| Variabel | Sisi | Catatan |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server saja | Melewati RLS, nggak pernah masuk bundle klien |
| `SECTORS_API_KEY` | Server saja | Cuma dipanggil dari proses ingest |
| `GEMINI_API_KEY` | Server saja | Cuma dipanggil dari endpoint "jelaskan"/"Tanya ARUS" |
| `CRON_SECRET` | Server saja | Diverifikasi di endpoint cron ingest |
| `ADMIN_TELEGRAM_CHAT_ID` | Server saja | Kalau fitur notifikasi Telegram dibangun |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_WEBHOOK_SECRET` | Server saja | Kalau fitur notifikasi Telegram dibangun |

Endpoint cron menolak permintaan tanpa `CRON_SECRET` yang benar — tanpa ini siapa pun bisa memicu ingest berkali-kali dan menghabiskan kredit.

### Karena produk ini publik tanpa login

- **Rate limit** di endpoint "Tanya ARUS" dan pencarian — per IP, biar nggak disalahgunakan buat ngirit orang lain manggil Gemini berkali-kali gratis
- **Nggak ada data pribadi yang dikumpulkan** — nggak ada akun, nggak ada portofolio pengguna. Watchlist (kalau dibangun) di `localStorage`, nggak pernah dikirim ke server
- **Validasi input server-side** di "Tanya ARUS" — jangan percaya filter yang dihasilkan Gemini mentah-mentah, validasi field dan operatornya sebelum dieksekusi ke database

### Sebelum submit

- Pindai repo untuk rahasia yang tertinggal, termasuk riwayat commit
- Pastikan `.env*` ada di `.gitignore`
- Uji dengan anon key — pastikan nggak bisa nulis ke tabel manapun
- Konfirmasi nggak ada tabel tanpa RLS

---

## 11. Antarmuka

### Layar

| Layar | Isi |
|---|---|
| Beranda (daftar pendek) | 5 saham sinyal terkuat hari ini, skor, tren, satu baris alasan. Timestamp "terakhir diperbarui" tampil jelas |
| Detail saham | Ranking, log transaksi 14-15 hari, grafik flow vs harga, komponen skor dirinci |
| Metodologi | Rumus SMFI & Divergence Delta terbuka, bobot, alasan ambang, batasan |
| Sector Rotation (Should) | Heatmap 11 sektor + drill-down 5 ticker teratas |
| Watchlist (Could) | Daftar saham yang disimpan pengguna, localStorage |
| Tanya ARUS (Could) | Kotak pencarian bahasa natural |

### State wajib

| State | Perilaku |
|---|---|
| Belum ada data (ingest pertama belum jalan) | Tampilkan status jelas, bukan halaman kosong tanpa penjelasan |
| Saham dikecualikan karena aksi korporasi | Tampil di daftar terpisah dengan alasannya, jangan disembunyikan diam-diam |
| Saham data belum cukup (IPO baru) | Status "data belum cukup", bukan dianggap "tidak ada sinyal" |
| Pencarian "Tanya ARUS" tidak ketemu hasil | Bilang jelas nggak ketemu, jangan maksa nampilin hasil nggak relevan |

### Sistem desain

- **Nggak sekadar tiru btcfundflow** — konsep UI beda, sesuai keputusan tim (lihat catatan kepatuhan di bagian 13)
- **Label + ikon, jangan warna doang** buat status — SMFI tinggi itu "notable", bukan otomatis "bagus". Hindari pembacaan hijau=beli, merah=jual
- Angka pakai format Indonesia (koma desimal, titik ribuan), tabular-nums biar rapi di tabel
- Atribusi sumber data Sectors di kaki tiap halaman
- Disclaimer di kaki tiap halaman — bukan nasihat investasi, keputusan tetap di tangan pengguna

---

## 12. Anggaran kredit

1.000 kredit. Rumus konsumsi per siklus ingest:

```
Per ticker per refresh:
  1 × /v2/daily/          (harga+volume+market cap)
  1 × /v2/broker-summary/ (flow + dominasi institusi, sekaligus)
  = 2 kredit/ticker/refresh

20-25 ticker × 2 kredit × 3x/minggu × ~2.5 minggu tersisa
  ≈ 300-375 kredit
```

| Pos | Estimasi |
|---|---|
| Backfill awal 14 hari histori (1 panggilan per endpoint per ticker, karena ranged) | ~50 kredit |
| Operasional ingest s.d. submission | 300-375 kredit |
| Registry broker + corporate actions (jarang di-refresh) | ~50 kredit |
| Uji manual & pengembangan | 150 kredit |
| Backtest (KALAU dikerjakan — histori lebih panjang) | 100-200 kredit, cek dulu di Fase 0 |
| Cadangan | 200 kredit |

**Aturan hemat:**

- Ranged query selalu lebih murah daripada panggilan harian terpisah — satu panggilan 14 hari = 1 kredit, bukan 14
- Registry broker (`/v2/brokers/`) dan corporate actions di-cache lama, refresh mingguan bukan tiap siklus
- Selama pengembangan pakai fixture JSON lokal buat iterasi UI, jangan panggil API sungguhan tiap kali
- **Pengaman keras:** kalau `api_calls` per siklus ingest melebihi ambang wajar, hentikan dan kirim notifikasi ke admin — bukan dibiarkan jalan terus tanpa pengawasan
- Kalau backtest butuh histori beberapa bulan, hitung dulu biayanya secara eksplisit di Fase 0 sebelum dikerjakan — jangan ditemukan telat setelah kredit kepake buat hal lain

---

## 13. Fase pengembangan (16 hari, tim 4 orang)

Hari ini Minggu 14 September. Empat orang kerja paralel, bukan berurutan kayak proyek solo — perannya: 1 Backend/Data, 1 Formula/Validasi, 2 Frontend/Bukti.

### Fase 0 — Verifikasi bareng (14-15 Sep) · MEMBLOKIR SEMUANYA

- [x] Semua 4 orang: registrasi hackathon, onboarding Sectors, klaim kredit tim
- [x] Scaffold repo BARU di periode build, commit pertama di dalam periode — konsep UI beda dari btcfundflow (bukan migrasi kode). Repo: `arus-terminal`
- [x] Verifikasi endpoint yang belum pasti: `filings`, `suspensions`, `sector-report`, parameter `sections=` — semua 4 terverifikasi nyata 17 Sep 2026, path aslinya dicatat di `lib/sectors/UNVERIFIED.md`
- [x] Supabase project + skema + RLS (advisor keamanan bersih)
- [x] SMFI 4-komponen penuh terpasang (sinyal insider ikut, bukan dialihkan ke 3 komponen)
- [ ] Kunci universe final (saham LQ45 mana aja yang datanya lengkap) — masih pakai hasil screener otomatis, belum di-review manual
- [ ] Hitung biaya kredit backtest kalau mau dikerjakan

**Selesai bila:** tim bisa jawab pasti komponen mana di SMFI yang bisa dipakai (termasuk sinyal insider), dan biaya kredit sudah dihitung ulang berdasarkan hasil verifikasi nyata. **Status: hampir selesai** — tinggal review universe final dan keputusan backtest.

### Fase 1 — Bangun paralel (15-21 Sep)

- **Backend/Data:** pipeline ingest, cron, tabel histori, idempotensi, log ingesti
- **Formula/Validasi:** implementasi SMFI + Divergence Delta sebagai fungsi murni, unit test dengan data buatan, kasus tepi (aksi korporasi, IPO baru, broker unknown)
- **Frontend ×2:** halaman beranda (daftar pendek) dan halaman detail saham, dengan data fixture dulu sebelum pipeline nyata jalan

**Selesai bila:** cron jalan otomatis menghasilkan skor asli, frontend bisa nampilin data asli (bukan fixture lagi).

### Fase 2 — Integrasi (21-24 Sep)

- Sambungkan frontend ke data asli
- Halaman metodologi
- **Mulai kumpulkan screenshot log ingesti dari sini** — bukti data hidup, nggak bisa direkonstruksi mundur nanti

**Selesai bila:** produk end-to-end jalan tanpa campur tangan manual, dari ingest sampai tampil di layar.

### Fase 3 — Fitur pendukung + pengguna nyata (24-27 Sep)

- Kerjakan sesuai garis potong (bagian 3), dari yang paling murah dulu
- Sebar link ke komunitas trading nyata — friction nol karena nggak perlu akun
- Pasang analitik trafik

**Selesai bila:** ada bukti pemakaian nyata dari orang di luar tim.

### Fase 4 — Video & audit (27-29 Sep)

- Teaser 1 menit + video penjurian ≤3 menit — dengan studi kasus nyata dari data yang udah kesimpen, bukan cuma tur fitur
- Audit keamanan sesuai bagian 10
- Perbaikan state error dan teks yang janggal

**Selesai bila:** kedua video siap submit, audit bersih.

### Fase 5 — Submission (29-30 Sep)

- Rakit item submission lengkap (bagian 15)
- README, dokumentasi, bersihkan rahasia dari repo
- Submit lebih awal

**Peringatan:** repo membeku begitu disubmit. Nggak boleh ada commit apa pun setelahnya kecuali kredensial bocor (revoke dulu, lapor Slack #support, baru commit penghapusannya).

---

## 14. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| ~~Endpoint `filings`/`suspensions`/`sector-report` ternyata nggak ada atau datanya tipis~~ | ~~Sedang~~ | **Selesai 17 Sep** — keempatnya terverifikasi nyata dengan API key asli. SMFI tetap punya fallback 3-komponen di kode kalau suatu hari data insider kosong buat ticker tertentu |
| Formula menghasilkan angka aneh di kasus tepi (aksi korporasi, IPO baru, broker unknown) | Tinggi | Kasus tepi ditangani eksplisit di bagian 4, diuji unit test sebelum dianggap selesai |
| Kredit habis sebelum submission | Sedang | Anggaran dihitung ulang di Fase 0, pengaman keras di proses ingest |
| Rekrutmen pengguna nyata gagal dalam waktu sempit | Tinggi | Mulai Fase 3, bukan ditunda — friction nol (tanpa akun) jadi keunggulan yang harus dimanfaatkan sedini mungkin |
| Video terburu-buru di akhir | Tinggi | Dijadwalkan Fase 4, bukan bagian dari Fase 5 |
| Produk dibaca juri sebagai "cuma dashboard data mentah" | Tinggi | Halaman metodologi + confluence read + daftar pendek jadi bukti derived insight, bukan cuma visual beda |
| "Tanya ARUS" dibangun kebablasan jadi agent otonom | Tinggi | Batas keras di bagian 9 — nol panggilan Sectors API per pertanyaan pengguna |
| Data broker diasumsikan real-time padahal update 3x/minggu | Sedang | Ditulis eksplisit di halaman metodologi dan batasan (bagian 18) |

---

## 15. Kepatuhan aturan hackathon

### Build & kode

- [ ] Repo baru dibuat dalam periode build; commit pertama setelah 19 Agustus 2026
- [ ] Kode ditulis fresh — `btcfundflow` cuma referensi konsep, bukan dimigrasi/di-copy
- [ ] Onboarding Sectors selesai untuk SEMUA 4 anggota tim sebelum kode ditulis
- [ ] Sectors API sebagai sumber data inti — produk kehilangan fungsi tanpanya
- [ ] Skor turunan (SMFI, Divergence Delta) terbukti bukan raw data yang dibungkus visual beda
- [ ] Tidak ada eksekusi transaksi dalam bentuk apa pun
- [ ] Tidak memberi nasihat investasi; disclaimer terpasang di tiap halaman
- [ ] Atribusi sumber data Sectors terpasang
- [ ] Semua rahasia dihapus dari repo dan riwayat commit
- [ ] Repo publik dan tetap publik minimal 90 hari setelah pengumuman pemenang (9 Okt 2026)
- [ ] Proyek eksklusif untuk hackathon ini
- [ ] Tidak ada commit setelah submit

### Submission & eligibility

- [ ] Semua 4 peserta WNI atau berdomisili di Indonesia
- [ ] Teaser 1 menit direkam dan dipublikasikan publik
- [ ] Video penjurian ≤3 menit, publik atau unlisted
- [ ] Problem statement satu kalimat disiapkan (bagian 1)
- [ ] Track dipilih eksplisit — Track 3, Market Intelligence
- [ ] Nama seluruh 4 peserta dicantumkan
- [ ] Post media sosial mempublikasikan proyek dan tag akun resmi Sectors

---

## 16. Metrik keberhasilan

**Untuk hackathon**

- Minimal beberapa puluh kunjungan nyata dari luar tim (dibuktikan analitik trafik)
- Pipeline ingest tercatat jalan otomatis minimal 4-5 siklus tanpa campur tangan manual
- Nol skor yang crash/NaN di kasus tepi
- Nol klaim data yang nggak sesuai kenyataan (misal "real-time" padahal 3x/minggu)

**Untuk produk**

- Rasio klik dari beranda ke halaman detail
- Rasio kunjungan ke halaman metodologi (proxy buat "orang beneran mau ngerti, bukan cuma lewat")
- Watchlist tersimpan (kalau dibangun) sebagai tanda orang balik lagi

Instrumentasi minimum: timestamp tiap `ingestion_runs`, dan event trafik dasar (pageview per halaman) lewat analitik yang dipasang di Fase 3.

---

## 17. Perangkat pendukung pengembangan

### Harness pengembangan

| Alat | Peran |
|---|---|
| Vitest/Jest | Unit test formula SMFI & Divergence Delta — fungsi murni, paling penting diuji otomatis |
| Fixture harness | JSON tiruan respons Sectors buat 20-25 ticker, dipakai Frontend sebelum pipeline nyata jalan |
| GitHub Actions | Lint + type-check + unit test tiap push |
| Sentry (free tier) | Exception tracking — pipeline yang gagal diam-diam nggak boleh luput |

### Keamanan tambahan

- Dependabot buat patch keamanan otomatis
- `gitleaks` sebagai pre-commit hook, bukan pemindaian manual sekali di akhir
- Rate limiting (Upstash Redis, free tier) di endpoint publik yang bisa disalahgunakan

### Skalabilitas

Produk ini publik tanpa akun — beban baca bisa naik cepat kalau viral. Karena semua baca dari cache (bukan live API), ini aman secara kredit; yang perlu dijaga cuma index database yang tepat (`derived_scores_daily(date, smfi_score)`) biar query daftar pendek tetap cepat walau trafik naik.

### Sustainability

- README lengkap — dokumentasi arsitektur dan metodologi jadi bukti technical depth langsung buat juri
- Biaya pasca-hackathon (Sectors + Gemini credit) dicatat estimasinya, biar jelas komitmennya kalau mau dilanjutkan

---

## 18. Batasan yang diakui terbuka

Disebutkan jujur di halaman metodologi dan README.

- Data broker adalah **proxy** dari aktivitas transaksi, bukan bukti langsung "kepemilikan asing" atau niat institusi
- Update 3x seminggu, bukan real-time — ada jeda antara kejadian dan terlihat di skor
- Universe terbatas ~20-25 saham paling likuid, bukan seluruh bursa
- Backtest (kalau ada) berbasis sampel kecil dan satu window pasar — bukan jaminan pola berulang di masa depan
- Bukan nasihat investasi, dan tidak dirancang jadi dasar keputusan tunggal
