'use client';

import ScoreBadge from '@/components/badges/ScoreBadge';
import { formatVolume, formatIDR, formatDate } from '@/lib/formatters';
import { TableSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { ActivityEntry } from '@/types';

interface ActivityLogProps {
  data: ActivityEntry[] | undefined;
  isLoading: boolean;
}

export default function ActivityLog({ data, isLoading }: ActivityLogProps) {
  if (isLoading) return <TableSkeleton rows={10} cols={5} />;
  if (!data || data.length === 0) return <EmptyState message="No activity data for this period" />;

  return (
    <div className="terminal-panel overflow-hidden animate-fade-in">
      <div className="px-4 py-2.5 border-b border-border">
        <h3 className="font-mono font-bold text-sm text-text-primary flex items-center gap-2">
          <span aria-hidden="true">📋</span>
          Activity Log
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono" role="table">
          <thead>
            <tr className="text-text-tertiary uppercase tracking-wider text-[10px] border-b border-border">
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-right px-3 py-2">Volume</th>
              <th className="text-right px-3 py-2">Net Value (IDR)</th>
              <th className="text-right px-3 py-2">SMFI Contrib.</th>
              <th className="text-center px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr
                key={entry.date}
                className="table-row-hover border-b border-border/30"
              >
                <td className="px-4 py-2.5 text-text-secondary tabular-nums">
                  {formatDate(entry.date)}
                </td>
                <td className="px-3 py-2.5 text-right text-text-primary tabular-nums">
                  {formatVolume(entry.volume)}
                </td>
                <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${entry.netValue >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatIDR(entry.netValue)}
                </td>
                <td className={`px-3 py-2.5 text-right tabular-nums ${entry.smfiContribution >= 0 ? 'text-signal-accumulation' : 'text-signal-distribution'}`}>
                  {entry.smfiContribution > 0 ? '+' : ''}{entry.smfiContribution.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <ScoreBadge
                    score={entry.status === 'accumulation' ? 80 : entry.status === 'distribution' ? 20 : 50}
                    type="smfi"
                    size="sm"
                    showLabel={true}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
