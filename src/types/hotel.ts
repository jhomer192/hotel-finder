export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface BookingSource {
  id: string;
  name: string;
  color: string;
  description: string;
  buildUrl: (params: SearchParams) => string;
}

export interface SearchResult {
  city: string;
  centerLat: number;
  centerLng: number;
  neighborhoods: string[];
  sources: Array<{
    source: BookingSource;
    url: string;
  }>;
}
