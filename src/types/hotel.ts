export type Amenity =
  | 'WiFi'
  | 'Pool'
  | 'Gym'
  | 'Parking'
  | 'Breakfast'
  | 'Spa'
  | 'Pet-friendly'
  | 'Restaurant'
  | 'Bar'
  | 'Room Service'
  | 'Airport Shuttle'
  | 'Beach Access';

export type PropertyType = 'Hotel' | 'Hostel' | 'Apartment' | 'Resort' | 'B&B';

export type Badge = 'Best Value' | 'Popular' | 'discount';

export interface Hotel {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  stars: 1 | 2 | 3 | 4 | 5;
  guestRating: number;
  pricePerNight: number;
  originalPrice?: number;
  amenities: Amenity[];
  propertyType: PropertyType;
  photoId: string;
  lat: number;
  lng: number;
  distanceToCenter: number;
  badges: Badge[];
}

export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'stars-desc'
  | 'distance-asc';

export interface Filters {
  priceRange: [number, number];
  starRatings: number[];
  minGuestRating: number;
  amenities: Amenity[];
  propertyTypes: PropertyType[];
}

export interface HotelProvider {
  name: string;
  searchHotels(params: SearchParams): Promise<Hotel[]>;
  getBookingUrl(hotel: Hotel, params: SearchParams): string;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 9.0) return 'Exceptional';
  if (rating >= 8.0) return 'Excellent';
  if (rating >= 7.0) return 'Very Good';
  if (rating >= 6.0) return 'Good';
  return 'Fair';
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}
