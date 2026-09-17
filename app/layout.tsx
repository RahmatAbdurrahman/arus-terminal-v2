import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARUS Terminal",
  description: "IDX Smart Money & Capital Flow Terminal — Sectors Hackathon 2026, Track 3",
};

const NAV_CORE = [
  { href: "/", label: "Beranda" },
  { href: "/metodologi", label: "Metodologi" },
];

const NAV_SUPPORT = [
  { href: "/rotasi", label: "Rotasi Sektor" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/tanya", label: "Tanya ARUS" },
  { href: "/backtest", label: "Backtest" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <nav className="side">
            <div className="brand">
              <div className="wordmark">
                ARUS<span>·</span>
              </div>
              <div className="tag">TERMINAL SMART MONEY IDX</div>
            </div>

            <div>
              <div className="navlabel">Fitur inti</div>
              {NAV_CORE.map((item) => (
                <Link key={item.href} href={item.href} className="navlink">
                  {item.label}
                  <span className="badge core">WAJIB</span>
                </Link>
              ))}
            </div>

            <div>
              <div className="navlabel">Fitur pendukung</div>
              {NAV_SUPPORT.map((item) => (
                <Link key={item.href} href={item.href} className="navlink">
                  {item.label}
                  <span className="badge support">OPSIONAL</span>
                </Link>
              ))}
            </div>
          </nav>

          <main className="main">
            {children}
            <footer className="disclaimer">
              ARUS Terminal menampilkan skor turunan dari data transaksi publik IDX, bukan nasihat
              investasi. Data broker adalah proxy aktivitas transaksi, bukan bukti langsung
              kepemilikan asing. Lihat halaman Metodologi untuk batasan lengkap. Sumber data:
              Sectors API.
            </footer>
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
