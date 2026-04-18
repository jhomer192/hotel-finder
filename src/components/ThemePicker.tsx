import { THEMES, type Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const THEME_COLORS: Record<Theme, string> = {
  'tokyo-night': '#7aa2f7',
  miami: '#ff6bcb',
  matcha: '#8fb573',
  gruvbox: '#fabd2f',
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
