'use client';

import { SMFICategory } from '@/types';
import {
  SMFI_ACCUMULATION_THRESHOLD,
  SMFI_DISTRIBUTION_THRESHOLD,
  DIVERGENCE_HIGH_THRESHOLD,
  DIVERGENCE_LOW_THRESHOLD,
} from '@/lib/constants';

interface ScoreBadgeProps {
  score: number;
  type: 'smfi' | 'divergence';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getSMFICategory(score: number): { label: string; category: SMFICategory } {
  if (score > SMFI_ACCUMULATION_THRESHOLD) return { label: 'Heavy Accum.', category: 'accumulation' };
  if (score < SMFI_DISTRIBUTION_THRESHOLD) return { label: 'Heavy Distrib.', category: 'distribution' };
  return { label: 'Neutral', category: 'neutral' };
}

function getDivergenceCategory(score: number): { label: string; category: string } {
  if (score > DIVERGENCE_HIGH_THRESHOLD) return { label: 'Silent Accum.', category: 'divergence' };
  if (score < DIVERGENCE_LOW_THRESHOLD) return { label: 'Silent Distrib.', category: 'distribution' };
  return { label: 'Normal', category: 'neutral' };
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function ScoreBadge({ score, type, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const info = type === 'smfi' ? getSMFICategory(score) : getDivergenceCategory(score);

  const colorMap: Record<string, string> = {
    accumulation: 'bg-[var(--signal-accumulation-bg)] text-signal-accumulation border-signal-accumulation/30',
    distribution: 'bg-[var(--signal-distribution-bg)] text-signal-distribution border-signal-distribution/30',
    neutral: 'bg-[var(--signal-neutral-bg)] text-signal-neutral border-signal-neutral/30',
    divergence: 'bg-[var(--signal-divergence-bg)] text-signal-divergence border-signal-divergence/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium border rounded ${sizeClasses[size]} ${colorMap[info.category] || colorMap.neutral}`}
    >
      {type === 'divergence' && info.category === 'divergence' && (
        <span className="text-[10px]" aria-hidden="true">📡</span>
      )}
      <span className="font-bold tabular-nums">
        {type === 'smfi' ? score : (score > 0 ? '+' : '') + score.toFixed(2)}
      </span>
      {showLabel && (
        <span className="opacity-80 hidden sm:inline">{info.label}</span>
      )}
    </span>
  );
}
