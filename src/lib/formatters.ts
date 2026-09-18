// ============================================================
// ARUS Terminal — Number & Date Formatting Utilities
// ============================================================

/**
 * Format a number as compact IDR (e.g. 12500000000 → "12.5B")
 */
export function formatIDR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '+';

  if (abs >= 1_000_000_000_000) {
    return `${sign}${(abs / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${abs.toFixed(0)}`;
}

/**
 * Format volume with thousand separators
 */
export function formatVolume(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a number as percentage with sign
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format ISO timestamp to human readable
 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Format price in IDR with thousand separators
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
