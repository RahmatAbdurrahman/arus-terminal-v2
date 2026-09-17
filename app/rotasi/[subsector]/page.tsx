import Link from "next/link";
import { getSectorRotation, getTopTickersInSubSector } from "@/lib/queries-rotation";

export const revalidate = 300;

const LABEL_CLASS: Record<string, string> = { Hot: "l-hot", Warming: "l-warm", Cold: "l-cold", Distribution: "l-dist" };

export default async function SubSectorPage({ params }: { params: Promise<{ subsector: string }> }) {
  const { subsector } = await params;
  const subSector = decodeURIComponent(subsector);

  const [{ rows }, top] = await Promise.all([getSectorRotation(), getTopTickersInSubSector(subSector)]);
  const row = rows.find((r) => r.subSector === subSector);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>{subSector}</h1>
          <div className="sub">
            <Link href="/rotasi" style={{ color: "var(--accent-strong)" }}>
              ← Semua sektor
            </Link>
          </div>
        </div>
        {row && <div className={`slabel ${LABEL_CLASS[row.label]}`}>{row.label}</div>}
      </div>

      <div className="view">
        {row && (
          <section>
            <div className="component-grid">
              <div className="component">
                <div className="lbl">Breadth<b>{Math.round(row.breadth)}%</b></div>
                <div className="meter"><i style={{ width: `${row.breadth}%` }} /></div>
              </div>
              <div className="component">
                <div className="lbl">Momentum 7 hari<b>{row.momentum > 0 ? "+" : ""}{row.momentum.toFixed(1)}%</b></div>
              </div>
              <div className="component">
                <div className="lbl">Perubahan market cap<b>{row.moneyFlow > 0 ? "+" : ""}{row.moneyFlow.toFixed(1)}%</b></div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="section-title">
            <h2>Top saham di sektor ini</h2>
          </div>
          {top.length === 0 ? (
            <div className="empty-state">Belum ada saham dengan skor di subsektor ini.</div>
          ) : (
            <div className="drill-list">
              {top.map((t) => (
                <Link key={t.ticker} href={`/saham/${t.ticker}`} className="drill-row">
                  <span className="t">{t.ticker}</span>
                  <span>{t.name}</span>
                  <span className="s">{t.smfi}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
