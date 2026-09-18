// ============================================================
// ARUS Terminal — TypeScript Type Definitions
// ============================================================

// --- Time Range ---
export type TimeRange = '1D' | '5D' | '15D' | '30D';

// --- Theme ---
export type Theme = 'dark' | 'retro-amber' | 'win98';

// --- SMFI Categories ---
export type SMFICategory = 'accumulation' | 'distribution' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'flat';

// --- Ranking (Foreign Whale Tracker) ---
export interface MarketSummaryData {
  totalAccumulation: number;
  totalDistribution: number;
  totalNeutral: number;
  averageSMFI: number;
  topMover: {
    ticker: string;
    smfiChange: number;
  };
}

export interface RankingItem {
  rank: number;
  ticker: string;
  companyName: string;
  smfi: number;
  smfiTrend: TrendDirection;
  smfiChange: number;
  divergenceDelta: number;
  netValue: number;
  sector: string;
  sectorName: string;
}

export interface RankingResponse {
  lastUpdated: string;
  timeRange: TimeRange;
  summary: MarketSummaryData;
  rankings: RankingItem[];
}

// --- Stock Detail ---
export interface PricePoint {
  time: string; // "YYYY-MM-DD"
  value: number;
}

export interface FlowPoint {
  time: string;
  value: number;
  color: string;
}

export interface ActivityEntry {
  date: string;
  volume: number;
  netValue: number;
  smfiContribution: number;
  status: SMFICategory;
}

export interface StockDetailResponse {
  lastUpdated: string;
  ticker: string;
  companyName: string;
  sector: string;
  sectorName: string;
  currentSMFI: number;
  smfiTrend: TrendDirection;
  divergenceDelta: number;
  chartData: {
    priceTimeSeries: PricePoint[];
    flowTimeSeries: FlowPoint[];
  };
  activityLog: ActivityEntry[];
}

// --- Sector Heatmap ---
export interface SectorFlowItem {
  sectorCode: string;
  sectorName: string;
  netFlow: number;
  flowChange: number;
  flowIntensity: number; // -1 to +1
  topContributor: {
    ticker: string;
    netValue: number;
  };
  stockCount: number;
}

export interface SectorHeatmapResponse {
  lastUpdated: string;
  timeRange: TimeRange;
  sectors: SectorFlowItem[];
}
