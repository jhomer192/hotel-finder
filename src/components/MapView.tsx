import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  cityName: string;
  lat: number;
  lng: number;
}

export function MapView({ cityName, lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

    map.setView([lat, lng], 13);

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 16px; height: 16px; border-radius: 50%;
        background: var(--accent, #7aa2f7); border: 3px solid #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -14],
    });

    L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:system-ui;text-align:center;">
          <div style="font-weight:600;font-size:14px;">${cityName}</div>
          <div style="font-size:11px;opacity:0.7;margin-top:2px;">City Center</div>
        </div>`
      );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [cityName, lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: '400px', border: '1px solid var(--border)' }}
    />
  );
}
