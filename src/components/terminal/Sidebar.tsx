'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTerminalStore } from '@/stores/useTerminalStore';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '📊', shortLabel: '📊' },
  { href: '/sector', label: 'Sector Map', icon: '🗺️', shortLabel: '🗺️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useTerminalStore((s) => s.sidebarCollapsed);
  const toggle = useTerminalStore((s) => s.toggleSidebar);

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-52'} border-r border-border bg-bg-secondary flex flex-col shrink-0 transition-all duration-200`}
    >
      {/* Toggle */}
      <button
        onClick={toggle}
        className="h-8 flex items-center justify-center text-text-tertiary hover:text-text-secondary transition-colors border-b border-border text-xs"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-1.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-mono transition-colors
                ${isActive
                  ? 'bg-accent/15 text-accent border-l-2 border-accent'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border-l-2 border-transparent'
                }
              `}
              title={item.label}
            >
              <span className="text-base flex-shrink-0" aria-hidden="true">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="text-[10px] font-mono text-text-tertiary leading-relaxed">
            <p>ARUS Terminal v0.1</p>
            <p>Sectors Hackathon 2026</p>
          </div>
        </div>
      )}
    </aside>
  );
}
