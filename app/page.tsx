import Link from "next/link";
import { getShortlist, confluenceText } from "@/lib/queries";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";
import ShortlistCard from "@/components/ShortlistCard";

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
            <StaggerGrid className="shortlist-grid">
              {rows.map((s) => (
                <StaggerItem key={s.ticker}>
                  <ShortlistCard row={s} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </section>
      </div>
    </>
  );
}
