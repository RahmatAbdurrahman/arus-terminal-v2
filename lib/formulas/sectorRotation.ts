import { percentileRank } from "./percentile";

/**
 * Sector Rotation Heatmap — PRD.md bagian 5. Formula per subsektor, per hari:
 *
 *   breadth    = % saham di subsektor yang closing di atas MA20
 *   momentum   = median return 7 hari seluruh saham di subsektor
 *   money_flow = perubahan total market cap subsektor dibanding 7 hari lalu
 *
 * Semua 3 dihitung dari data yang UDAH ada di price_daily — tidak ada
 * panggilan API tambahan. Konsisten sama prinsip single-ingestion-cache.
 */

export interface StockSnapshot {
  ticker: string;
  subSector: string;
  closes: { date: string; close: number; marketCap: number }[]; // urut tanggal menaik, minimal 20 hari
}

export interface SectorRotationRow {
  subSector: string;
  breadth: number; // 0-100
  momentum: number; // % median return 7 hari, bisa negatif
  moneyFlow: number; // % perubahan market cap 7 hari, bisa negatif
  compositeScore: number; // 0-100, persentil gabungan lintas subsektor
  label: "Hot" | "Warming" | "Cold" | "Distribution";
}

function ma(closes: number[], window: number): number | null {
  if (closes.length < window) return null;
  const slice = closes.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / window;
}

function pctChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function computeSectorRotation(stocks: StockSnapshot[]): SectorRotationRow[] {
  const bySubSector = new Map<string, StockSnapshot[]>();
  for (const s of stocks) {
    if (s.closes.length < 20) continue; // sama seperti kasus tepi SMFI — butuh baseline 20 hari
    const arr = bySubSector.get(s.subSector) ?? [];
    arr.push(s);
    bySubSector.set(s.subSector, arr);
  }

  const subSectors = [...bySubSector.keys()];
  const raw = subSectors.map((sub) => {
    const members = bySubSector.get(sub)!;

    let aboveMA20 = 0;
    const returns7d: number[] = [];
    let totalMcapNow = 0;
    let totalMcapWeekAgo = 0;

    for (const m of members) {
      const closesOnly = m.closes.map((c) => c.close);
      const ma20 = ma(closesOnly, 20);
      const latest = m.closes[m.closes.length - 1];
      if (!latest) continue; // sudah dijamin non-kosong oleh filter closes.length < 20 di atas, tapi TS tetap minta dicek
      if (ma20 !== null && latest.close > ma20) aboveMA20 += 1;

      const weekAgoIdx = m.closes.length - 8; // ~7 hari bursa lalu
      const weekAgo = weekAgoIdx >= 0 ? m.closes[weekAgoIdx] : undefined;
      if (weekAgo) {
        returns7d.push(pctChange(weekAgo.close, latest.close));
        totalMcapNow += latest.marketCap;
        totalMcapWeekAgo += weekAgo.marketCap;
      }
    }

    const sortedReturns = [...returns7d].sort((a, b) => a - b);
    const momentum = sortedReturns.length > 0 ? sortedReturns[Math.floor(sortedReturns.length / 2)]! : 0;
    const moneyFlow = totalMcapWeekAgo > 0 ? pctChange(totalMcapWeekAgo, totalMcapNow) : 0;
    const breadth = members.length > 0 ? (aboveMA20 / members.length) * 100 : 0;

    return { subSector: sub, breadth, momentum, moneyFlow };
  });

  const pctlBreadth = percentileRank(raw.map((r) => r.breadth));
  const pctlMomentum = percentileRank(raw.map((r) => r.momentum));
  const pctlMoneyFlow = percentileRank(raw.map((r) => r.moneyFlow));

  return raw.map((r, i) => {
    const compositeScore = Math.round(
      0.4 * (pctlBreadth[i] ?? 0) + 0.3 * (pctlMomentum[i] ?? 0) + 0.3 * (pctlMoneyFlow[i] ?? 0)
    );
    let label: SectorRotationRow["label"];
    if (compositeScore >= 65) label = "Hot";
    else if (compositeScore >= 45) label = "Warming";
    else if (r.moneyFlow < 0 && r.momentum < 0) label = "Distribution";
    else label = "Cold";

    return { ...r, compositeScore, label };
  });
}
