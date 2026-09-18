'use client';

import Link from 'next/link';
import ScoreBadge from '@/components/badges/ScoreBadge';
import { formatIDR } from '@/lib/formatters';
import type { RankingItem } from '@/types';

interface DivergenceRadarProps {
  data: RankingItem[];
}

export default function DivergenceRadar({ data }: DivergenceRadarProps) {
  // Get top 5 stocks by highest positive divergence delta
  const top5 = [...data]
    .filter((item) => item.divergenceDelta > 0)
    .sort((a, b) => b.divergenceDelta - a.divergenceDelta)
    .slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <div className="terminal-panel overflow-hidden animate-fade-in">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">📡</span>
        <h3 className="font-mono font-bold text-sm text-signal-divergence">
          Divergence Radar
        </h3>
        <span className="text-[10px] font-mono text-text-tertiary ml-auto">
          Silent Accumulation Alerts
        </span>
      </div>

      <div className="divide-y divide-border/30">
        {top5.map((item) => (
          <Link
            key={item.ticker}
            href={`/stock/${item.ticker}`}
            className="flex items-center gap-3 px-4 py-2.5 table-row-hover group"
          >
            <div className="w-1 h-8 rounded-full bg-signal-divergence/60" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-accent group-hover:text-accent-hover transition-colors">
                  {item.ticker}
                </span>
                <ScoreBadge score={item.divergenceDelta} type="divergence" size="sm" />
              </div>
              <div className="text-[10px] font-mono text-text-tertiary mt-0.5 truncate">
                {item.companyName}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-text-secondary">SMFI</div>
              <div className="text-sm font-mono font-bold tabular-nums text-text-primary">{item.smfi}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
