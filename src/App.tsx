import { useState, useCallback } from 'react';
import { SearchForm } from './components/SearchForm';
import { HotelCard } from './components/HotelCard';
import { Filters } from './components/Filters';
import { MapView } from './components/MapView';
import { CompareModal } from './components/CompareModal';
import { ThemePicker } from './components/ThemePicker';
import { useTheme } from './hooks/useTheme';
import { useSearch } from './hooks/useSearch';
import type { Hotel } from './types/hotel';

type ViewMode = 'grid' | 'map';

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

function App() {
  const { theme, setTheme } = useTheme();
  const {
    results,
    allHotels,
    loading,
    searchParams,
    sort,
    filters,
    search,
    setSort,
    setFilters,
  } = useSearch();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [compareList, setCompareList] = useState<Hotel[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = useCallback((hotel: Hotel) => {
    setCompareList((prev) => {
      const exists = prev.find((h) => h.id === hotel.id);
      if (exists) return prev.filter((h) => h.id !== hotel.id);
      if (prev.length >= 3) return prev;
      return [...prev, hotel];
    });
  }, []);

  const removeFromCompare = useCallback((hotel: Hotel) => {
    setCompareList((prev) => prev.filter((h) => h.id !== hotel.id));
  }, []);

  const prices = allHotels.map((h) => h.pricePerNight);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000;

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
          <SearchForm onSearch={search} loading={loading} />
        </div>
      </section>

      {/* Results */}
      {searchParams && (
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {results.length > 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Hotels in <span style={{ color: 'var(--text-primary)' }}>{searchParams.destination}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Compare button */}
              {compareList.length >= 2 && (
                <button
                  onClick={() => setShowCompare(true)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
                  style={{
                    background: 'var(--accent-secondary)',
                    color: 'var(--bg-primary)',
                  }}
                >
                  Compare ({compareList.length})
                </button>
              )}
              {/* View toggle */}
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-1.5 text-sm cursor-pointer"
                  style={{
                    background: viewMode === 'grid' ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: viewMode === 'grid' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  }}
                >
                  Grid
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar filters */}
            <aside className="lg:col-span-1">
              <Filters
                filters={filters}
                sort={sort}
                onFiltersChange={setFilters}
                onSortChange={setSort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                resultCount={results.length}
                totalCount={allHotels.length}
              />
            </aside>

            {/* Main content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <svg className="animate-spin h-8 w-8" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                    No hotels match your filters
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === 'map' && (
                    <div className="mb-6">
                      <MapView hotels={results} searchParams={searchParams} />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {results.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        searchParams={searchParams}
                        isComparing={compareList.some((h) => h.id === hotel.id)}
                        onToggleCompare={toggleCompare}
                        canCompare={compareList.length < 3}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Landing state */}
      {!searchParams && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">&#x1F3E8;</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Find Your Perfect Hotel Deal
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Search 50+ cities worldwide. Compare prices, ratings, and amenities to find the best value for your trip.
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

      {/* Compare Modal */}
      {showCompare && searchParams && compareList.length >= 2 && (
        <CompareModal
          hotels={compareList}
          searchParams={searchParams}
          onClose={() => setShowCompare(false)}
          onRemove={removeFromCompare}
        />
      )}

      {/* Compare FAB */}
      {compareList.length > 0 && compareList.length < 2 && (
        <div
          className="fixed bottom-4 right-4 px-4 py-2 rounded-full text-sm z-40"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {compareList.length}/3 selected for comparison (need at least 2)
        </div>
      )}
    </div>
  );
}

export default App;
