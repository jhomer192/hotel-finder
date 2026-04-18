import { useState } from 'react';
import type { Filters as FiltersType, Amenity, PropertyType, SortOption } from '../types/hotel';

const ALL_AMENITIES: Amenity[] = [
  'WiFi', 'Pool', 'Gym', 'Parking', 'Breakfast', 'Spa',
  'Pet-friendly', 'Restaurant', 'Bar', 'Room Service',
  'Airport Shuttle', 'Beach Access',
];

const PROPERTY_TYPES: PropertyType[] = ['Hotel', 'Hostel', 'Apartment', 'Resort', 'B&B'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Guest Rating' },
  { value: 'stars-desc', label: 'Star Rating' },
  { value: 'distance-asc', label: 'Distance to Center' },
];

interface Props {
  filters: FiltersType;
  sort: SortOption;
  onFiltersChange: (f: FiltersType) => void;
  onSortChange: (s: SortOption) => void;
  maxPrice: number;
  minPrice: number;
  resultCount: number;
  totalCount: number;
}

export function Filters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  maxPrice,
  minPrice,
  resultCount,
  totalCount,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  function toggleStar(star: number) {
    const next = filters.starRatings.includes(star)
      ? filters.starRatings.filter((s) => s !== star)
      : [...filters.starRatings, star];
    onFiltersChange({ ...filters, starRatings: next });
  }

  function toggleAmenity(a: Amenity) {
    const next = filters.amenities.includes(a)
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    onFiltersChange({ ...filters, amenities: next });
  }

  function togglePropertyType(pt: PropertyType) {
    const next = filters.propertyTypes.includes(pt)
      ? filters.propertyTypes.filter((x) => x !== pt)
      : [...filters.propertyTypes, pt];
    onFiltersChange({ ...filters, propertyTypes: next });
  }

  const checkboxStyle: React.CSSProperties = {
    accentColor: 'var(--accent)',
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* Sort + result count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {resultCount} of {totalCount} hotels
        </span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-1.5 rounded-lg text-sm focus:outline-none cursor-pointer"
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle filters on mobile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left text-sm font-semibold mb-3 md:hidden cursor-pointer"
        style={{ color: 'var(--accent)' }}
      >
        {expanded ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={`space-y-5 ${expanded ? '' : 'hidden md:block'}`}>
        {/* Price range */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Price per night: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange[0]}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceRange: [Math.min(Number(e.target.value), filters.priceRange[1] - 10), filters.priceRange[1]],
                })
              }
              className="flex-1"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange[1]}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceRange: [filters.priceRange[0], Math.max(Number(e.target.value), filters.priceRange[0] + 10)],
                })
              }
              className="flex-1"
            />
          </div>
        </div>

        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Star Rating
          </label>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => toggleStar(star)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                style={{
                  background: filters.starRatings.includes(star)
                    ? 'var(--accent)'
                    : 'var(--bg-tertiary)',
                  color: filters.starRatings.includes(star)
                    ? 'var(--bg-primary)'
                    : 'var(--text-secondary)',
                }}
              >
                {star} ★
              </button>
            ))}
          </div>
        </div>

        {/* Guest rating minimum */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Minimum Guest Rating
          </label>
          <div className="flex flex-wrap gap-2">
            {[0, 6, 7, 8, 9].map((r) => (
              <button
                key={r}
                onClick={() =>
                  onFiltersChange({ ...filters, minGuestRating: r })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                style={{
                  background:
                    filters.minGuestRating === r ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color:
                    filters.minGuestRating === r
                      ? 'var(--bg-primary)'
                      : 'var(--text-secondary)',
                }}
              >
                {r === 0 ? 'Any' : `${r}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Property type */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Property Type
          </label>
          <div className="space-y-1.5">
            {PROPERTY_TYPES.map((pt) => (
              <label key={pt} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={filters.propertyTypes.includes(pt)}
                  onChange={() => togglePropertyType(pt)}
                  style={checkboxStyle}
                />
                {pt}
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Amenities
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  style={checkboxStyle}
                />
                {a}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
