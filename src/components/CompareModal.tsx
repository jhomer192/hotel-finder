import type { Hotel, SearchParams, Amenity } from '../types/hotel';
import { getRatingLabel, nightsBetween } from '../types/hotel';
import { getPhotoUrl } from '../data/photos';
import { mockProvider } from '../providers/mock';

const ALL_AMENITIES: Amenity[] = [
  'WiFi', 'Pool', 'Gym', 'Parking', 'Breakfast', 'Spa',
  'Pet-friendly', 'Restaurant', 'Bar', 'Room Service',
  'Airport Shuttle', 'Beach Access',
];

interface Props {
  hotels: Hotel[];
  searchParams: SearchParams;
  onClose: () => void;
  onRemove: (hotel: Hotel) => void;
}

export function CompareModal({ hotels, searchParams, onClose, onRemove }: Props) {
  const nights = nightsBetween(searchParams.checkIn, searchParams.checkOut);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-xl overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Compare Hotels
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            X
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th
                  className="text-left p-4 w-36"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}
                />
                {hotels.map((h) => (
                  <th
                    key={h.id}
                    className="p-4 text-center min-w-[200px]"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div className="relative">
                      <button
                        onClick={() => onRemove(h)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer"
                        style={{ background: 'var(--danger)', color: '#fff' }}
                      >
                        X
                      </button>
                      <img
                        src={getPhotoUrl(h.photoId, 200, 120)}
                        alt={h.name}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {h.name}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Price/night">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center">
                    <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                      ${h.pricePerNight}
                    </span>
                    {h.originalPrice && (
                      <span className="ml-1 text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                        ${h.originalPrice}
                      </span>
                    )}
                  </td>
                ))}
              </Row>
              <Row label="Total price">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    ${h.pricePerNight * nights}
                  </td>
                ))}
              </Row>
              <Row label="Stars">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center" style={{ color: 'var(--warning)' }}>
                    {'★'.repeat(h.stars)}
                  </td>
                ))}
              </Row>
              <Row label="Guest Rating">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center">
                    <span className="font-bold" style={{ color: 'var(--badge-text)' }}>
                      {h.guestRating.toFixed(1)}
                    </span>
                    <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                      {getRatingLabel(h.guestRating)}
                    </span>
                  </td>
                ))}
              </Row>
              <Row label="Type">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    {h.propertyType}
                  </td>
                ))}
              </Row>
              <Row label="Neighborhood">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    {h.neighborhood}
                  </td>
                ))}
              </Row>
              <Row label="Distance">
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    {h.distanceToCenter} km
                  </td>
                ))}
              </Row>
              {ALL_AMENITIES.map((amenity) => (
                <Row key={amenity} label={amenity}>
                  {hotels.map((h) => (
                    <td key={h.id} className="p-3 text-center text-base">
                      {h.amenities.includes(amenity) ? (
                        <span style={{ color: 'var(--success)' }}>Yes</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                  ))}
                </Row>
              ))}
              <tr>
                <td className="p-3" />
                {hotels.map((h) => (
                  <td key={h.id} className="p-3 text-center">
                    <a
                      href={mockProvider.getBookingUrl(h, searchParams)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 rounded-lg text-sm font-semibold no-underline"
                      style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
                    >
                      Book Now
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td className="p-3 font-medium text-xs" style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
        {label}
      </td>
      {children}
    </tr>
  );
}
