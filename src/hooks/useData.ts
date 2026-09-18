'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useTerminalStore } from '@/stores/useTerminalStore';
import type { RankingResponse, StockDetailResponse, SectorHeatmapResponse } from '@/types';

export function useRanking() {
  const timeRange = useTerminalStore((s) => s.timeRange);
  return useSWR<RankingResponse>(
    `/api/ranking?range=${timeRange}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );
}

export function useStockDetail(ticker: string) {
  const timeRange = useTerminalStore((s) => s.timeRange);
  return useSWR<StockDetailResponse>(
    ticker ? `/api/stock/${ticker}?range=${timeRange}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );
}

export function useSectorData() {
  const timeRange = useTerminalStore((s) => s.timeRange);
  return useSWR<SectorHeatmapResponse>(
    `/api/sector?range=${timeRange}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );
}
