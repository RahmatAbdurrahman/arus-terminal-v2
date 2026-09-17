import { getLatestBacktest } from "@/lib/queries-backtest";

export const revalidate = 3600;

export default async function BacktestPage() {
  const bt = await getLatestBacktest();

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Backtest</h1>
          <div className="sub">Apakah SMFI tinggi beneran diikuti return yang lebih baik?</div>
        </div>
      </div>

      <div className="view" style={{ maxWidth: 760 }}>
        {!bt ? (
          <div className="empty-state">
            Belum ada hasil backtest. Jalankan <code>npx tsx scripts/backtest.ts</code>.
          </div>
        ) : (
          <>
            <div className="formula-card">
              <h3>Hasil sampel — {bt.tickers.join(", ")}</h3>
              <p>
                {bt.nObservations} observasi harian dari {bt.tickers.length} saham, histori{" "}
                {bt.windowDays} hari bursa, dibandingkan return {bt.forwardDays} hari bursa ke
                depan dari tiap hari.
              </p>

              <div className="component-grid" style={{ marginTop: 16 }}>
                <div className="component">
                  <div className="lbl">
                    Rata-rata return {bt.forwardDays}h (SMFI ≥ {bt.smfiThreshold})
                    <b style={{ color: bt.avgForwardReturnAbove >= 0 ? "var(--accent-strong)" : "var(--cool)" }}>
                      {bt.avgForwardReturnAbove >= 0 ? "+" : ""}
                      {bt.avgForwardReturnAbove.toFixed(2)}%
                    </b>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
                    {bt.nAboveThreshold} dari {bt.nObservations} observasi
                  </div>
                </div>
                <div className="component">
                  <div className="lbl">
                    Rata-rata return {bt.forwardDays}h (semua observasi)
                    <b>
                      {bt.avgForwardReturnBaseline >= 0 ? "+" : ""}
                      {bt.avgForwardReturnBaseline.toFixed(2)}%
                    </b>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>baseline pembanding</div>
                </div>
              </div>

              <p style={{ marginTop: 16 }}>
                {bt.avgForwardReturnAbove > bt.avgForwardReturnBaseline
                  ? `Di sampel ini, hari-hari dengan SMFI tinggi diikuti return rata-rata yang SEDIKIT LEBIH TINGGI dibanding baseline.`
                  : `Di sampel ini, hari-hari dengan SMFI tinggi TIDAK diikuti return yang lebih baik dibanding baseline — bahkan sedikit lebih rendah. Kami tampilkan ini apa adanya, bukan cuma hasil yang mendukung hipotesis.`}
              </p>
            </div>

            <div className="formula-card">
              <h3>Batasan — baca ini sebelum menyimpulkan apa pun</h3>
              <div className="limits-list">
                <div>Sampel cuma {bt.tickers.length} saham dari total universe — bukan seluruh LQ45, apalagi seluruh bursa.</div>
                <div>Satu window waktu ({bt.windowDays} hari terakhir) — kondisi pasar spesifik periode ini, belum tentu berulang.</div>
                <div>{bt.nObservations} observasi itu jumlah yang kecil secara statistik — jangan disamakan dengan riset akademis.</div>
                <div>Ini BUKAN prediksi masa depan, dan BUKAN nasihat investasi. Korelasi historis (kalau ada) tidak menjamin pola akan berulang.</div>
                <div>Hasil bisa berubah kalau backtest dijalankan ulang dengan sampel atau periode yang beda.</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
