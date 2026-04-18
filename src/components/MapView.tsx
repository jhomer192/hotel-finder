import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Hotel, SearchParams } from '../types/hotel';
import { getRatingLabel, nightsBetween } from '../types/hotel';

interface Props {
  hotels: Hotel[];
  searchParams: SearchParams;
}

function getPriceColor(price: number, min: number, max: number): string {
  const ratio = (price - min) / (max - min || 1);
  if (ratio < 0.33) return '#22c55e'; // green
  if (ratio < 0.66) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function createMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 12px; height: 12px; border-radius: 50%;
      background: ${color}; border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export function MapView({ hotels, searchParams }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || hotels.length === 0) return;

    // Clean up old map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    const prices = hotels.map((h) => h.pricePerNight);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const nights = nightsBetween(searchParams.checkIn, searchParams.checkOut);
    const bounds: L.LatLngExpression[] = [];

    for (const hotel of hotels) {
      const color = getPriceColor(hotel.pricePerNight, minP, maxP);
      const marker = L.marker([hotel.lat, hotel.lng], {
        icon: createMarkerIcon(color),
      }).addTo(map);

      const discount =
        hotel.originalPrice
          ? Math.round(((hotel.originalPrice - hotel.pricePerNight) / hotel.originalPrice) * 100)
          : 0;

      marker.bindPopup(
        `<div style="min-width:200px;font-family:system-ui;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${hotel.name}</div>
          <div style="font-size:12px;opacity:0.7;margin-bottom:6px;">
            ${'★'.repeat(hotel.stars)} &middot; ${hotel.propertyType} &middot; ${hotel.neighborhood}
          </div>
          <div style="font-size:12px;margin-bottom:4px;">
            ${getRatingLabel(hotel.guestRating)} &middot; ${hotel.guestRating.toFixed(1)}/10
          </div>
          <div style="font-size:18px;font-weight:700;color:${color};">
            $${hotel.pricePerNight}<span style="font-size:11px;font-weight:400;opacity:0.7;">/night</span>
            ${discount > 0 ? `<span style="font-size:11px;color:#ef4444;margin-left:6px;">-${discount}%</span>` : ''}
          </div>
          <div style="font-size:11px;opacity:0.7;">$${hotel.pricePerNight * nights} total (${nights} nights)</div>
        </div>`,
        { closeButton: true }
      );

      bounds.push([hotel.lat, hotel.lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hotels, searchParams]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: '400px', border: '1px solid var(--border)' }}
    />
  );
}
