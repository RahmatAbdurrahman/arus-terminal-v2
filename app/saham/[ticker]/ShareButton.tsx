"use client";

import { useState } from "react";

export default function ShareButton({ ticker }: { ticker: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/saham/${ticker}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API bisa ditolak browser — diam aja, bukan fatal
    }
  }

  return (
    <button onClick={copyLink} className="navlink" style={{ width: "fit-content", cursor: "pointer" }}>
      {copied ? "✓ Link disalin" : "⤴ Bagikan"}
    </button>
  );
}
