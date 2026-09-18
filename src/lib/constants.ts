// ============================================================
// ARUS Terminal — Constants
// ============================================================

export const TIME_RANGES = ['1D', '5D', '15D', '30D'] as const;

// IDX-IC Sector Classification
export const IDX_SECTORS = [
  { code: 'A', name: 'Energy' },
  { code: 'B', name: 'Basic Materials' },
  { code: 'C', name: 'Industrials' },
  { code: 'D', name: 'Consumer Non-Cyclicals' },
  { code: 'E', name: 'Consumer Cyclicals' },
  { code: 'F', name: 'Healthcare' },
  { code: 'G', name: 'Financials' },
  { code: 'H', name: 'Property & Real Estate' },
  { code: 'I', name: 'Technology' },
  { code: 'J', name: 'Infrastructures' },
  { code: 'K', name: 'Transportation & Logistics' },
] as const;

// IDX Trading Sessions (WIB / UTC+7)
export const IDX_SESSIONS = [
  { start: '08:45', end: '09:00', label: 'Pre-Open', active: false },
  { start: '09:00', end: '11:30', label: 'Session 1', active: true },
  { start: '11:30', end: '13:30', label: 'Lunch Break', active: false },
  { start: '13:30', end: '14:50', label: 'Session 2', active: true },
  { start: '14:50', end: '15:00', label: 'Pre-Close', active: false },
  { start: '15:00', end: '15:15', label: 'Post-Close', active: false },
] as const;

// SMFI thresholds
export const SMFI_ACCUMULATION_THRESHOLD = 70;
export const SMFI_DISTRIBUTION_THRESHOLD = 30;

// Divergence Delta thresholds
export const DIVERGENCE_HIGH_THRESHOLD = 1.5;
export const DIVERGENCE_LOW_THRESHOLD = -1.5;
