// src/components/layout/AppHeader.tsx
import { ThemeToggle } from '../../features/theme/components/ThemeToggle';

export function AppHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/60 bg-emerald-500/10 text-xs font-semibold text-emerald-300">
          DG
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">
            DataMotion Grid
          </span>
          <span className="text-xs text-slate-400">
            Phase 6 – testing, performance and cleanup
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-slate-400 sm:inline">
          Build status:{' '}
          <span className="text-emerald-400">Phase 6 (stable)</span>
        </span>

        <ThemeToggle />
      </div>
    </div>
  );
}
