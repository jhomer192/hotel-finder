import { useState, useCallback } from 'react';

export type Theme = 'tokyo' | 'miami' | 'matcha' | 'gruvbox';

export const THEMES: { id: Theme; label: string }[] = [
  { id: 'tokyo', label: 'Tokyo Night' },
  { id: 'miami', label: 'Miami' },
  { id: 'matcha', label: 'Matcha' },
  { id: 'gruvbox', label: 'Gruvbox' },
];

const STORAGE_KEY = 'site-theme';

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && THEMES.some((t) => t.id === saved)) return saved as Theme;
  return 'tokyo';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  return { theme, setTheme };
}
