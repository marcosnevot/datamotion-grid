// src/features/theme/store/themeStore.ts
import { create } from 'zustand';

export type ThemeName = 'light' | 'dark';

interface ThemeStoreState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'datamotion-grid:theme';

function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

function applyThemeToDocument(theme: ThemeName) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const initialTheme = getInitialTheme();
applyThemeToDocument(initialTheme);

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    set({ theme });
    applyThemeToDocument(theme);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // ignore storage errors in production
      }
    }
  },

  toggleTheme: () => {
    const current = get().theme;
    const next: ThemeName = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
