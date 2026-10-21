'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MapPin } from 'lucide-react';
import { WEEKDAY_LABELS } from '../lib/constants';
import { formatManilaDate, formatNumber, hourLabel, labelOf, typeColor } from '../lib/format';
import { toManilaHours, toManilaWeekdays } from '../lib/time';

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BAR_COLOR = '#9db8ff';
const PEAK_COLOR = '#0b3bb8';
const AXIS_TICK = { fontSize: 11, fill: '#5a6b82' };

// Index of the largest number in a list
function indexOfMax(numbers) {
  let best = 0;
  numbers.forEach((n, i) => {
    if (n > numbers[best]) best = i;
  });
  return best;
}

// The parts after the count in the heading, e.g. area "Tondo" · Jan 1, 2026 to Sep 30, 2026 · current map view
function describeFilters(filters, meta) {
  const parts = [];
  if (filters.area.trim()) parts.push(`area "${filters.area.trim()}"`);
  if (filters.type) parts.push(labelOf(filters.type, meta?.crimeTypes));
  if (filters.source) parts.push(labelOf(filters.source, meta?.sources));
  if (filters.fromDate && filters.toDate) {
    parts.push(`${formatManilaDate(filters.fromDate)} to ${formatManilaDate(filters.toDate)}`);
  } else if (filters.fromDate) {
    parts.push(`from ${formatManilaDate(filters.fromDate)}`);
  } else if (filters.toDate) {
    parts.push(`until ${formatManilaDate(filters.toDate)}`);
  }
  if (filters.bounds) parts.push('current map view');
  return parts;
}

function ChartTitle({ children }) {
  return <h3 className="mb-1 text-xs font-bold text-ink">{children}</h3>;
}

export default function StatsPanel({ stats, meta, filters, loading, error, onFlyTo }) {
  if (error) return <p className="msg-error">{error}</p>;
  if (!stats) return loading ? <p className="text-sm text-muted">Loading statistics…</p> : null;

  const filterParts = describeFilters(filters, meta);
  const heading = (
    <div className={loading ? 'opacity-50' : ''}>
      <p className="eyebrow">What is shown</p>
      <p className="mt-2 leading-snug">
        <span className="font-display text-3xl font-bold text-ink italic">{formatNumber(stats.total)}</span>{' '}
        <span className="font-semibold">reported crimes</span>
        {filterParts.length > 0 && <span className="text-muted"> · {filterParts.join(' · ')}</span>}
      </p>
    </div>
  );

  if (stats.total === 0) {
    return (
      <div className="card space-y-2">
        {heading}
        <p className="text-sm text-muted">No reported crimes match these filters.</p>
      </div>
    );
  }

  // What: one bar per crime type, in the type's map color
  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    type,
    label: labelOf(type, meta?.crimeTypes),
    count,
  }));

  // When: the backend counts in UTC, so convert to Philippine time before charting
  const hours = toManilaHours(stats.byHour);
  const weekdays = toManilaWeekdays(stats.byWeekdayHour);
  const hourData = hours.map((count, h) => ({ label: hourLabel(h), count }));
  const weekdayData = weekdays.map((count, d) => ({ label: WEEKDAY_LABELS[d], count }));
  const peakHour = indexOfMax(hours);
  const peakDay = indexOfMax(weekdays);

  return (
    <div className={`space-y-4 transition-opacity ${loading ? 'opacity-50' : ''}`}>
      <div className="card">{heading}</div>

      <section className="card">
        <p className="eyebrow mb-3">What</p>
        <ChartTitle>By crime type</ChartTitle>
        <ResponsiveContainer width="100%" height={Math.max(180, typeData.length * 28)}>
          <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
            <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
            <YAxis type="category" dataKey="label" width={118} tick={AXIS_TICK} interval={0} />
            <Tooltip cursor={{ fill: 'rgba(35,105,255,0.06)' }} />
            <Bar dataKey="count" name="Reported crimes" radius={[0, 4, 4, 0]}>
              {typeData.map((entry) => (
                <Cell key={entry.type} fill={typeColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="card space-y-4">
        <p className="eyebrow">When</p>
        <div>
          <ChartTitle>By hour of day (Philippine time)</ChartTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="label" tick={AXIS_TICK} interval={5} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} />
              <Tooltip cursor={{ fill: 'rgba(35,105,255,0.06)' }} />
              <Bar dataKey="count" name="Reported crimes" radius={[3, 3, 0, 0]}>
                {hourData.map((entry, h) => (
                  <Cell key={entry.label} fill={h === peakHour ? PEAK_COLOR : BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <ChartTitle>By day of week (Philippine time)</ChartTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekdayData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="label" tick={AXIS_TICK} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} />
              <Tooltip cursor={{ fill: 'rgba(35,105,255,0.06)' }} />
              <Bar dataKey="count" name="Reported crimes" radius={[3, 3, 0, 0]}>
                {weekdayData.map((entry, d) => (
                  <Cell key={entry.label} fill={d === peakDay ? PEAK_COLOR : BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm">
          Most reports: around <strong>{hourLabel(peakHour)}</strong>, on <strong>{WEEKDAY_NAMES[peakDay]}s</strong>.
        </p>
      </section>

      <section className="card">
        <p className="eyebrow mb-2">Where</p>
        <ChartTitle>Busiest spots</ChartTitle>
        <ul className="divide-y divide-line">
          {stats.busiestSpots.map((spot) => (
            <li key={`${spot.lat},${spot.lng}`}>
              <button
                type="button"
                onClick={() => onFlyTo({ lat: spot.lat, lng: spot.lng, zoom: 16 })}
                className="flex w-full items-start gap-2 py-2 text-left text-sm hover:text-brand"
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <strong>{spot.crimeCount}</strong> reported crimes near{' '}
                  {spot.sampleAddress ?? `(${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)})`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <p className="eyebrow mb-2">Sources</p>
        <ul className="space-y-1.5 text-sm">
          {Object.entries(stats.bySource).map(([source, count]) => (
            <li key={source} className="flex items-center gap-2">
              <span className="flex-1">{labelOf(source, meta?.sources)}</span>
              <span
                className="h-1.5 rounded-full bg-brand/70"
                style={{ width: `${Math.max(4, (count / stats.total) * 90)}px` }}
              />
              <span className="w-12 text-right font-bold tabular-nums">{formatNumber(count)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
