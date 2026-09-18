'use client';

import { use } from 'react';
import Link from 'next/link';
import { useStockDetail } from '@/hooks/useData';
import TimeRangeToggle from '@/components/filters/TimeRangeToggle';
import ScoreBadge from '@/components/badges/ScoreBadge';
import FlowPriceChart from '@/components/charts/FlowPriceChart';
import ActivityLog from '@/components/tables/ActivityLog';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const upperTicker = ticker.toUpperCase();
  const { data, isLoading, error } = useStockDetail(upperTicker);

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="terminal-panel border-signal-distribution/30 p-8 text-center">
          <span className="text-3xl mb-3 block">⚠️</span>
          <p className="text-signal-distribution font-mono text-base mb-1">Failed to load stock data</p>
          <p className="text-text-tertiary font-mono text-xs mb-4">{error.message}</p>
          <Link href="/" className="text-accent hover:text-accent-hover font-mono text-sm underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {/* Back link + Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-text-tertiary hover:text-text-secondary font-mono text-xs mb-2 inline-flex items-center gap-1 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-mono font-bold text-2xl text-accent">
              {upperTicker}
            </h1>
            {isLoading ? (
              <Skeleton width="100px" height="24px" />
            ) : (
              <>
                <ScoreBadge score={data!.currentSMFI} type="smfi" size="lg" />
                <ScoreBadge score={data!.divergenceDelta} type="divergence" size="lg" />
              </>
            )}
          </div>
          {isLoading ? (
            <Skeleton width="200px" height="14px" className="mt-1" />
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-text-secondary">{data!.companyName}</span>
              <span className="text-text-tertiary">·</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-tertiary text-text-secondary rounded border border-border">
                {data!.sectorName}
              </span>
            </div>
          )}
        </div>
        <TimeRangeToggle />
      </div>

      {/* Flow vs Price Chart */}
      <ErrorBoundary>
        <FlowPriceChart
          priceData={data?.chartData?.priceTimeSeries || []}
          flowData={data?.chartData?.flowTimeSeries || []}
          ticker={upperTicker}
          isLoading={isLoading}
        />
      </ErrorBoundary>

      {/* Activity Log */}
      <ErrorBoundary>
        <ActivityLog
          data={data?.activityLog}
          isLoading={isLoading}
        />
      </ErrorBoundary>
    </div>
  );
}
