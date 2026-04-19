import { useState, useCallback, useMemo } from 'react';
import { SearchForm } from './components/SearchForm';
import { MapView } from './components/MapView';
import { HotelList, type SortKey } from './components/HotelList';
import { Filters } from './components/Filters';
import { ThemePicker } from './components/ThemePicker';
import { useTheme } from './hooks/useTheme';
import { CITIES } from './data/cities';
import { fetchHotels } from './api/overpass';
import type { SearchParams, OsmHotel } from './types/hotel';

interface SearchState {
  params: SearchParams;
  city: { name: string; lat: number; lng: number };
  hotels: OsmHotel[];
}

function getDefaultDates() {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 3);
  return {
    checkIn: checkIn.toISOString().split('T')[0],
    checkOut: checkOut.toISOString().split('T')[0],
  };
}

const ALL_STARS = new Set([0, 1, 2, 3, 4, 5]);

export default function App() {
  const { theme, setTheme } = useTheme();
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [starFilters, setStarFilters] = useState<Set<number>>(new Set(ALL_STARS));
  const [nameQuery, setNameQuery] = useState('');

  const search = useCallback(async (params: SearchParams) => {
    const city = CITIES.find(c => c.name.toLowerCase() === params.destination.toLowerCase());
    if (!city) return;

    setLoading(true);
    setError(null);
    setHighlightedId(null);
    setStarFilters(new Set(ALL_STARS));
    setNameQuery('');
    setSortKey('distance');

    try {
      const hotels = await fetchHotels(city.name, city.lat, city.lng);
      setSearchState({
        params,
        city: { name: city.name, lat: city.lat, lng: city.lng },
        hotels,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hotels');
      setSearchState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStar = useCallback((star: number) => {
    setStarFilters(prev => {
      const next = new Set(prev);
      if (next.has(star)) {
        next.delete(star);
      } else {
        next.add(star);
      }
      return next;
    });
  }, []);

  const filteredHotels = useMemo(() => {
    if (!searchState) return [];
    let list = searchState.hotels.filter(h => {
      const hotelStar = h.stars ?? 0;
      if (!starFilters.has(hotelStar)) return false;
      if (nameQuery && !h.name.toLowerCase().includes(nameQuery.toLowerCase())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name);
        case 'stars': return (b.stars ?? 0) - (a.stars ?? 0);
        case 'distance': return a.distanceFromCenter - b.distanceFromCenter;
        default: return 0;
      }
    });

    return list;
  }, [searchState, starFilters, nameQuery, sortKey]);

  const handleHotelClick = useCallback((id: number) => {
    setHighlightedId(id);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <span className="text-2xl">&#x1F3E8;</span>
            Hotel Finder
          </h1>
          <ThemePicker theme={theme} setTheme={setTheme} />
        </div>
      </header>

      {/* Search section */}
      <section
        className="border-b"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-5">
          <SearchForm onSearch={search} loading={loading} />
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block">
            <svg className="animate-spin h-8 w-8 mx-auto mb-4" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
              Searching OpenStreetMap for hotels...
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Fetching real hotel data from Overpass API
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Something went wrong
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            The Overpass API may be rate-limited. Try again in a moment.
          </p>
        </div>
      )}

      {/* Results */}
      {searchState && !loading && (
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
          {/* Summary */}
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {searchState.hotels.length}
            </span>{' '}
            real hotels found in{' '}
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {searchState.city.name}
            </span>{' '}
            from OpenStreetMap
          </p>

          {/* Filters */}
          <Filters
            starFilters={starFilters}
            onToggleStar={toggleStar}
            nameQuery={nameQuery}
            onNameQueryChange={setNameQuery}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#fbbf24' }} /> 5-star
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#60a5fa' }} /> 4-star
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#34d399' }} /> 3-star
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#9ca3af' }} /> Other / Unknown
            </span>
          </div>

          {/* Map */}
          <MapView
            cityName={searchState.city.name}
            lat={searchState.city.lat}
            lng={searchState.city.lng}
            hotels={filteredHotels}
            checkIn={searchState.params.checkIn}
            checkOut={searchState.params.checkOut}
            highlightedId={highlightedId}
            onHotelClick={handleHotelClick}
          />

          {/* Hotel list */}
          <HotelList
            hotels={filteredHotels}
            cityName={searchState.city.name}
            checkIn={searchState.params.checkIn}
            checkOut={searchState.params.checkOut}
            sortKey={sortKey}
            onSortChange={setSortKey}
            onHotelClick={handleHotelClick}
          />
        </main>
      )}

      {/* Landing state */}
      {!searchState && !loading && !error && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">&#x1F3E8;</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Find Real Hotels Worldwide
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Search {CITIES.length} cities for real hotel locations from OpenStreetMap. See them on a map, filter by stars, and book directly.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl mx-auto">
            {['Tokyo', 'Paris', 'Bangkok', 'New York', 'Barcelona', 'Bali', 'Prague', 'Lisbon', 'Marrakech', 'Singapore'].map(
              (city) => (
                <button
                  key={city}
                  onClick={() => {
                    const defaults = getDefaultDates();
                    search({
                      destination: city,
                      checkIn: defaults.checkIn,
                      checkOut: defaults.checkOut,
                      guests: 2,
                      rooms: 1,
                    });
                  }}
                  className="px-4 py-2 rounded-full text-sm transition-colors cursor-pointer"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {city}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Hotel data from{' '}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            OpenStreetMap
          </a>
          . Contribute at{' '}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            openstreetmap.org
          </a>
        </div>
      </footer>
    </div>
  );
}
