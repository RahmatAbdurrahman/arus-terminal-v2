export default function MetodologiPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Metodologi</h1>
          <div className="sub">Rumus terbuka — bisa diaudit siapa pun, bukan black box</div>
        </div>
      </div>

      <div className="view">
        <div className="formula-card">
          <h3>SMFI — Smart Money Flow Index · skor 0–100</h3>
          <p>
            Menjawab: seberapa besar tanda-tanda institusi/asing sedang mengumpulkan saham ini,
            dibanding hari normal dan dibanding saham lain hari ini.
          </p>
          <div className="weight-row">
            <span>Intensitas arus</span>
            <span className="wbar"><i style={{ width: "40%" }} /></span>
            <span className="wval">40%</span>
          </div>
          <div className="weight-row">
            <span>Dominasi institusi</span>
            <span className="wbar"><i style={{ width: "30%" }} /></span>
            <span className="wval">30%</span>
          </div>
          <div className="weight-row">
            <span>Turnover relatif</span>
            <span className="wbar"><i style={{ width: "20%" }} /></span>
            <span className="wval">20%</span>
          </div>
          <div className="weight-row">
            <span>Sinyal insider</span>
            <span className="wbar"><i style={{ width: "10%" }} /></span>
            <span className="wval">10%</span>
          </div>
          <div className="formula-block">{`SMFI = 40%·pctl(flow_intensity) + 30%·pctl(dominasi_institusi)
      + 20%·pctl(turnover_relatif) + 10%·pctl(sinyal_insider)
      − penalti_float_kecil`}</div>
          <p>
            Semua komponen di-ranking sebagai <b>persentil</b> lintas seluruh universe hari itu —
            bukan ambang rupiah tetap. Rp15 miliar itu besar buat saham kecil, receh buat BBCA.
            Kalau data insider belum tersedia, bobotnya dialihkan otomatis ke tiga komponen
            lain (45% / 30% / 25%).
          </p>
        </div>

        <div className="formula-card">
          <h3>Divergence Delta · −100 s/d +100</h3>
          <p>Menjawab: asingnya udah masuk, tapi harganya udah gerak apa belum?</p>
          <div className="formula-block">{`Divergence Delta = pctl(flow_intensity_15d) − pctl(perubahan_harga_15d)`}</div>
          <p>
            Nilai tinggi = arus masuk deras tapi harga belum banyak bergerak — akumulasi senyap
            sebelum markup. Nilai rendah = harga sudah duluan naik, kemungkinan FOMO ritel, bukan
            smart money.
          </p>
        </div>

        <div className="formula-card">
          <h3>Kenapa persentil, bukan angka absolut</h3>
          <p>
            Data finansial berekor panjang — beberapa hari ekstrem bisa membuat rata-rata dan
            standar deviasi jadi tidak stabil. Persentil (ranking relatif) jauh lebih tahan
            terhadap outlier dibanding ambang rupiah tetap atau z-score.
          </p>
        </div>

        <div className="formula-card">
          <h3>Kasus tepi yang kami tangani</h3>
          <div className="limits-list">
            <div>Saham dengan aksi korporasi (split, rights issue) dalam 15 hari terakhir dikecualikan dari perhitungan hari itu.</div>
            <div>Saham yang baru listing (histori &lt; 20 hari) dikecualikan sampai datanya cukup buat baseline turnover.</div>
            <div>Saham dengan turnover di bawah lantai likuiditas dikecualikan, biar rasio nggak meledak dari noise kecil.</div>
            <div>Saham float &lt; 15% dikenai penalti langsung di SMFI — lebih gampang digoreng, jadi skornya sengaja didiskon.</div>
          </div>
        </div>

        <div className="formula-card">
          <h3>Batasan yang kami akui terbuka</h3>
          <div className="limits-list">
            <div>Data broker adalah proxy dari aktivitas transaksi, bukan bukti langsung kepemilikan asing atau niat institusi.</div>
            <div>Free-float pakai proxy kepemilikan "Public" dari data ownership Sectors, bukan definisi free-float resmi bursa — bisa beda tipis dari angka resmi IDX.</div>
            <div>Data diperbarui beberapa kali seminggu, bukan real-time — ada jeda antara kejadian dan terlihat di skor.</div>
            <div>Universe terbatas pada saham paling likuid, bukan seluruh bursa.</div>
            <div>Bukan nasihat investasi, dan tidak dirancang jadi dasar keputusan tunggal.</div>
          </div>
        </div>
      </div>
    </>
  );
}
