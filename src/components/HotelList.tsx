import type { OsmHotel } from '../types/hotel';

type SortKey = 'name' | 'stars' | 'distance';

interface Props {
  hotels: OsmHotel[];
  cityName: string;
  checkIn: string;
  checkOut: string;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  onHotelClick: (id: number) => void;
}

function starColor(stars: number | null): string {
  switch (stars) {
    case 5: return '#fbbf24';
    case 4: return '#60a5fa';
    case 3: return '#34d399';
    default: return '#9ca3af';
  }
}

function starDisplay(stars: number | null): string {
  if (!stars) return '—';
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

export function HotelList({ hotels, cityName, checkIn, checkOut, sortKey, onSortChange, onHotelClick }: Props) {
  const bookingUrl = (name: string) => {
    const q = encodeURIComponent(`${name} ${cityName}`);
    return `https://www.booking.com/searchresults.html?ss=${q}&checkin=${checkIn}&checkout=${checkOut}`;
  };

  const sortBtn = (key: SortKey, label: string) => (
    <button
      onClick={() => onSortChange(key)}
      className="px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
      style={{
        background: sortKey === key ? 'var(--accent)' : 'var(--bg-tertiary)',
        color: sortKey === key ? 'var(--bg-primary)' : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found
        </h3>
        <div className="flex gap-2">
          {sortBtn('distance', 'Distance')}
          {sortBtn('stars', 'Stars')}
          {sortBtn('name', 'Name')}
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
      >
        {hotels.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No hotels match your filters.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => onHotelClick(hotel.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Star dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: starColor(hotel.stars) }}
                />

                {/* Name + address */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {hotel.name}
                  </div>
                  {hotel.address && (
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {hotel.address}
                    </div>
                  )}
                </div>

                {/* Stars */}
                <div
                  className="text-xs flex-shrink-0 hidden sm:block"
                  style={{ color: starColor(hotel.stars) }}
                >
                  {starDisplay(hotel.stars)}
                </div>

                {/* Distance */}
                <div
                  className="text-xs flex-shrink-0 w-16 text-right"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {hotel.distanceFromCenter.toFixed(1)} km
                </div>

                {/* Book button */}
                <a
                  href={bookingUrl(hotel.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#003580', color: '#fff' }}
                >
                  Book
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type { SortKey };
