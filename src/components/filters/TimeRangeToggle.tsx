'use client';

import { useTerminalStore } from '@/stores/useTerminalStore';
import { TIME_RANGES } from '@/lib/constants';
import type { TimeRange } from '@/types';

export default function TimeRangeToggle() {
  const timeRange = useTerminalStore((s) => s.timeRange);
  const setTimeRange = useTerminalStore((s) => s.setTimeRange);

  return (
    <div className="inline-flex items-center border border-border rounded overflow-hidden" role="group" aria-label="Time range selector">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range as TimeRange)}
          className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors duration-100
            ${timeRange === range
              ? 'bg-accent text-bg-primary'
              : 'bg-btn-bg text-text-secondary hover:bg-btn-bg-hover hover:text-text-primary'
            }
          `}
          aria-pressed={timeRange === range}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
