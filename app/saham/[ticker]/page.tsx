import { notFound } from "next/navigation";
import { getTickerDetail, confluenceText } from "@/lib/queries";
import { confluenceLabel } from "@/lib/formulas/smfi";
import WatchButton from "./WatchButton";
import ExplainButton from "./ExplainButton";
import ShareButton from "./ShareButton";
import PriceFlowChart from "@/components/charts/PriceFlowChart";
import ComponentRadar from "@/components/charts/ComponentRadar";
import SmfiHistoryChart from "@/components/charts/SmfiHistoryChart";

export const revalidate = 300;

export default async function DetailSahamPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params; // Next.js 16: params jadi Promise
  const ticker = rawTicker.toUpperCase();
  const { company, score, prices, flows, scoreHistory } = await getTickerDetail(ticker);

  if (!company) notFound();

  const label = score ? confluenceLabel(score.smfi_score, score.divergence_delta) : null;

  // Gabungkan harga + flow per tanggal buat tabel log transaksi
  const flowByDate = new Map(flows.map((f: any) => [f.date, f]));
  const log = prices
    .map((p: any) => ({ ...p, flow: flowByDate.get(p.date) }))
    .reverse();

  const priceFlowData = prices.map((p: any) => ({
    date: p.date,
    close: Number(p.close),
    netForeignBuy: flowByDate.get(p.date) ? Number((flowByDate.get(p.date) as any).net_foreign_buy) : null,
  }));

  const smfiHistoryData = (scoreHistory as any[]).map((h) => ({
    date: h.date,
    smfi: h.smfi_score,
    divergence: h.divergence_delta,
  }));

  return (
    <>
      <div className="topbar">
        <div>
          <h1>{ticker}</h1>
          <div className="sub">
            {company.name} · {company.sector ?? "Sektor belum tercatat"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="freshness">Log {prices.length} hari bursa terakhir</div>
          <WatchButton ticker={ticker} />
          <ShareButton ticker={ticker} />
        </div>
      </div>

      <div className="view">
        {score && <ExplainButton ticker={ticker} smfi={score.smfi_score} divergenceDelta={score.divergence_delta} confluence={label!} />}
        {score ? (
          <div className="detail-head">
            <div>
              <div style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 30 }}>{ticker}</div>
              {label && (
                <div className={`confluence-pill ${label === "distribusi" || label === "sudah_di_harga" ? "cool" : "hot"}`} style={{ marginTop: 10 }}>
                  {confluenceText(label)}
                </div>
              )}
            </div>
            <div className="bignum">
              <div className="lbl">SMFI SCORE</div>
              <div className="val">{score.smfi_score}</div>
            </div>
            <div className="bignum">
              <div className="lbl">DIVERGENCE DELTA</div>
              <div className="val">
                {score.divergence_delta > 0 ? "+" : ""}
                {score.divergence_delta}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">Belum ada skor buat {ticker} — jalankan ingest/seed dulu.</div>
        )}

        {priceFlowData.length > 0 && (
          <section>
            <div className="section-title">
              <h2>Harga &amp; Net Foreign Buy</h2>
              <span className="count">{priceFlowData.length} hari bursa</span>
            </div>
            <div className="chart-card">
              <PriceFlowChart data={priceFlowData} />
            </div>
          </section>
        )}

        {score && (
          <div className="chart-row">
            <section style={{ flex: "1 1 320px" }}>
              <div className="section-title">
                <h2>Breakdown Komponen SMFI</h2>
              </div>
              <div className="chart-card">
                <ComponentRadar
                  data={{
                    flowPctl: (score as any).flow_pctl,
                    institutionalPctl: (score as any).institutional_pctl,
                    turnoverPctl: (score as any).turnover_pctl,
                    insiderPctl: (score as any).insider_pctl,
                  }}
                />
              </div>
            </section>
            <section style={{ flex: "1 1 320px" }}>
              <div className="section-title">
                <h2>Riwayat Skor</h2>
              </div>
              <div className="chart-card">
                <SmfiHistoryChart data={smfiHistoryData} />
              </div>
            </section>
          </div>
        )}

        <section>
          <div className="section-title">
            <h2>Log Transaksi</h2>
          </div>
          {log.length === 0 ? (
            <div className="empty-state">Belum ada data harga tersimpan buat {ticker}.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Net Foreign Buy (Rp)</th>
                    <th>Harga Close</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((row: any) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td style={{ fontFamily: "var(--mono)", color: (row.flow?.net_foreign_buy ?? 0) >= 0 ? "var(--accent-strong)" : "var(--cool)" }}>
                        {row.flow ? `${row.flow.net_foreign_buy >= 0 ? "+" : ""}${Math.round(row.flow.net_foreign_buy).toLocaleString("id-ID")}` : "—"}
                      </td>
                      <td style={{ fontFamily: "var(--mono)" }}>{Number(row.close).toLocaleString("id-ID")}</td>
                      <td style={{ fontFamily: "var(--mono)" }}>{Number(row.volume).toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
