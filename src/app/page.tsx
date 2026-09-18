'use client';

import { useRanking } from '@/hooks/useData';
import TimeRangeToggle from '@/components/filters/TimeRangeToggle';
import MarketSummary from '@/components/dashboard/MarketSummary';
import RankingTable from '@/components/tables/RankingTable';
import DivergenceRadar from '@/components/dashboard/DivergenceRadar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function DashboardPage() {
  const { data, isLoading, error } = useRanking();

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-mono font-bold text-lg text-text-primary">
            Foreign Whale Tracker
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            IDX stocks ranked by Smart Money Flow Index (SMFI)
          </p>
        </div>
        <TimeRangeToggle />
      </div>

      {/* Market Summary */}
      <ErrorBoundary>
        {data?.summary && <MarketSummary data={data.summary} />}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="terminal-panel p-3 h-24 animate-shimmer rounded" />
            ))}
          </div>
        )}
      </ErrorBoundary>

      {/* Main Content: Table + Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <ErrorBoundary>
          <RankingTable
            data={data?.rankings}
            isLoading={isLoading}
            error={error}
          />
        </ErrorBoundary>

        <div className="space-y-4">
          <ErrorBoundary>
            {data?.rankings && <DivergenceRadar data={data.rankings} />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
