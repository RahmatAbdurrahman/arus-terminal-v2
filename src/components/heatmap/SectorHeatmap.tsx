'use client';

import { useState } from 'react';
import { formatIDR, formatPercent } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { SectorFlowItem } from '@/types';

interface SectorHeatmapProps {
  data: SectorFlowItem[] | undefined;
  isLoading: boolean;
  error?: Error;
}

function getHeatColor(intensity: number): string {
  // Map intensity (-1 to +1) to a color between red and green
  if (intensity > 0.5) return 'rgba(34, 197, 94, 0.5)';
  if (intensity > 0.25) return 'rgba(34, 197, 94, 0.3)';
  if (intensity > 0.05) return 'rgba(34, 197, 94, 0.15)';
  if (intensity >= -0.05) return 'rgba(128, 128, 128, 0.1)';
  if (intensity >= -0.25) return 'rgba(239, 68, 68, 0.15)';
  if (intensity >= -0.5) return 'rgba(239, 68, 68, 0.3)';
  return 'rgba(239, 68, 68, 0.5)';
}

function getTextColor(intensity: number): string {
  if (intensity > 0.05) return 'var(--signal-accumulation)';
  if (intensity < -0.05) return 'var(--signal-distribution)';
  return 'var(--text-secondary)';
}

export default function SectorHeatmap({ data, isLoading, error }: SectorHeatmapProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 11 }).map((_, i) => (
          <Skeleton key={i} height="120px" className="rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-panel border-signal-distribution/30 p-6 text-center">
        <span className="text-2xl mb-2 block">⚠️</span>
        <p className="text-signal-distribution font-mono text-sm">Failed to load sector data</p>
      </div>
    );
  }

  if (!data || data.length === 0) return <EmptyState message="No sector data available" icon="🗺️" />;

  return (
    <div className="animate-fade-in">
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 text-[10px] font-mono text-text-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.5)' }} />
          Strong Outflow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(128, 128, 128, 0.1)', border: '1px solid var(--border)' }} />
          Neutral
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(34, 197, 94, 0.5)' }} />
          Strong Inflow
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((sector) => {
          const isHovered = hoveredSector === sector.sectorCode;
          return (
            <div
              key={sector.sectorCode}
              className={`terminal-panel p-4 cursor-default transition-all duration-150
                ${isHovered ? 'transform -translate-y-0.5 shadow-lg' : ''}
              `}
              style={{
                background: getHeatColor(sector.flowIntensity),
                borderColor: isHovered ? 'var(--border-light)' : undefined,
              }}
              onMouseEnter={() => setHoveredSector(sector.sectorCode)}
              onMouseLeave={() => setHoveredSector(null)}
            >
              {/* Sector code + name */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-bg-secondary/60 text-text-secondary">
                  {sector.sectorCode}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {sector.stockCount} stocks
                </span>
              </div>

              <div className="font-mono font-medium text-xs text-text-primary mb-2 leading-tight">
                {sector.sectorName}
              </div>

              {/* Flow value */}
              <div
                className="font-mono font-bold text-lg tabular-nums"
                style={{ color: getTextColor(sector.flowIntensity) }}
              >
                {formatIDR(sector.netFlow)}
              </div>

              {/* Change percentage */}
              <div className={`text-[10px] font-mono tabular-nums mt-1 ${sector.flowChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatPercent(sector.flowChange)}
              </div>

              {/* Top contributor (shown on hover) */}
              {isHovered && (
                <div className="mt-2 pt-2 border-t border-border/30 text-[10px] font-mono text-text-tertiary animate-fade-in">
                  Top: <span className="text-accent">{sector.topContributor.ticker}</span>
                  {' '}({formatIDR(sector.topContributor.netValue)})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
