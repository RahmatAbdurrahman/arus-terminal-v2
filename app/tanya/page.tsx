"use client";

import { useState } from "react";
import Link from "next/link";

const EXAMPLES = [
  "sektor apa yang lagi hot minggu ini",
  "saham float kecil yang volumenya tiba-tiba naik",
  "mana yang harganya belum naik tapi asing udah masuk",
];

interface Result {
  ticker: string;
  name: string;
  sector: string | null;
  smfi: number;
  divergenceDelta: number;
  confluence: string;
}

const CONFLUENCE_TEXT: Record<string, string> = {
  akumulasi_senyap: "Akumulasi masih senyap",
  sudah_di_harga: "Sudah kelihatan di harga",
  distribusi: "Distribusi terdeteksi",
  sinyal_sedang: "Sinyal sedang",
};

export default function TanyaPage() {
  const [question, setQuestion] = useState("saham perbankan yang lagi diakumulasi diam-diam");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(q: string) {
    setLoading(true);
    setQuestion(q);
    try {
      const res = await fetch("/api/tanya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Tanya ARUS</h1>
          <div className="sub">Cari pakai bahasa biasa, jawabannya dari data yang sudah dihitung</div>
        </div>
      </div>

      <div className="view" style={{ maxWidth: 760 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(question)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 14,
            }}
          />
          <button
            onClick={() => search(question)}
            disabled={loading}
            style={{
              background: "var(--accent)",
              color: "#04211C",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontFamily: "var(--mono)",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Mencari…" : "Cari"}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => search(ex)}
              className="sector-pill"
              style={{ cursor: "pointer" }}
            >
              {ex}
            </button>
          ))}
        </div>

        {results !== null && (
          <section style={{ marginTop: 22 }}>
            <div className="section-title">
              <h2>Hasil</h2>
              <span className="count">{results.length} saham cocok</span>
            </div>
            {results.length === 0 ? (
              <div className="empty-state">Nggak ketemu saham yang cocok. Coba pertanyaan lain.</div>
            ) : (
              <div className="shortlist-grid">
                {results.map((r) => (
                  <Link key={r.ticker} href={`/saham/${r.ticker}`} className="stockcard">
                    <div className="row1">
                      <div>
                        <div className="ticker">{r.ticker}</div>
                        <div className="name">{r.name}</div>
                      </div>
                      {r.sector && <span className="sector-pill">{r.sector}</span>}
                    </div>
                    <div className="scorepair">
                      <div>
                        <div className="lbl">SMFI</div>
                        <div className="val">{r.smfi}</div>
                      </div>
                      <div>
                        <div className="lbl">DIVERGENCE</div>
                        <div className="val">
                          {r.divergenceDelta > 0 ? "+" : ""}
                          {r.divergenceDelta}
                        </div>
                      </div>
                    </div>
                    <div className={`confluence-pill ${r.confluence === "distribusi" || r.confluence === "sudah_di_harga" ? "cool" : "hot"}`}>
                      {CONFLUENCE_TEXT[r.confluence] ?? r.confluence}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        <div
          style={{
            display: "flex",
            gap: 9,
            fontSize: 12,
            color: "var(--text-faint)",
            borderTop: "1px solid var(--border)",
            paddingTop: 14,
            marginTop: 8,
          }}
        >
          ⚙ Fitur ini cuma menerjemahkan pertanyaan jadi filter, lalu mencari di data yang sudah
          tersimpan. Tidak pernah memanggil API Sectors langsung per pertanyaan.
        </div>
      </div>
    </>
  );
}
