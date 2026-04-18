import type { BookingSource, SearchParams } from '../types/hotel';

function citySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-');
}

export const BOOKING_SOURCES: BookingSource[] = [
  {
    id: 'booking',
    name: 'Booking.com',
    color: '#003580',
    description: 'Huge selection with free cancellation on most rooms. Often has the widest availability.',
    buildUrl: (p: SearchParams) =>
      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(p.destination)}&checkin=${p.checkIn}&checkout=${p.checkOut}&group_adults=${p.guests}&no_rooms=${p.rooms}`,
  },
  {
    id: 'hotels',
    name: 'Hotels.com',
    color: '#d32f2f',
    description: 'Earn a free night for every 10 stays. Great loyalty rewards for frequent travelers.',
    buildUrl: (p: SearchParams) =>
      `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(p.destination)}&q-check-in=${p.checkIn}&q-check-out=${p.checkOut}&q-rooms=${p.rooms}&q-room-0-adults=${p.guests}`,
  },
  {
    id: 'expedia',
    name: 'Expedia',
    color: '#00355f',
    description: 'Bundle hotel + flight for extra savings. Member prices unlock additional discounts.',
    buildUrl: (p: SearchParams) =>
      `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(p.destination)}&startDate=${p.checkIn}&endDate=${p.checkOut}&rooms=${p.rooms}&adults=${p.guests}`,
  },
  {
    id: 'kayak',
    name: 'Kayak',
    color: '#ff690f',
    description: 'Meta-search engine comparing prices across hundreds of booking sites at once.',
    buildUrl: (p: SearchParams) =>
      `https://www.kayak.com/hotels/${citySlug(p.destination)}/${p.checkIn}/${p.checkOut}/${p.guests}adults`,
  },
  {
    id: 'google-hotels',
    name: 'Google Hotels',
    color: '#4285f4',
    description: 'Compare rates from all major sites in one place. See prices directly in Google.',
    buildUrl: (p: SearchParams) =>
      `https://www.google.com/travel/hotels/${encodeURIComponent(p.destination)}?q=${encodeURIComponent(p.destination + ' hotels')}&dates=${p.checkIn}+${p.checkOut}&guests=${p.guests}`,
  },
  {
    id: 'trivago',
    name: 'Trivago',
    color: '#007faf',
    description: 'Compare hotel prices from hundreds of booking sites. Find your ideal hotel for the best price.',
    buildUrl: (p: SearchParams) =>
      `https://www.trivago.com/en-US/srl?search=${encodeURIComponent(p.destination)}&cin=${p.checkIn}&cout=${p.checkOut}&room_type=${p.rooms}`,
  },
  {
    id: 'hostelworld',
    name: 'Hostelworld',
    color: '#f47920',
    description: 'Best selection of hostels worldwide. Perfect for budget travelers and backpackers.',
    buildUrl: (p: SearchParams) =>
      `https://www.hostelworld.com/s?q=${encodeURIComponent(p.destination)}&dateFrom=${p.checkIn}&dateTo=${p.checkOut}&guests=${p.guests}`,
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    color: '#ff5a5f',
    description: 'Unique stays and local experiences. Apartments, homes, and unusual properties.',
    buildUrl: (p: SearchParams) =>
      `https://www.airbnb.com/s/${encodeURIComponent(p.destination)}/homes?checkin=${p.checkIn}&checkout=${p.checkOut}&adults=${p.guests}`,
  },
  {
    id: 'vrbo',
    name: 'Vrbo',
    color: '#1a5276',
    description: 'Vacation rentals for families and groups. Entire homes with full kitchens and space.',
    buildUrl: (p: SearchParams) =>
      `https://www.vrbo.com/search?destination=${encodeURIComponent(p.destination)}&startDate=${p.checkIn}&endDate=${p.checkOut}&adults=${p.guests}`,
  },
];
