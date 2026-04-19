export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface OsmHotel {
  id: number;
  lat: number;
  lng: number;
  name: string;
  stars: number | null;
  address: string;
  phone: string | null;
  website: string | null;
  distanceFromCenter: number; // km
}
