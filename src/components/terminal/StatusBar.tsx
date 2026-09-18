export default function StatusBar() {
  return (
    <footer className="h-7 border-t border-border bg-bg-secondary flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2 text-[10px] font-mono text-text-tertiary">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-accumulation" aria-hidden="true" />
        <span>Powered by <span className="text-text-secondary">Sectors API</span></span>
      </div>
      <div className="text-[10px] font-mono text-text-tertiary">
        Data refreshed daily after market close (15:15 WIB)
      </div>
    </footer>
  );
}
