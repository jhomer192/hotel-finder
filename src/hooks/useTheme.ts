import { useState, useCallback } from 'react';

export type Theme = 'tokyo-night' | 'miami' | 'matcha' | 'gruvbox';

export const THEMES: { id: Theme; label: string }[] = [
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'miami', label: 'Miami' },
  { id: 'matcha', label: 'Matcha' },
  { id: 'gruvbox', label: 'Gruvbox' },
];

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('hotel-finder-theme');
  if (saved && THEMES.some((t) => t.id === saved)) return saved as Theme;
  return 'tokyo-night';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('hotel-finder-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  return { theme, setTheme };
}
