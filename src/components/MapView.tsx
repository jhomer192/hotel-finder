import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OsmHotel } from '../types/hotel';

interface Props {
  cityName: string;
  lat: number;
  lng: number;
  hotels: OsmHotel[];
  checkIn: string;
  checkOut: string;
  highlightedId: number | null;
  onHotelClick: (id: number) => void;
}

function starColor(stars: number | null): string {
  switch (stars) {
    case 5: return '#fbbf24'; // gold
    case 4: return '#60a5fa'; // blue
    case 3: return '#34d399'; // green
    default: return '#9ca3af'; // gray for 2, 1, unknown
  }
}

function starLabel(stars: number | null): string {
  if (!stars) return '';
  return '★'.repeat(stars);
}

function bookingUrl(hotelName: string, city: string, checkIn: string, checkOut: string): string {
  const q = encodeURIComponent(`${hotelName} ${city}`);
  return `https://www.booking.com/searchresults.html?ss=${q}&checkin=${checkIn}&checkout=${checkOut}`;
}

function googleUrl(hotelName: string, city: string, checkIn: string, checkOut: string): string {
  const q = encodeURIComponent(`${hotelName} ${city}`);
  return `https://www.google.com/travel/hotels?q=${q}&dates=${checkIn}+${checkOut}`;
}

export function MapView({ cityName, lat, lng, hotels, checkIn, checkOut, highlightedId, onHotelClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    markersRef.current.clear();

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    map.setView([lat, lng], 14);

    // City center marker
    const centerIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 12px; height: 12px; border-radius: 50%;
        background: var(--accent, #7aa2f7); border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    L.marker([lat, lng], { icon: centerIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:system-ui;text-align:center;font-weight:600;">${cityName} Center</div>`);

    // Hotel markers
    hotels.forEach((hotel) => {
      const color = starColor(hotel.stars);
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 14px; height: 14px; border-radius: 50%;
          background: ${color}; border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: transform 0.15s;
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12],
      });

      const starsHtml = hotel.stars
        ? `<div style="color:${color};font-size:13px;margin:2px 0;">${starLabel(hotel.stars)}</div>`
        : '';
      const addressHtml = hotel.address
        ? `<div style="font-size:11px;opacity:0.7;margin-top:2px;">${hotel.address}</div>`
        : '';

      const popupHtml = `
        <div style="font-family:system-ui;min-width:180px;">
          <div style="font-weight:600;font-size:14px;">${hotel.name}</div>
          ${starsHtml}
          ${addressHtml}
          <div style="margin-top:8px;display:flex;gap:6px;">
            <a href="${bookingUrl(hotel.name, cityName, checkIn, checkOut)}" target="_blank" rel="noopener"
               style="flex:1;text-align:center;padding:4px 8px;background:#003580;color:#fff;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">
              Booking.com
            </a>
            <a href="${googleUrl(hotel.name, cityName, checkIn, checkOut)}" target="_blank" rel="noopener"
               style="flex:1;text-align:center;padding:4px 8px;background:#4285f4;color:#fff;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">
              Google
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([hotel.lat, hotel.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml)
        .bindTooltip(hotel.name, { direction: 'top', offset: [0, -10] });

      marker.on('click', () => onHotelClick(hotel.id));
      markersRef.current.set(hotel.id, marker);
    });

    // Fit bounds if hotels exist
    if (hotels.length > 0) {
      const group = L.featureGroup(Array.from(markersRef.current.values()));
      map.fitBounds(group.getBounds().pad(0.1));
    }

    const markers = markersRef.current;
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markers.clear();
    };
  }, [cityName, lat, lng, hotels, checkIn, checkOut, onHotelClick]);

  // Handle highlighted hotel
  useEffect(() => {
    if (highlightedId !== null && mapRef.current) {
      const marker = markersRef.current.get(highlightedId);
      if (marker) {
        mapRef.current.setView(marker.getLatLng(), 16, { animate: true });
        marker.openPopup();
      }
    }
  }, [highlightedId]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: '500px', border: '1px solid var(--border)' }}
    />
  );
}
