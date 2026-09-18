'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScoreBadge from '@/components/badges/ScoreBadge';
import { formatIDR } from '@/lib/formatters';
import { TableSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { RankingItem } from '@/types';

type SortField = 'smfi' | 'divergenceDelta' | 'ticker' | 'netValue';
type SortDir = 'asc' | 'desc';
type FilterCategory = 'all' | 'accumulation' | 'distribution' | 'neutral';

interface RankingTableProps {
  data: RankingItem[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export default function RankingTable({ data, isLoading, error }: RankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('smfi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter, setFilter] = useState<FilterCategory>('all');

  if (isLoading) return <TableSkeleton rows={12} cols={7} />;
  if (error) {
    return (
      <div className="terminal-panel border-signal-distribution/30 p-6 text-center">
        <span className="text-2xl mb-2 block">⚠️</span>
        <p className="text-signal-distribution font-mono text-sm">Failed to load ranking data</p>
        <p className="text-text-tertiary font-mono text-xs mt-1">{error.message}</p>
      </div>
    );
  }
  if (!data || data.length === 0) return <EmptyState />;

  // Filter
  const filtered = data.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'accumulation') return item.smfi > 70;
    if (filter === 'distribution') return item.smfi < 30;
    return item.smfi >= 30 && item.smfi <= 70;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-text-tertiary ml-0.5">⇅</span>;
    return <span className="text-accent ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  const filters: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'accumulation', label: '🟢 Accum.' },
    { value: 'distribution', label: '🔴 Distrib.' },
    { value: 'neutral', label: '🟡 Neutral' },
  ];

  return (
    <div className="terminal-panel overflow-hidden animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="font-mono font-bold text-sm text-text-primary flex items-center gap-2">
          <span aria-hidden="true">🐋</span>
          Foreign Whale Tracker
        </h2>
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors
                ${filter === f.value
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono" role="table">
          <thead>
            <tr className="text-text-tertiary uppercase tracking-wider text-[10px] border-b border-border">
              <th className="text-left px-4 py-2 w-12">#</th>
              <th className="text-left px-3 py-2 cursor-pointer select-none hover:text-text-secondary" onClick={() => handleSort('ticker')}>
                Ticker <SortIcon field="ticker" />
              </th>
              <th className="text-center px-3 py-2 cursor-pointer select-none hover:text-text-secondary" onClick={() => handleSort('smfi')}>
                SMFI <SortIcon field="smfi" />
              </th>
              <th className="text-center px-3 py-2 w-12">Trend</th>
              <th className="text-center px-3 py-2 cursor-pointer select-none hover:text-text-secondary" onClick={() => handleSort('divergenceDelta')}>
                Divergence Δ <SortIcon field="divergenceDelta" />
              </th>
              <th className="text-right px-3 py-2 cursor-pointer select-none hover:text-text-secondary" onClick={() => handleSort('netValue')}>
                Net Value <SortIcon field="netValue" />
              </th>
              <th className="text-center px-4 py-2 hidden lg:table-cell">Sector</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, idx) => (
              <tr
                key={item.ticker}
                className="table-row-hover border-b border-border/30 group"
                tabIndex={0}
                role="row"
              >
                <td className="px-4 py-2.5 text-text-tertiary tabular-nums">{idx + 1}</td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/stock/${item.ticker}`}
                    className="text-accent hover:text-accent-hover font-bold transition-colors"
                  >
                    {item.ticker}
                  </Link>
                  <div className="text-[10px] text-text-tertiary mt-0.5 truncate max-w-[140px] hidden md:block">
                    {item.companyName}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <ScoreBadge score={item.smfi} type="smfi" size="sm" />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className={`text-base ${
                      item.smfiTrend === 'up'
                        ? 'text-signal-accumulation'
                        : item.smfiTrend === 'down'
                        ? 'text-signal-distribution'
                        : 'text-text-tertiary'
                    }`}
                    aria-label={`Trending ${item.smfiTrend}`}
                  >
                    {item.smfiTrend === 'up' ? '↑' : item.smfiTrend === 'down' ? '↓' : '→'}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <ScoreBadge score={item.divergenceDelta} type="divergence" size="sm" showLabel={false} />
                </td>
                <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${item.netValue >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatIDR(item.netValue)}
                </td>
                <td className="px-4 py-2.5 text-center hidden lg:table-cell">
                  <span className="px-1.5 py-0.5 text-[10px] bg-bg-tertiary text-text-secondary rounded border border-border">
                    {item.sector}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border text-[10px] font-mono text-text-tertiary">
        Showing {sorted.length} of {data.length} stocks
      </div>
    </div>
  );
}
