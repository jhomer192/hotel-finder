import type { BookingSource } from '../types/hotel';
import { SourceCard } from './SourceCard';

interface Props {
  sources: Array<{ source: BookingSource; url: string }>;
  cityName: string;
}

export function SourcesGrid({ sources, cityName }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map(({ source, url }) => (
        <SourceCard
          key={source.id}
          source={source}
          url={url}
          cityName={cityName}
        />
      ))}
    </div>
  );
}
