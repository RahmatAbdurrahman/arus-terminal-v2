'use client';

import { useSectorData } from '@/hooks/useData';
import TimeRangeToggle from '@/components/filters/TimeRangeToggle';
import SectorHeatmap from '@/components/heatmap/SectorHeatmap';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function SectorPage() {
  const { data, isLoading, error } = useSectorData();

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-mono font-bold text-lg text-text-primary flex items-center gap-2">
            <span aria-hidden="true">🗺️</span>
            Sector Rotation Heatmap
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Capital flow distribution across IDX-IC industry sectors
          </p>
        </div>
        <TimeRangeToggle />
      </div>

      {/* Heatmap */}
      <ErrorBoundary>
        <SectorHeatmap
          data={data?.sectors}
          isLoading={isLoading}
          error={error}
        />
      </ErrorBoundary>
    </div>
  );
}
