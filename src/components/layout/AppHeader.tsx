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
            Virtualized React data grid focused on performance and UX
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-slate-400 sm:inline">
          Status:{' '}
          <span className="text-emerald-400">
            Stable demo · 5k–50k rows
          </span>
        </span>

        <ThemeToggle />
      </div>
    </div>
  );
}
