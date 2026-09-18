'use client';

import SessionClock from './SessionClock';
import ThemeSwitcher from './ThemeSwitcher';

interface TerminalHeaderProps {
  lastUpdated?: string | null;
}

export default function TerminalHeader({ lastUpdated }: TerminalHeaderProps) {
  const isStale = lastUpdated
    ? Date.now() - new Date(lastUpdated).getTime() > 24 * 60 * 60 * 1000
    : false;

  return (
    <header className="h-12 border-b border-border bg-bg-secondary flex items-center justify-between px-4 shrink-0 z-40">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 select-none">
          <span className="font-mono font-bold text-base tracking-tight text-accent">ARUS</span>
          <span className="font-mono font-normal text-xs text-text-tertiary tracking-widest">TERMINAL</span>
        </div>
        <div className="hidden md:block h-5 w-px bg-border" />
        <div className="hidden md:block">
          <SessionClock />
        </div>
      </div>

      {/* Right: Data freshness + Theme */}
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <div
            className={`hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border
              ${isStale
                ? 'text-signal-neutral border-signal-neutral/30 bg-signal-neutral/5 animate-pulse-amber'
                : 'text-text-tertiary border-border bg-bg-tertiary'
              }
            `}
          >
            {isStale && <span aria-hidden="true">⚠</span>}
            <span>Data as of:</span>
            <span className="text-text-secondary">
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta',
              })}
            </span>
          </div>
        )}
        <ThemeSwitcher />
      </div>
    </header>
  );
}
