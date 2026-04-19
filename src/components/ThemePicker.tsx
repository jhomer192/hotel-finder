import { THEMES, type Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const THEME_COLORS: Record<Theme, string> = {
  tokyo: '#73daca',
  miami: '#ff2d95',
  matcha: '#8db660',
  gruvbox: '#fb4934',
};

export function ThemePicker({ theme, setTheme }: Props) {
  return (
    <div className="flex items-center gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: THEME_COLORS[t.id],
            borderColor: theme === t.id ? 'var(--text-primary)' : 'transparent',
            transform: theme === t.id ? 'scale(1.15)' : undefined,
          }}
        />
      ))}
    </div>
  );
}
