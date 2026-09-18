'use client';

import ScoreBadge from '@/components/badges/ScoreBadge';
import { formatIDR } from '@/lib/formatters';
import type { MarketSummaryData } from '@/types';

interface MarketSummaryProps {
  data: MarketSummaryData;
}

export default function MarketSummary({ data }: MarketSummaryProps) {
  const stats = [
    {
      label: 'Heavy Accumulation',
      value: data.totalAccumulation,
      color: 'text-signal-accumulation',
      icon: '🟢',
    },
    {
      label: 'Heavy Distribution',
      value: data.totalDistribution,
      color: 'text-signal-distribution',
      icon: '🔴',
    },
    {
      label: 'Neutral',
      value: data.totalNeutral,
      color: 'text-signal-neutral',
      icon: '🟡',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="terminal-panel p-3 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
            <span aria-hidden="true">{stat.icon}</span>
            {stat.label}
          </div>
          <div className={`text-2xl font-mono font-bold tabular-nums ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-[10px] font-mono text-text-tertiary">stocks</div>
        </div>
      ))}

      {/* Average SMFI */}
      <div className="terminal-panel p-3 flex flex-col gap-1">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          Avg. SMFI
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold tabular-nums text-text-primary">
            {data.averageSMFI}
          </span>
          <ScoreBadge score={data.averageSMFI} type="smfi" size="sm" showLabel={false} />
        </div>
        <div className="text-[10px] font-mono text-text-tertiary">market-wide</div>
      </div>

      {/* Top Mover */}
      <div className="terminal-panel p-3 flex flex-col gap-1">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          Top Mover
        </div>
        <div className="text-lg font-mono font-bold text-accent tabular-nums">
          {data.topMover.ticker}
        </div>
        <div className={`text-xs font-mono font-medium tabular-nums ${data.topMover.smfiChange > 0 ? 'text-signal-accumulation' : 'text-signal-distribution'}`}>
          {data.topMover.smfiChange > 0 ? '↑' : '↓'} {Math.abs(data.topMover.smfiChange).toFixed(1)} SMFI
        </div>
      </div>
    </div>
  );
}
