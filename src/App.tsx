import { useState, useCallback } from 'react';
import { SearchForm } from './components/SearchForm';
import { SourcesGrid } from './components/SourcesGrid';
import { MapView } from './components/MapView';
import { ThemePicker } from './components/ThemePicker';
import { useTheme } from './hooks/useTheme';
import { BOOKING_SOURCES } from './data/sources';
import { CITIES } from './data/cities';
import type { SearchParams, BookingSource } from './types/hotel';

type ViewMode = 'sources' | 'map';

interface SearchState {
  params: SearchParams;
  sources: Array<{ source: BookingSource; url: string }>;
  city: { name: string; lat: number; lng: number };
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

function buildSourceUrls(params: SearchParams): Array<{ source: BookingSource; url: string }> {
  return BOOKING_SOURCES.map(source => ({
    source,
    url: source.buildUrl(params),
  }));
}

export default function App() {
  const { theme, setTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('sources');
  const [searchState, setSearchState] = useState<SearchState | null>(null);

  const search = useCallback((params: SearchParams) => {
    const city = CITIES.find(c => c.name.toLowerCase() === params.destination.toLowerCase());
    if (!city) return;
    setSearchState({
      params,
      sources: buildSourceUrls(params),
      city: { name: city.name, lat: city.lat, lng: city.lng },
    });
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
            Cheap Hotel Finder
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
          <SearchForm onSearch={search} loading={false} />
        </div>
      </section>

      {/* Results */}
      {searchState && (
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{searchState.sources.length}</span> booking sites for{' '}
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{searchState.city.name}</span>
            </p>

            {/* View toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setViewMode('sources')}
                className="px-3 py-1.5 text-sm cursor-pointer"
                style={{
                  background: viewMode === 'sources' ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: viewMode === 'sources' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                }}
              >
                Sources
              </button>
              <button
                onClick={() => setViewMode('map')}
                className="px-3 py-1.5 text-sm cursor-pointer"
                style={{
                  background: viewMode === 'map' ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: viewMode === 'map' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                }}
              >
                Map
              </button>
            </div>
          </div>

          {/* Main content */}
          {viewMode === 'sources' ? (
            <SourcesGrid sources={searchState.sources} cityName={searchState.city.name} />
          ) : (
            <MapView
              cityName={searchState.city.name}
              lat={searchState.city.lat}
              lng={searchState.city.lng}
            />
          )}
        </main>
      )}

      {/* Landing state */}
      {!searchState && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">&#x1F3E8;</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Find Your Perfect Hotel Deal
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Search {BOOKING_SOURCES.length} booking sites at once. Pick your city and dates, then click through to compare prices on every major platform.
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
          Cheap Hotel Finder — Search aggregator across {BOOKING_SOURCES.length} booking sites.
        </div>
      </footer>
    </div>
  );
}
