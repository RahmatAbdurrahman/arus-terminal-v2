'use client';

import { useEffect, useState } from 'react';
import { IDX_SESSIONS } from '@/lib/constants';

function getWIBTime(): Date {
  // Convert current UTC to WIB (UTC+7)
  const now = new Date();
  const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  return wib;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getSessionLabel(d: Date): { label: string; active: boolean } {
  const hhmm = d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  for (const session of IDX_SESSIONS) {
    if (hhmm >= session.start && hhmm < session.end) {
      return { label: session.label, active: session.active };
    }
  }
  return { label: 'Market Closed', active: false };
}

export default function SessionClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(getWIBTime());
    const interval = setInterval(() => {
      setTime(getWIBTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="w-48 h-5 animate-shimmer rounded" />;

  const session = getSessionLabel(time);

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span
        className={`w-2 h-2 rounded-full ${session.active ? 'bg-signal-accumulation animate-pulse' : 'bg-text-tertiary'}`}
        aria-label={session.active ? 'Market open' : 'Market closed'}
      />
      <span className="text-text-primary tabular-nums">{formatTime(time)}</span>
      <span className="text-text-tertiary">WIB</span>
      <span className="text-text-secondary">·</span>
      <span className={session.active ? 'text-signal-accumulation' : 'text-text-secondary'}>
        {session.label}
      </span>
    </div>
  );
}
