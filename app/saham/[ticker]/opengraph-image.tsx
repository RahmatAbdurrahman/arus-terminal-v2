import { ImageResponse } from "next/og";
import { getTickerDetail, confluenceText } from "@/lib/queries";
import { confluenceLabel } from "@/lib/formulas/smfi";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Kartu ringkas yang muncul otomatis pas link /saham/[ticker] dibagikan
 * ke Telegram/WhatsApp/X — PRD.md bagian 3, "Snapshot yang bisa dibagikan".
 * Next.js men-generate ini di-request, nggak perlu canvas/library gambar.
 *
 * Satori (mesin di balik ImageResponse) MEWAJIBKAN setiap elemen yang
 * punya anak menyatakan display eksplisit — nggak boleh diwariskan
 * default kayak CSS browser biasa. Semua elemen di bawah sengaja dikasih
 * display:flex eksplisit, termasuk yang cuma satu anak, biar nggak ada
 * ambiguitas.
 */
export default async function OgImage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: raw } = await params;
  const ticker = raw.toUpperCase();
  const { company, score } = await getTickerDetail(ticker);

  const label = score ? confluenceLabel(score.smfi_score, score.divergence_delta) : null;
  const smfiText = score ? String(score.smfi_score) : "—";
  const divergenceText = score ? `${score.divergence_delta > 0 ? "+" : ""}${score.divergence_delta}` : "—";
  const nameText = company?.name ?? "Saham IDX";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0B0F17",
          padding: 64,
          fontFamily: "sans-serif",
          color: "#E9EEF4",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#26C6B4", fontWeight: 700 }}>ARUS TERMINAL</div>

        <div style={{ display: "flex", marginTop: 40, fontSize: 96, fontWeight: 800 }}>{ticker}</div>

        <div style={{ display: "flex", fontSize: 30, color: "#9FADC0", marginTop: 4 }}>{nameText}</div>

        <div style={{ display: "flex", flexDirection: "row", marginTop: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 400 }}>
            <div style={{ display: "flex", fontSize: 22, color: "#5F6D82" }}>SMFI SCORE</div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>{smfiText}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, color: "#5F6D82" }}>DIVERGENCE DELTA</div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>{divergenceText}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "row", marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              color: "#4FE0CE",
              background: "#123330",
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 22,
              paddingRight: 22,
              borderRadius: 8,
            }}
          >
            {label ? confluenceText(label) : "Belum ada skor"}
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "auto", fontSize: 20, color: "#5F6D82" }}>
          Skor turunan dari data transaksi IDX · bukan nasihat investasi
        </div>
      </div>
    ),
    { ...size }
  );
}
