"use client";

/**
 * Watchlist — PRD.md bagian 3, "Could". localStorage doang, tanpa akun.
 * Nggak sinkron lintas perangkat — itu batasan yang disengaja, bukan bug.
 * Semua fungsi di sini dibungkus try/catch: localStorage bisa kosong atau
 * error (private window, site data diblokir) — jangan biarkan itu bikin
 * halaman crash.
 */

const KEY = "arus_watchlist";

export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isWatched(ticker: string): boolean {
  return getWatchlist().includes(ticker);
}

export function toggleWatch(ticker: string): string[] {
  try {
    const current = getWatchlist();
    const next = current.includes(ticker) ? current.filter((t) => t !== ticker) : [...current, ticker];
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return getWatchlist();
  }
}
