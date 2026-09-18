'use client';

interface EmptyStateProps {
  message?: string;
  icon?: string;
}

export default function EmptyState({ message = 'No data available for this range', icon = '📭' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
      <span className="text-4xl mb-3" aria-hidden="true">{icon}</span>
      <p className="font-mono text-sm">{message}</p>
    </div>
  );
}
