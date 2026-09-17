"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWatchlist, toggleWatch } from "@/lib/watchlist";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface Row {
  ticker: string;
  name: string;
  smfi: number;
  divergenceDelta: number;
}

export default function WatchlistPage() {
  const [tickers, setTickers] = useState<string[] | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTickers(getWatchlist());
  }, []);

  useEffect(() => {
    if (tickers === null) return;
    if (tickers.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    (async () => {
      const db = supabaseBrowser();
      const { data: latest } = await db
        .from("derived_scores_daily")
        .select("date")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!latest) {
        setLoading(false);
        return;
      }
      const { data } = await db
        .from("derived_scores_daily")
        .select("ticker,smfi_score,divergence_delta,companies(name)")
        .eq("date", latest.date)
        .in("ticker", tickers);

      setRows(
        (data ?? []).map((r: any) => ({
          ticker: r.ticker,
          name: r.companies?.name ?? r.ticker,
          smfi: r.smfi_score,
          divergenceDelta: r.divergence_delta,
        }))
      );
      setLoading(false);
    })();
  }, [tickers]);

  function remove(ticker: string) {
    const next = toggleWatch(ticker);
    setTickers(next);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Watchlist</h1>
          <div className="sub">Saham yang kamu simpan buat dipantau</div>
        </div>
      </div>

      <div className="view" style={{ maxWidth: 640 }}>
        <div className="empty-state" style={{ textAlign: "left", padding: "12px 16px" }}>
          💾 Tersimpan di perangkat ini saja (localStorage) — tanpa akun, tanpa login. Tidak
          sinkron lintas perangkat.
        </div>

        {loading ? null : rows.length === 0 ? (
          <div className="empty-state">
            Belum ada saham disimpan. Buka halaman detail saham mana pun dan klik &quot;☆ Simpan
            ke watchlist&quot;.
          </div>
        ) : (
          <div className="drill-list">
            {rows.map((r) => (
              <div key={r.ticker} className="drill-row" style={{ gridTemplateColumns: "70px 1fr 60px 90px" }}>
                <Link href={`/saham/${r.ticker}`} className="t">
                  {r.ticker}
                </Link>
                <span>{r.name}</span>
                <span className="s">{r.smfi}</span>
                <button
                  onClick={() => remove(r.ticker)}
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    padding: "4px 9px",
                    fontSize: 11,
                    color: "var(--text-faint)",
                    cursor: "pointer",
                  }}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
