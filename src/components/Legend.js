import { CRIME_TYPE_COLORS, HOTSPOT_COLOR } from '../lib/constants';
import { typeColor } from '../lib/format';

// The key under a map: one dot per crime type, the hotspot square and the police station pin
export default function Legend({ meta }) {
  // Before /api/meta arrives, fall back to the enum names from the color table
  const types = meta?.crimeTypes ?? Object.keys(CRIME_TYPE_COLORS).map((value) => ({ value, label: value }));

  return (
    <div
      aria-label="Map legend"
      className="flex flex-wrap gap-x-5 gap-y-2.5 border-t border-line bg-[#f2f8ff] px-4 py-3.5 text-[12px] text-subtle"
    >
      {types.map((type) => (
        <span key={type.value} className="inline-flex items-center gap-1.5">
          <i className="h-[11px] w-[11px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(23,53,83,0.25)]" style={{ backgroundColor: typeColor(type.value) }} />
          {type.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <i className="h-[11px] w-[11px] border" style={{ borderColor: HOTSPOT_COLOR, backgroundColor: 'rgba(220, 38, 38, 0.3)' }} />
        Hotspot (about 250 m square)
      </span>
      <span className="inline-flex items-center gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/talas-owl-pnp.svg" alt="" className="h-4 w-[13px]" />
        Police station
      </span>
    </div>
  );
}
