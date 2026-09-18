// ============================================================
// Mock Data Generator — Ranking / Stock / Sector
// Generates realistic IDX capital flow data for demo purposes
// ============================================================

import type {
  RankingItem,
  MarketSummaryData,
  ActivityEntry,
  PricePoint,
  FlowPoint,
  SectorFlowItem,
} from '@/types';
import { IDX_SECTORS } from '@/lib/constants';

const MOCK_STOCKS: { ticker: string; name: string; sector: string; sectorName: string; basePrice: number }[] = [
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'G', sectorName: 'Financials', basePrice: 9850 },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'G', sectorName: 'Financials', basePrice: 5025 },
  { ticker: 'BMRI', name: 'Bank Mandiri Tbk', sector: 'G', sectorName: 'Financials', basePrice: 6400 },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'J', sectorName: 'Infrastructures', basePrice: 3680 },
  { ticker: 'ASII', name: 'Astra International Tbk', sector: 'C', sectorName: 'Industrials', basePrice: 4950 },
  { ticker: 'UNVR', name: 'Unilever Indonesia Tbk', sector: 'D', sectorName: 'Consumer Non-Cyclicals', basePrice: 3200 },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', sector: 'I', sectorName: 'Technology', basePrice: 72 },
  { ticker: 'BRIS', name: 'Bank Syariah Indonesia Tbk', sector: 'G', sectorName: 'Financials', basePrice: 2750 },
  { ticker: 'EMTK', name: 'Elang Mahkota Teknologi Tbk', sector: 'I', sectorName: 'Technology', basePrice: 480 },
  { ticker: 'ACES', name: 'Ace Hardware Indonesia Tbk', sector: 'E', sectorName: 'Consumer Cyclicals', basePrice: 790 },
  { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', sector: 'A', sectorName: 'Energy', basePrice: 2680 },
  { ticker: 'ANTM', name: 'Aneka Tambang Tbk', sector: 'B', sectorName: 'Basic Materials', basePrice: 1800 },
  { ticker: 'INCO', name: 'Vale Indonesia Tbk', sector: 'B', sectorName: 'Basic Materials', basePrice: 4120 },
  { ticker: 'KLBF', name: 'Kalbe Farma Tbk', sector: 'F', sectorName: 'Healthcare', basePrice: 1590 },
  { ticker: 'CPIN', name: 'Charoen Pokphand Indonesia Tbk', sector: 'D', sectorName: 'Consumer Non-Cyclicals', basePrice: 5200 },
  { ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', sector: 'D', sectorName: 'Consumer Non-Cyclicals', basePrice: 11250 },
  { ticker: 'INDF', name: 'Indofood Sukses Makmur Tbk', sector: 'D', sectorName: 'Consumer Non-Cyclicals', basePrice: 6700 },
  { ticker: 'SMGR', name: 'Semen Indonesia Tbk', sector: 'B', sectorName: 'Basic Materials', basePrice: 4350 },
  { ticker: 'EXCL', name: 'XL Axiata Tbk', sector: 'J', sectorName: 'Infrastructures', basePrice: 2400 },
  { ticker: 'BSDE', name: 'Bumi Serpong Damai Tbk', sector: 'H', sectorName: 'Property & Real Estate', basePrice: 1070 },
  { ticker: 'MDKA', name: 'Merdeka Copper Gold Tbk', sector: 'B', sectorName: 'Basic Materials', basePrice: 2350 },
  { ticker: 'PGAS', name: 'Perusahaan Gas Negara Tbk', sector: 'A', sectorName: 'Energy', basePrice: 1580 },
  { ticker: 'JSMR', name: 'Jasa Marga Tbk', sector: 'K', sectorName: 'Transportation & Logistics', basePrice: 4500 },
  { ticker: 'TBIG', name: 'Tower Bersama Infrastructure Tbk', sector: 'J', sectorName: 'Infrastructures', basePrice: 1850 },
  { ticker: 'MAPI', name: 'Mitra Adiperkasa Tbk', sector: 'E', sectorName: 'Consumer Cyclicals', basePrice: 1680 },
];

// Seeded pseudo-random for consistent data per ticker
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function generateRankingData(range: string): {
  rankings: RankingItem[];
  summary: MarketSummaryData;
} {
  const rangeMultiplier = range === '1D' ? 0.3 : range === '5D' ? 0.6 : range === '15D' ? 1.0 : 1.4;
  
  const rankings: RankingItem[] = MOCK_STOCKS.map((stock, i) => {
    const rng = seededRandom(hashString(stock.ticker + range));
    const smfi = Math.round(rng() * 100);
    const divergence = parseFloat(((rng() * 6 - 3) * rangeMultiplier).toFixed(2));
    const netVal = (rng() * 200 - 100) * 1_000_000_000 * rangeMultiplier;
    const smfiChange = parseFloat(((rng() * 20 - 10) * rangeMultiplier).toFixed(1));

    return {
      rank: i + 1,
      ticker: stock.ticker,
      companyName: stock.name,
      smfi,
      smfiTrend: smfiChange > 2 ? 'up' as const : smfiChange < -2 ? 'down' as const : 'flat' as const,
      smfiChange,
      divergenceDelta: divergence,
      netValue: Math.round(netVal),
      sector: stock.sector,
      sectorName: stock.sectorName,
    };
  });

  // Sort by SMFI descending
  rankings.sort((a, b) => b.smfi - a.smfi);
  rankings.forEach((r, i) => (r.rank = i + 1));

  const accum = rankings.filter((r) => r.smfi > 70).length;
  const distrib = rankings.filter((r) => r.smfi < 30).length;
  const avgSMFI = Math.round(rankings.reduce((s, r) => s + r.smfi, 0) / rankings.length);
  const topMover = rankings.reduce((best, r) =>
    Math.abs(r.smfiChange) > Math.abs(best.smfiChange) ? r : best
  );

  return {
    rankings,
    summary: {
      totalAccumulation: accum,
      totalDistribution: distrib,
      totalNeutral: rankings.length - accum - distrib,
      averageSMFI: avgSMFI,
      topMover: { ticker: topMover.ticker, smfiChange: topMover.smfiChange },
    },
  };
}

export function generateStockDetail(ticker: string, range: string): {
  priceTimeSeries: PricePoint[];
  flowTimeSeries: FlowPoint[];
  activityLog: ActivityEntry[];
  currentSMFI: number;
  smfiTrend: 'up' | 'down' | 'flat';
  divergenceDelta: number;
  companyName: string;
  sector: string;
  sectorName: string;
} {
  const stock = MOCK_STOCKS.find((s) => s.ticker === ticker) || MOCK_STOCKS[0];
  const days = range === '1D' ? 1 : range === '5D' ? 5 : range === '15D' ? 15 : 30;
  const rng = seededRandom(hashString(ticker + range));

  const priceTimeSeries: PricePoint[] = [];
  const flowTimeSeries: FlowPoint[] = [];
  const activityLog: ActivityEntry[] = [];

  let cumulativeFlow = 0;
  let price = stock.basePrice;

  for (let i = days; i >= 0; i--) {
    const d = new Date(2026, 8, 17 - i); // September 2026
    const dateStr = d.toISOString().slice(0, 10);

    // Price with slight random walk
    price = price * (1 + (rng() - 0.48) * 0.03);
    priceTimeSeries.push({ time: dateStr, value: Math.round(price) });

    // Daily net flow
    const dailyNet = (rng() - 0.45) * 50_000_000_000;
    cumulativeFlow += dailyNet;
    flowTimeSeries.push({
      time: dateStr,
      value: Math.round(cumulativeFlow),
      color: cumulativeFlow >= 0 ? '#22c55e80' : '#ef444480',
    });

    // Activity entry
    const vol = Math.round(rng() * 100_000_000 + 5_000_000);
    const smfiContrib = parseFloat(((rng() * 10 - 3)).toFixed(1));
    activityLog.push({
      date: dateStr,
      volume: vol,
      netValue: Math.round(dailyNet),
      smfiContribution: smfiContrib,
      status: dailyNet > 10_000_000_000 ? 'accumulation' : dailyNet < -10_000_000_000 ? 'distribution' : 'neutral',
    });
  }

  const currentSMFI = Math.round(rng() * 100);
  const smfiChange = rng() * 20 - 10;

  return {
    priceTimeSeries,
    flowTimeSeries,
    activityLog: activityLog.reverse(),
    currentSMFI,
    smfiTrend: smfiChange > 2 ? 'up' : smfiChange < -2 ? 'down' : 'flat',
    divergenceDelta: parseFloat(((rng() * 6 - 3)).toFixed(2)),
    companyName: stock.name,
    sector: stock.sector,
    sectorName: stock.sectorName,
  };
}

export function generateSectorData(range: string): SectorFlowItem[] {
  const rangeMultiplier = range === '1D' ? 0.3 : range === '5D' ? 0.6 : range === '15D' ? 1.0 : 1.4;

  return IDX_SECTORS.map((sec: { code: string; name: string }) => {
    const rng = seededRandom(hashString(sec.code + range));
    const netFlow = (rng() - 0.45) * 500_000_000_000 * rangeMultiplier;
    const flowChange = (rng() - 0.5) * 20;
    const intensity = Math.max(-1, Math.min(1, netFlow / (250_000_000_000 * rangeMultiplier)));

    const topTickers: Record<string, string> = {
      A: 'ADRO', B: 'ANTM', C: 'ASII', D: 'ICBP', E: 'ACES',
      F: 'KLBF', G: 'BBCA', H: 'BSDE', I: 'GOTO', J: 'TLKM', K: 'JSMR',
    };

    return {
      sectorCode: sec.code,
      sectorName: sec.name,
      netFlow: Math.round(netFlow),
      flowChange: parseFloat(flowChange.toFixed(2)),
      flowIntensity: parseFloat(intensity.toFixed(3)),
      topContributor: {
        ticker: topTickers[sec.code] || 'BBCA',
        netValue: Math.round(netFlow * 0.4),
      },
      stockCount: Math.round(rng() * 30 + 10),
    };
  });
}
