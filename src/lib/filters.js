// The filter form and how it becomes backend query params.

import { manilaDayEndExclusiveUtc, manilaDayStartUtc } from './time';

export const EMPTY_FILTERS = { area: '', type: '', source: '', fromDate: '', toDate: '' };

// Turns the applied filter form into backend query params.
// The form keeps Philippine dates (YYYY-MM-DD); the backend wants UTC timestamps.
export function toFilterParams(filters) {
  return {
    area: filters.area.trim(),
    type: filters.type,
    source: filters.source,
    from: filters.fromDate ? manilaDayStartUtc(filters.fromDate) : '',
    to: filters.toDate ? manilaDayEndExclusiveUtc(filters.toDate) : '',
  };
}
