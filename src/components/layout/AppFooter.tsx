export function AppFooter() {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500">
      <span>DataMotion Grid · Internal prototype</span>

      <div className="flex items-center gap-4">
        <span>Phase 2 – Dataset & virtualized grid</span>
        <span className="hidden sm:inline">FPS / perf panel coming in later phases</span>
      </div>
    </div>
  );
}
