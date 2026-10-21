'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { CRIME_TYPE_COLORS, HOTSPOT_COLOR, STATION_COLOR } from '../lib/constants';
import { typeColor } from '../lib/format';

// Collapsible key over the map's bottom-left corner.
// page.js loads it with ssr: false, so "window" is available when the state starts.
export default function Legend({ meta }) {
  // Collapsed by default on small screens (under 800 px wide)
  const [open, setOpen] = useState(() => !window.matchMedia('(max-width: 799px)').matches);

  // Before /api/meta arrives, fall back to the enum names from the color table
  const types = meta?.crimeTypes ?? Object.keys(CRIME_TYPE_COLORS).map((value) => ({ value, label: value }));

  return (
    <div className="absolute bottom-6 left-3 z-[1000] w-52 overflow-hidden rounded-xl border border-white/10 bg-ink/95 text-white shadow-xl backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-extrabold tracking-[0.14em] uppercase"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Layers size={14} className="text-cyan" /> Legend
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {open && (
        <div className="max-h-[45vh] space-y-3 overflow-y-auto px-3 pb-3 text-xs">
          <ul className="space-y-1">
            {types.map((type) => (
              <li key={type.value} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: typeColor(type.value) }} />
                {type.label}
              </li>
            ))}
          </ul>
          <ul className="space-y-1.5 border-t border-white/10 pt-2">
            <li className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 border"
                style={{ borderColor: HOTSPOT_COLOR, backgroundColor: 'rgba(220, 38, 38, 0.35)' }}
              />
              Hotspot (about 250 m square)
            </li>
            <li className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full border-2 border-white"
                style={{ backgroundColor: STATION_COLOR }}
              />
              Police station
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
