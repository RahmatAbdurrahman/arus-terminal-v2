'use client';

import { useEffect, ReactNode } from 'react';
import TerminalHeader from './TerminalHeader';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import { hydrateTheme } from '@/stores/useTerminalStore';

interface TerminalShellProps {
  children: ReactNode;
}

export default function TerminalShell({ children }: TerminalShellProps) {
  useEffect(() => {
    hydrateTheme();
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TerminalHeader lastUpdated={new Date().toISOString()} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-5">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
