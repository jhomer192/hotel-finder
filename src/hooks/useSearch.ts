import { useState, useCallback } from 'react';
import type { Hotel, SearchParams, SortOption, Filters } from '../types/hotel';
import { mockProvider } from '../providers/mock';

export const DEFAULT_FILTERS: Filters = {
  priceRange: [0, 1000],
  starRatings: [],
  minGuestRating: 0,
  amenities: [],
  propertyTypes: [],
};

function applyFilters(hotels: Hotel[], filters: Filters): Hotel[] {
  return hotels.filter((h) => {
    if (h.pricePerNight < filters.priceRange[0] || h.pricePerNight > filters.priceRange[1])
      return false;
    if (filters.starRatings.length > 0 && !filters.starRatings.includes(h.stars)) return false;
    if (filters.minGuestRating > 0 && h.guestRating < filters.minGuestRating) return false;
    if (filters.amenities.length > 0 && !filters.amenities.every((a) => h.amenities.includes(a)))
      return false;
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(h.propertyType))
      return false;
    return true;
  });
}

function applySort(hotels: Hotel[], sort: SortOption): Hotel[] {
  const sorted = [...hotels];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case 'price-desc':
      return sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
    case 'rating-desc':
      return sorted.sort((a, b) => b.guestRating - a.guestRating);
    case 'stars-desc':
      return sorted.sort((a, b) => b.stars - a.stars || b.guestRating - a.guestRating);
    case 'distance-asc':
      return sorted.sort((a, b) => a.distanceToCenter - b.distanceToCenter);
  }
}

export function useSearch() {
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [results, setResults] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [sort, setSortState] = useState<SortOption>('price-asc');
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);

  const updateResults = useCallback(
    (hotels: Hotel[], s: SortOption, f: Filters) => {
      setResults(applySort(applyFilters(hotels, f), s));
    },
    []
  );

  const search = useCallback(
    async (params: SearchParams) => {
      setLoading(true);
      setSearchParams(params);
      try {
        const hotels = await mockProvider.searchHotels(params);
        setAllHotels(hotels);
        // Compute price range for filters
        const prices = hotels.map((h) => h.pricePerNight);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const newFilters = { ...DEFAULT_FILTERS, priceRange: [minP, maxP] as [number, number] };
        setFiltersState(newFilters);
        updateResults(hotels, sort, newFilters);
      } finally {
        setLoading(false);
      }
    },
    [sort, updateResults]
  );

  const setSort = useCallback(
    (s: SortOption) => {
      setSortState(s);
      updateResults(allHotels, s, filters);
    },
    [allHotels, filters, updateResults]
  );

  const setFilters = useCallback(
    (f: Filters) => {
      setFiltersState(f);
      updateResults(allHotels, sort, f);
    },
    [allHotels, sort, updateResults]
  );

  return {
    results,
    allHotels,
    loading,
    searchParams,
    sort,
    filters,
    search,
    setSort,
    setFilters,
  };
}
