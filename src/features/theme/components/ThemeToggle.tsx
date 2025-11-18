// src/features/theme/components/ThemeToggle.tsx
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();

  const label = isDark ? 'Dark' : 'Light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Toggle theme (currently ${theme})`}
      className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm hover:border-slate-400 hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      <span
        aria-hidden="true"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[10px]"
      >
        {isDark ? '☾' : '☀'}
      </span>
      <span className="hidden sm:inline">Theme: {label}</span>
      <span className="inline sm:hidden">{label}</span>
    </button>
  );
}
