"use client";

import { useState } from "react";
import { ConfluenceLabel } from "@/lib/formulas/types";

export default function ExplainButton({
  ticker,
  smfi,
  divergenceDelta,
  confluence,
}: {
  ticker: string;
  smfi: number;
  divergenceDelta: number;
  confluence: ConfluenceLabel;
}) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function jelaskan() {
    setLoading(true);
    try {
      const res = await fetch("/api/jelaskan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, smfi, divergenceDelta, confluence }),
      });
      const data = await res.json();
      setNarrative(data.narrative ?? "Gagal memuat narasi.");
    } catch {
      setNarrative("Gagal memuat narasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: 4 }}>
      {narrative ? (
        <div className="formula-card" style={{ padding: "14px 18px" }}>
          <p style={{ margin: 0 }}>{narrative}</p>
        </div>
      ) : (
        <button
          onClick={jelaskan}
          disabled={loading}
          className="navlink"
          style={{ width: "fit-content", cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "Memuat…" : "✨ Jelaskan skor ini"}
        </button>
      )}
    </div>
  );
}
