'use client';

import { create } from 'zustand';
import type { TimeRange, Theme } from '@/types';

interface TerminalState {
  theme: Theme;
  timeRange: TimeRange;
  sidebarCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  setTimeRange: (range: TimeRange) => void;
  toggleSidebar: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  theme: 'dark',
  timeRange: '5D',
  sidebarCollapsed: false,

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('arus-theme', theme);
    }
    set({ theme });
  },

  setTimeRange: (timeRange) => set({ timeRange }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// Hydrate theme from localStorage on mount
export function hydrateTheme() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('arus-theme') as Theme | null;
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      useTerminalStore.setState({ theme: saved });
    }
  }
}
