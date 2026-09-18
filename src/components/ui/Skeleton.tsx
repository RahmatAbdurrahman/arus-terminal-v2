'use client';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({ width = '100%', height = '16px', rounded = false, className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height, minHeight: height }}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex gap-3 px-4 py-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="12px" width={i === 0 ? '40px' : i === 1 ? '60px' : '80px'} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-3 px-4 py-3 border-t border-border/50">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton key={col} height="14px" width={col === 0 ? '40px' : col === 1 ? '60px' : '80px'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="terminal-panel p-4">
      <div className="flex justify-between mb-4">
        <Skeleton width="200px" height="20px" />
        <Skeleton width="80px" height="20px" />
      </div>
      <Skeleton width="100%" height="300px" className="rounded" />
    </div>
  );
}
