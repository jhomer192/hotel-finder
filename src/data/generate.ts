import type { Hotel, Amenity, PropertyType, Badge } from '../types/hotel';
import type { CityData } from './cities';
import { HOTEL_PHOTO_IDS } from './photos';

const ALL_AMENITIES: Amenity[] = [
  'WiFi', 'Pool', 'Gym', 'Parking', 'Breakfast', 'Spa',
  'Pet-friendly', 'Restaurant', 'Bar', 'Room Service',
  'Airport Shuttle', 'Beach Access',
];

const PROPERTY_TYPES: PropertyType[] = ['Hotel', 'Hostel', 'Apartment', 'Resort', 'B&B'];

const HOTEL_PREFIXES = [
  'Grand', 'Royal', 'The', 'Hotel', 'Park', 'Golden', 'Silver', 'Blue',
  'City', 'Metro', 'Urban', 'Central', 'Boutique', 'Elite', 'Premier',
  'Capital', 'Imperial', 'Majestic', 'Palace', 'Heritage',
];

const HOTEL_SUFFIXES = [
  'Hotel', 'Inn', 'Suites', 'Lodge', 'Residence', 'Place', 'House',
  'Tower', 'View', 'Stay', 'Retreat', 'Haven', 'Quarters', 'Arms',
  'Court', 'Plaza', 'Gardens', 'Loft', 'Rooms', 'Studio',
];

// Seeded pseudo-random number generator for deterministic results
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateHotelsForCity(city: CityData): Hotel[] {
  const rand = mulberry32(hashString(city.name));
  const count = 40 + Math.floor(rand() * 21); // 40-60 hotels
  const hotels: Hotel[] = [];

  for (let i = 0; i < count; i++) {
    const stars = (Math.floor(rand() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
    const [minPrice, maxPrice] = city.priceRange;

    // Price correlates with stars but has variance
    const starFactor = (stars - 1) / 4;
    const basePrice = minPrice + (maxPrice - minPrice) * (starFactor * 0.7 + rand() * 0.3);
    const pricePerNight = Math.round(basePrice + rand() * (maxPrice - minPrice) * 0.15);

    // Some hotels have "discount" prices
    const hasDiscount = rand() < 0.3;
    const originalPrice = hasDiscount
      ? Math.round(pricePerNight * (1.15 + rand() * 0.25))
      : undefined;

    // Guest rating correlates loosely with stars
    const baseRating = 5.0 + stars * 0.7;
    const guestRating = Math.min(9.8, Math.max(5.0,
      +(baseRating + (rand() - 0.4) * 2).toFixed(1)
    ));

    // Amenities: more stars = more amenities
    const numAmenities = Math.min(ALL_AMENITIES.length, stars + Math.floor(rand() * 4));
    const shuffled = [...ALL_AMENITIES].sort(() => rand() - 0.5);
    const amenities = shuffled.slice(0, numAmenities);
    // WiFi is almost universal
    if (!amenities.includes('WiFi') && rand() > 0.1) {
      amenities[0] = 'WiFi';
    }

    // Property type: weighted by stars
    let propertyType: PropertyType;
    const r = rand();
    if (stars <= 2) {
      propertyType = r < 0.3 ? 'Hostel' : r < 0.5 ? 'B&B' : r < 0.7 ? 'Apartment' : 'Hotel';
    } else if (stars >= 4) {
      propertyType = r < 0.6 ? 'Hotel' : r < 0.8 ? 'Resort' : r < 0.9 ? 'Apartment' : 'B&B';
    } else {
      propertyType = PROPERTY_TYPES[Math.floor(rand() * PROPERTY_TYPES.length)];
    }

    // Location: scatter around city center
    const latOffset = (rand() - 0.5) * 0.08;
    const lngOffset = (rand() - 0.5) * 0.08;
    const lat = city.lat + latOffset;
    const lng = city.lng + lngOffset;
    const distanceToCenter = +(Math.sqrt(latOffset ** 2 + lngOffset ** 2) * 111).toFixed(1);

    const neighborhood = city.neighborhoods[Math.floor(rand() * city.neighborhoods.length)];
    const photoId = HOTEL_PHOTO_IDS[Math.floor(rand() * HOTEL_PHOTO_IDS.length)];

    // Generate a name
    const prefix = HOTEL_PREFIXES[Math.floor(rand() * HOTEL_PREFIXES.length)];
    const suffix = HOTEL_SUFFIXES[Math.floor(rand() * HOTEL_SUFFIXES.length)];
    const name = `${prefix} ${neighborhood.split(' ')[0]} ${suffix}`;

    // Badges
    const badges: Badge[] = [];
    if (hasDiscount) badges.push('discount');

    hotels.push({
      id: `${city.name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      name,
      city: city.name,
      neighborhood,
      stars,
      guestRating,
      pricePerNight: Math.max(minPrice, Math.min(maxPrice, pricePerNight)),
      originalPrice,
      amenities,
      propertyType,
      photoId,
      lat,
      lng,
      distanceToCenter,
      badges,
    });
  }

  // Assign "Best Value" to cheapest hotels with rating > 8.0
  const bestValueCandidates = hotels
    .filter((h) => h.guestRating > 8.0)
    .sort((a, b) => a.pricePerNight - b.pricePerNight)
    .slice(0, 3);
  for (const h of bestValueCandidates) {
    h.badges.push('Best Value');
  }

  // Assign "Popular" to top-rated hotels
  const popular = [...hotels]
    .sort((a, b) => b.guestRating - a.guestRating)
    .slice(0, 3);
  for (const h of popular) {
    if (!h.badges.includes('Popular')) {
      h.badges.push('Popular');
    }
  }

  return hotels;
}
