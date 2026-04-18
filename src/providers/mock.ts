import type { Hotel, HotelProvider, SearchParams } from '../types/hotel';
import { CITIES } from '../data/cities';
import { generateHotelsForCity } from '../data/generate';

// Cache generated hotels per city
const cache = new Map<string, Hotel[]>();

function getHotelsForCity(cityName: string): Hotel[] {
  const key = cityName.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  const city = CITIES.find(
    (c) => c.name.toLowerCase() === key
  );
  if (!city) return [];

  const hotels = generateHotelsForCity(city);
  cache.set(key, hotels);
  return hotels;
}

export const mockProvider: HotelProvider = {
  name: 'Mock Provider',

  async searchHotels(params: SearchParams): Promise<Hotel[]> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
    return getHotelsForCity(params.destination);
  },

  getBookingUrl(hotel: Hotel, params: SearchParams): string {
    const city = encodeURIComponent(hotel.city);
    const checkin = params.checkIn;
    const checkout = params.checkOut;
    return `https://www.booking.com/searchresults.html?ss=${city}&checkin=${checkin}&checkout=${checkout}&group_adults=${params.guests}&no_rooms=${params.rooms}`;
  },
};
