// src/features/theme/hooks/useTheme.ts
import { useCallback } from 'react';
import { useThemeStore, type ThemeName } from '../store/themeStore';

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const setThemeStore = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const setTheme = useCallback(
    (next: ThemeName) => {
      setThemeStore(next);
    },
    [setThemeStore],
  );

  const setLight = useCallback(() => setTheme('light'), [setTheme]);
  const setDark = useCallback(() => setTheme('dark'), [setTheme]);

  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    setTheme,
    setLight,
    setDark,
    toggleTheme,
  };
}
