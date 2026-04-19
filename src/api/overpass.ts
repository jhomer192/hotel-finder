import type { OsmHotel } from '../types/hotel';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const BBOX_OFFSET = 0.05; // ~5.5 km in each direction
const MAX_RESULTS = 200;

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseStars(tags: Record<string, string>): number | null {
  const raw = tags['stars'] || tags['star_rating'] || tags['hotel:stars'];
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return n >= 1 && n <= 5 ? n : null;
}

function buildAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  if (tags['addr:housenumber'] && tags['addr:street']) {
    parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
  } else if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  return parts.join(', ');
}

function cacheKey(cityName: string): string {
  return `overpass_hotels_${cityName.toLowerCase().replace(/\s+/g, '_')}`;
}

export async function fetchHotels(
  cityName: string,
  centerLat: number,
  centerLng: number,
): Promise<OsmHotel[]> {
  // Check sessionStorage cache
  const key = cacheKey(cityName);
  const cached = sessionStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached) as OsmHotel[];
    } catch {
      sessionStorage.removeItem(key);
    }
  }

  const south = centerLat - BBOX_OFFSET;
  const north = centerLat + BBOX_OFFSET;
  const west = centerLng - BBOX_OFFSET;
  const east = centerLng + BBOX_OFFSET;

  const query = `[out:json];node["tourism"="hotel"](${south},${west},${north},${east});out ${MAX_RESULTS};`;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  const data: OverpassResponse = await res.json();

  const hotels: OsmHotel[] = data.elements
    .filter((el) => el.tags?.name)
    .map((el) => {
      const tags = el.tags!;
      return {
        id: el.id,
        lat: el.lat,
        lng: el.lon,
        name: tags.name!,
        stars: parseStars(tags),
        address: buildAddress(tags),
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        distanceFromCenter: haversineKm(centerLat, centerLng, el.lat, el.lon),
      };
    })
    .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

  // Cache in sessionStorage
  try {
    sessionStorage.setItem(key, JSON.stringify(hotels));
  } catch {
    // Storage full — ignore
  }

  return hotels;
}
