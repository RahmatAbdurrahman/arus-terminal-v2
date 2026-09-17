-- ARUS Terminal — skema awal. Lihat PRD.md bagian 7.
-- Produk ini publik tanpa akun: RLS dibaca publik, ditulis cuma service role.

create table if not exists companies (
  ticker         text primary key,
  name           text not null,
  sector         text,
  sub_sector     text,
  is_lq45        boolean not null default false,
  free_float_pct numeric, -- proxy dari ownership."Public", bukan definisi resmi bursa — lihat lib/sectors/UNVERIFIED.md
  listing_date   date,
  updated_at     timestamptz not null default now()
);

create table if not exists price_daily (
  ticker     text not null references companies(ticker) on delete cascade,
  date       date not null,
  close      numeric not null,
  volume     bigint not null,
  market_cap numeric not null,
  primary key (ticker, date)
);

create table if not exists broker_flow_daily (
  ticker                     text not null references companies(ticker) on delete cascade,
  date                       date not null,
  net_foreign_buy            numeric not null,
  institutional_value        numeric not null,
  total_value                numeric not null,
  excluded_corporate_action  boolean not null default false,
  primary key (ticker, date)
);

create table if not exists brokers_registry (
  broker_code text primary key,
  is_foreign  boolean not null,
  cohort      text check (cohort in ('institutional','mixed','retail','unknown')),
  updated_at  timestamptz not null default now()
);

-- Dibuat kosong sampai endpoint filings terverifikasi (lihat lib/sectors/UNVERIFIED.md).
-- SMFI tetap jalan tanpa tabel ini terisi — bobotnya dialihkan otomatis.
create table if not exists insider_signal_daily (
  ticker text not null references companies(ticker) on delete cascade,
  date   date not null,
  signal numeric not null check (signal in (0, 0.5, 1)),
  primary key (ticker, date)
);

create table if not exists derived_scores_daily (
  ticker              text not null references companies(ticker) on delete cascade,
  date                date not null,
  smfi_score          numeric not null,
  divergence_delta    numeric not null,
  confluence_label    text not null,
  flow_pctl           numeric, -- persentil komponen (0-100) SEBELUM dibobot — breakdown radar chart di UI
  institutional_pctl  numeric,
  turnover_pctl       numeric,
  insider_pctl        numeric, -- null kalau hari itu bobot insider dialihkan (nggak ada data insider sama sekali)
  computed_at         timestamptz not null default now(),
  primary key (ticker, date)
);

create table if not exists sector_rotation_daily (
  sub_sector  text not null,
  date        date not null,
  breadth     numeric not null,
  momentum    numeric not null,
  money_flow  numeric not null,
  label       text not null check (label in ('Hot','Warming','Cold','Distribution')),
  primary key (sub_sector, date)
);

create table if not exists ingestion_runs (
  id                 uuid primary key default gen_random_uuid(),
  started_at         timestamptz not null default now(),
  finished_at        timestamptz,
  tickers_processed  int not null default 0,
  api_calls          int not null default 0,
  status             text not null check (status in ('success','partial','failed')),
  errors             jsonb
);

create table if not exists narratives_cache (
  cache_key   text primary key,
  ticker      text,
  output      text not null,
  source      text not null check (source in ('gemini','template')),
  created_at  timestamptz not null default now()
);

create table if not exists backtest_results (
  id                           uuid primary key default gen_random_uuid(),
  run_at                       timestamptz not null default now(),
  tickers_sampled              text[] not null,
  n_observations               integer not null,
  smfi_threshold                numeric not null,
  n_above_threshold             integer not null,
  avg_forward_return_above      numeric not null,
  avg_forward_return_baseline   numeric not null,
  window_days                   integer not null,
  forward_days                  integer not null
);

create index if not exists idx_derived_scores_date_smfi
  on derived_scores_daily (date, smfi_score desc);

create index if not exists idx_price_daily_ticker_date
  on price_daily (ticker, date desc);

create index if not exists idx_broker_flow_ticker_date
  on broker_flow_daily (ticker, date desc);

-- ---------- RLS ----------

alter table companies enable row level security;
alter table price_daily enable row level security;
alter table broker_flow_daily enable row level security;
alter table derived_scores_daily enable row level security;
alter table sector_rotation_daily enable row level security;
alter table narratives_cache enable row level security;
alter table brokers_registry enable row level security;
alter table insider_signal_daily enable row level security;
alter table ingestion_runs enable row level security;
alter table backtest_results enable row level security;

-- Baca publik (produk ini nggak pakai akun) buat tabel yang tampil di UI
create policy "public read" on companies for select using (true);
create policy "public read" on price_daily for select using (true);
create policy "public read" on broker_flow_daily for select using (true);
create policy "public read" on derived_scores_daily for select using (true);
create policy "public read" on sector_rotation_daily for select using (true);
create policy "public read" on narratives_cache for select using (true);
create policy "public read" on backtest_results for select using (true);

-- Tabel operasional: service role saja, tidak ada policy untuk anon/authenticated
-- (brokers_registry, insider_signal_daily, ingestion_runs sengaja tidak dibuatkan
-- policy select publik — akses cuma lewat service role di proses ingest/admin)
