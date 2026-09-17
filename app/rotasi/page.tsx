import Link from "next/link";
import { getSectorRotation } from "@/lib/queries-rotation";

export const revalidate = 300;

const LABEL_CLASS: Record<string, string> = { Hot: "l-hot", Warming: "l-warm", Cold: "l-cold", Distribution: "l-dist" };

export default async function RotasiPage() {
  const { rows, asOfDate } = await getSectorRotation();

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Rotasi Sektor</h1>
          <div className="sub">Sektor mana yang lagi panas, mana yang lagi distribusi</div>
        </div>
        <div className="freshness">
          <span className="pulse" />
          {asOfDate ? `${rows.length} subsektor · ${asOfDate}` : "Belum ada data"}
        </div>
      </div>

      <div className="view">
        {rows.length === 0 ? (
          <div className="empty-state">
            Belum ada data rotasi sektor — jalankan ingest dulu (butuh minimal 20 hari histori
            harga per saham).
          </div>
        ) : (
          <section>
            <div className="sector-grid">
              {rows.map((r) => (
                <Link key={r.subSector} href={`/rotasi/${encodeURIComponent(r.subSector)}`} className="sectile">
                  <div className="sname">{r.subSector}</div>
                  <div className={`slabel ${LABEL_CLASS[r.label]}`}>{r.label}</div>
                  <div className="sbreadth">breadth {Math.round(r.breadth)}%</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
