interface Props {
  starFilters: Set<number>;
  onToggleStar: (star: number) => void;
  nameQuery: string;
  onNameQueryChange: (q: string) => void;
}

function starColor(star: number): string {
  switch (star) {
    case 5: return '#fbbf24';
    case 4: return '#60a5fa';
    case 3: return '#34d399';
    default: return '#9ca3af';
  }
}

export function Filters({ starFilters, onToggleStar, nameQuery, onNameQueryChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Star filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Stars:</span>
        {[5, 4, 3, 2, 1, 0].map((star) => {
          const active = starFilters.has(star);
          const label = star === 0 ? 'N/A' : '★'.repeat(star);
          return (
            <button
              key={star}
              onClick={() => onToggleStar(star)}
              className="px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all"
              style={{
                background: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? starColor(star) : 'var(--text-muted)',
                border: `1px solid ${active ? starColor(star) : 'var(--border)'}`,
                opacity: active ? 1 : 0.5,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Name search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
          placeholder="Filter by name..."
          className="w-full px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            '--tw-ring-color': 'var(--accent)',
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
