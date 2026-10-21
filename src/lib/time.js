// All conversion between UTC (what the backend uses) and Philippine time (what the user sees) lives here.
// Philippine time is always exactly UTC+8 because the Philippines has no daylight saving time.

import { MANILA_OFFSET_HOURS, TIME_ZONE } from './constants';

const HOUR_MS = 60 * 60 * 1000;

// Start of a Philippine calendar day, as a UTC timestamp. Used for the "from" filter.
// "2026-01-01" -> "2025-12-31T16:00:00.000Z"
export function manilaDayStartUtc(dateStr) {
  return new Date(`${dateStr}T00:00:00+08:00`).toISOString();
}

// Start of the NEXT Philippine day, as a UTC timestamp. Used for the "to" filter, which the
// backend treats as exclusive, so the whole picked day is included.
export function manilaDayEndExclusiveUtc(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+08:00`);
  return new Date(start.getTime() + 24 * HOUR_MS).toISOString();
}

// The Philippine calendar date (YYYY-MM-DD) of a UTC timestamp. Used for the date pickers' min/max.
// The "en-CA" locale happens to format dates as YYYY-MM-DD.
export function utcToManilaDateStr(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(iso));
}

// The current Philippine date and time in the format a datetime-local input uses: "YYYY-MM-DDTHH:mm".
// Shifting the clock by +8 hours and reading it as UTC gives the Philippine wall-clock time.
export function nowManilaInputValue() {
  return new Date(Date.now() + MANILA_OFFSET_HOURS * HOUR_MS).toISOString().slice(0, 16);
}

// Shifts 24 UTC hour counts to Philippine hours.
export function toManilaHours(byHourUtc) {
  // A crime at UTC hour h happened at Philippine hour (h + 8) mod 24.
  const local = new Array(24).fill(0);
  for (let h = 0; h < 24; h++) {
    local[(h + MANILA_OFFSET_HOURS) % 24] += byHourUtc[h];
  }
  return local;
}

// Turns the 7 x 24 UTC table (row 0 = Monday) into 7 Philippine weekday totals (index 0 = Monday).
export function toManilaWeekdays(byWeekdayHourUtc) {
  // Number the 168 hours of the week from Monday 00:00 (UTC), shift by 8 hours,
  // and wrap around at the end of the week. A late-Sunday UTC hour becomes early Monday.
  const local = new Array(7).fill(0);
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const hourOfWeek = (d * 24 + h + MANILA_OFFSET_HOURS) % 168;
      local[Math.floor(hourOfWeek / 24)] += byWeekdayHourUtc[d][h];
    }
  }
  return local;
}
