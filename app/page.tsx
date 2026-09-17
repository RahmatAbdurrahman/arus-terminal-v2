import Link from "next/link";
import { getShortlist, confluenceText } from "@/lib/queries";

export const revalidate = 300; // 5 menit — halaman ini baca dari cache Supabase, bukan API Sectors langsung

export default async function BerandaPage() {
  const { rows, asOfDate } = await getShortlist(5);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Daftar Pendek Hari Ini</h1>
          <div className="sub">Lima saham dengan sinyal akumulasi terkuat — klik untuk lihat buktinya</div>
        </div>
        <div className="freshness">
          <span className="pulse" />
          {asOfDate ? `Diperbarui ${asOfDate}` : "Belum ada data"}
        </div>
      </div>

      <div className="view">
        <section>
          {rows.length === 0 ? (
            <div className="empty-state">
              Belum ada skor tersimpan. Jalankan <code>npm run seed</code> buat data contoh, atau
              tunggu cron ingest pertama jalan begitu <code>SECTORS_API_KEY</code> sudah diisi.
            </div>
          ) : (
            <div className="shortlist-grid">
              {rows.map((s) => (
                <Link key={s.ticker} href={`/saham/${s.ticker}`} className="stockcard">
                  <div className="row1">
                    <div>
                      <div className="ticker">{s.ticker}</div>
                      <div className="name">{s.name}</div>
                    </div>
                    {s.sector && <span className="sector-pill">{s.sector}</span>}
                  </div>
                  <div className="scorepair">
                    <div>
                      <div className="lbl">SMFI</div>
                      <div className="val">{s.smfi}</div>
                    </div>
                    <div>
                      <div className="lbl">DIVERGENCE</div>
                      <div className="val">
                        {s.divergenceDelta > 0 ? "+" : ""}
                        {s.divergenceDelta}
                      </div>
                    </div>
                  </div>
                  <div className={`confluence-pill ${s.confluence === "distribusi" || s.confluence === "sudah_di_harga" ? "cool" : "hot"}`}>
                    {confluenceText(s.confluence)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
