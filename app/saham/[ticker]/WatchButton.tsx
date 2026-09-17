"use client";

import { useEffect, useState } from "react";
import { isWatched, toggleWatch } from "@/lib/watchlist";

export default function WatchButton({ ticker }: { ticker: string }) {
  const [watched, setWatched] = useState<boolean | null>(null); // null = belum tau (hindari mismatch SSR/CSR)

  useEffect(() => {
    setWatched(isWatched(ticker));
  }, [ticker]);

  if (watched === null) return null; // render setelah localStorage sempat dibaca di klien

  return (
    <button
      className="navlink"
      style={{ width: "fit-content", cursor: "pointer" }}
      onClick={() => setWatched(toggleWatch(ticker).includes(ticker))}
    >
      {watched ? "★ Tersimpan di watchlist" : "☆ Simpan ke watchlist"}
    </button>
  );
}
