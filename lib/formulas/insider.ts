import type { FilingRow } from "../sectors/types";
import type { InsiderSignalDay } from "./types";

/**
 * PRD.md bagian 4 / insight BandarFlow: insider net-buy 30 hari.
 * buy = 1, netral = 0.5, sell = 0 — berdasarkan nilai transaksi (rupiah),
 * bukan cuma hitung transaksi, biar satu transaksi besar tidak kalah
 * bobotnya dari banyak transaksi kecil.
 */
export function computeInsiderSignal(filings: FilingRow[], asOfDate: string): InsiderSignalDay[] {
  const windowStart = new Date(asOfDate + "T00:00:00Z");
  windowStart.setUTCDate(windowStart.getUTCDate() - 30);

  const inWindow = filings.filter((f) => {
    if (f.holder_type !== "insider") return false;
    const t = new Date(f.timestamp);
    return t >= windowStart && t <= new Date(asOfDate + "T23:59:59Z");
  });

  if (inWindow.length === 0) return []; // tidak ada data — komponen ini null, bukan dipaksa netral

  let buyValue = 0;
  let sellValue = 0;
  for (const f of inWindow) {
    if (f.transaction_type === "buy") buyValue += f.transaction_value;
    else if (f.transaction_type === "sell") sellValue += f.transaction_value;
  }

  const signal: 1 | 0.5 | 0 = buyValue > sellValue ? 1 : sellValue > buyValue ? 0 : 0.5;
  return [{ date: asOfDate, signal }];
}
