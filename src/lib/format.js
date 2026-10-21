// Small helpers for showing values to the user.

import { CRIME_TYPE_COLORS, TIME_ZONE } from './constants';

const dateTimeFormat = new Intl.DateTimeFormat('en-PH', {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
});
const dateFormat = new Intl.DateTimeFormat('en-PH', { timeZone: TIME_ZONE, dateStyle: 'medium' });
const numberFormat = new Intl.NumberFormat('en-PH');

export function typeColor(type) {
  return CRIME_TYPE_COLORS[type] || '#6b7280';
}

// A UTC timestamp shown in Philippine time, e.g. "Sep 14, 2026, 9:30 PM"
export function formatDateTime(iso) {
  return dateTimeFormat.format(new Date(iso));
}

// A Philippine calendar date "2026-01-31" shown as "Jan 31, 2026"
export function formatManilaDate(dateStr) {
  return dateFormat.format(new Date(`${dateStr}T00:00:00+08:00`));
}

// 3000 -> "3,000"
export function formatNumber(n) {
  return numberFormat.format(n);
}

// Finds the label for an enum value in a [{ value, label }] list from /api/meta
export function labelOf(value, list) {
  const item = (list || []).find((entry) => entry.value === value);
  return item ? item.label : value;
}

// 0 -> "12 AM", 13 -> "1 PM"
export function hourLabel(h) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${suffix}`;
}

// A datetime-local value in Philippine time ("2026-10-19T21:30") -> UTC ISO string
export function manilaInputToUtcIso(value) {
  return new Date(value + ':00+08:00').toISOString();
}
