'use client';

import { useState, useRef, useEffect } from 'react';
import { useTerminalStore } from '@/stores/useTerminalStore';
import type { Theme } from '@/types';

const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark Mode', icon: '🌙' },
  { value: 'retro-amber', label: 'Retro Amber', icon: '🟠' },
  { value: 'win98', label: 'Win98 Classic', icon: '🪟' },
];

export default function ThemeSwitcher() {
  const theme = useTerminalStore((s) => s.theme);
  const setTheme = useTerminalStore((s) => s.setTheme);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = THEMES.find((t) => t.value === theme) || THEMES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono bg-btn-bg border border-btn-border rounded hover:bg-btn-bg-hover text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Switch theme"
        aria-expanded={isOpen}
      >
        <span aria-hidden="true">{current.icon}</span>
        <span className="hidden md:inline">{current.label}</span>
        <span className="text-text-tertiary ml-1">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 terminal-panel border border-border-light rounded shadow-lg z-50 animate-fade-in overflow-hidden">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTheme(t.value); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left transition-colors
                ${theme === t.value
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }
              `}
            >
              <span aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
              {theme === t.value && <span className="ml-auto text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
