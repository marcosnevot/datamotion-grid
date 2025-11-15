export function AppHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl border border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center text-xs font-semibold text-emerald-300">
          DG
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">
            DataMotion Grid
          </span>
          <span className="text-xs text-slate-400">
            Phase 2 – Dataset & virtualized grid
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-slate-400">
          Build status: <span className="text-emerald-400">Phase 2</span>
        </span>

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <span>Theme</span>
          <span className="text-[10px] text-slate-400">(stub)</span>
        </button>
      </div>
    </div>
  );
}
