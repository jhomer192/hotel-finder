import type { Hotel, SearchParams } from '../types/hotel';
import { getRatingLabel, nightsBetween } from '../types/hotel';
import { getPhotoUrl } from '../data/photos';
import { mockProvider } from '../providers/mock';

interface Props {
  hotel: Hotel;
  searchParams: SearchParams;
  isComparing: boolean;
  onToggleCompare: (hotel: Hotel) => void;
  canCompare: boolean;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-sm" style={{ color: 'var(--warning)' }}>
      {'★'.repeat(count)}
      {'☆'.repeat(5 - count)}
    </span>
  );
}

function Badge({ type, discount }: { type: string; discount?: number }) {
  const styles: Record<string, React.CSSProperties> = {
    'Best Value': { background: 'var(--success)', color: '#000' },
    Popular: { background: 'var(--accent-secondary)', color: '#000' },
    discount: { background: 'var(--danger)', color: '#fff' },
  };
  const label =
    type === 'discount' && discount ? `-${discount}%` : type;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={styles[type] || {}}
    >
      {label}
    </span>
  );
}

export function HotelCard({
  hotel,
  searchParams,
  isComparing,
  onToggleCompare,
  canCompare,
}: Props) {
  const nights = nightsBetween(searchParams.checkIn, searchParams.checkOut);
  const totalPrice = hotel.pricePerNight * nights;
  const discount = hotel.originalPrice
    ? Math.round(((hotel.originalPrice - hotel.pricePerNight) / hotel.originalPrice) * 100)
    : undefined;
  const bookingUrl = mockProvider.getBookingUrl(hotel, searchParams);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: 'var(--bg-secondary)',
        border: isComparing ? '2px solid var(--accent)' : '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getPhotoUrl(hotel.photoId)}
          alt={hotel.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Badges */}
        {hotel.badges.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1.5">
            {hotel.badges.map((b) => (
              <Badge
                key={b}
                type={b}
                discount={b === 'discount' ? discount : undefined}
              />
            ))}
          </div>
        )}
        {/* Compare checkbox */}
        <button
          onClick={() => onToggleCompare(hotel)}
          disabled={!canCompare && !isComparing}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
          style={{
            background: isComparing ? 'var(--accent)' : 'rgba(0,0,0,0.5)',
            color: isComparing ? 'var(--bg-primary)' : '#fff',
          }}
          title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
        >
          {isComparing ? '✓' : '+'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3
              className="font-semibold text-base truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {hotel.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars count={hotel.stars} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {hotel.propertyType}
              </span>
            </div>
          </div>
          {/* Rating */}
          <div className="text-right shrink-0">
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold"
              style={{
                background: 'var(--badge-bg)',
                color: 'var(--badge-text)',
              }}
            >
              {hotel.guestRating.toFixed(1)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {getRatingLabel(hotel.guestRating)}
            </div>
          </div>
        </div>

        {/* Location */}
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          {hotel.neighborhood} &middot; {hotel.distanceToCenter} km from center
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hotel.amenities.slice(0, 5).map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
            >
              {a}
            </span>
          ))}
          {hotel.amenities.length > 5 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
              }}
            >
              +{hotel.amenities.length - 5}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {hotel.originalPrice && (
              <span
                className="text-sm line-through mr-2"
                style={{ color: 'var(--text-muted)' }}
              >
                ${hotel.originalPrice}
              </span>
            )}
            <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              ${hotel.pricePerNight}
            </span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
              /night
            </span>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              ${totalPrice} total ({nights} {nights === 1 ? 'night' : 'nights'})
            </div>
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors no-underline"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
}
