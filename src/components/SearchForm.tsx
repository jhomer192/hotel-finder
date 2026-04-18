import { useState, useRef, useEffect, useMemo } from 'react';
import type { SearchParams } from '../types/hotel';
import { CITIES } from '../data/cities';

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
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

export function SearchForm({ onSearch, loading }: Props) {
  const defaults = getDefaultDates();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!destination.trim()) return CITIES.slice(0, 10);
    const q = destination.toLowerCase();
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [destination]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectCity(name: string) {
    setDestination(name);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectCity(suggestions[activeIndex].name);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const city = CITIES.find((c) => c.name.toLowerCase() === destination.toLowerCase());
    if (!city) return;
    onSearch({ destination: city.name, checkIn, checkOut, guests, rooms });
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Destination */}
        <div className="md:col-span-4 relative">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Destination
          </label>
          <input
            ref={inputRef}
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setShowSuggestions(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Where are you going?"
            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <div ref={dropdownRef} className="autocomplete-dropdown">
              {suggestions.map((city, i) => (
                <div
                  key={city.name}
                  className={`autocomplete-item ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => selectCity(city.name)}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{city.name}</span>
                  <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {city.country}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-in */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            required
          />
        </div>

        {/* Check-out */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn}
            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            required
          />
        </div>

        {/* Guests */}
        <div className="md:col-span-1">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Rooms */}
        <div className="md:col-span-1">
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            Rooms
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading || !destination}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </span>
            ) : (
              'Search Hotels'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
