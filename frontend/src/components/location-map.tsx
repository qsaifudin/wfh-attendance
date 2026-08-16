'use client';

import { MapPin } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  label?: string;
}

/** A compact "Open in Maps" link plus an inline OpenStreetMap embed — no API
 * key, no library, no billing account, just an iframe. Shared by the admin
 * detail view and the employee's own clock-in card so both render location
 * proof the same way. */
export function LocationMap({ latitude, longitude, label = 'Location' }: LocationMapProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-secondary">{label}</span>
        <a
          href={`https://www.google.com/maps?q=${latitude},${longitude}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-brand-accent-on-light hover:underline"
        >
          <MapPin className="h-3.5 w-3.5" /> Open in Maps
        </a>
      </div>
      <iframe
        title="Clock-in location"
        className="h-40 w-full rounded-lg border border-border"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&marker=${latitude}%2C${longitude}`}
      />
    </div>
  );
}
