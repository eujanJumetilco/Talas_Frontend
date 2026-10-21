// App-wide settings. Change values here, not inside components.

// Where the Spring Boot backend runs, and whether to use the built-in sample data instead
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Map start position (Manila)
export const MAP_CENTER = [14.5995, 120.9842];
export const MAP_ZOOM = 12;

// Individual crimes are only loaded at this zoom or closer
export const MIN_ZOOM_FOR_CRIMES = 13;
export const CRIME_LIMIT = 3000;

// The backend lists at most this many crimes per route
export const MAX_NEARBY_CRIMES = 20;

export const TIME_ZONE = 'Asia/Manila';
// Philippine time is always UTC+8 (no daylight saving time)
export const MANILA_OFFSET_HOURS = 8;

export const METRO_MANILA_BOUNDS = { minLat: 14.35, maxLat: 14.85, minLng: 120.85, maxLng: 121.2 };

// Index 0 = Monday, like the backend's byWeekdayHour rows
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

// One fixed color per crime type (used on the map, in the legend and in the charts)
export const CRIME_TYPE_COLORS = {
  THEFT: '#f59e0b',
  ASSAULT: '#ef4444',
  HOMICIDE: '#7f1d1d',
  WEAPON_VIOLENCE: '#b91c1c',
  GANG_VIOLENCE: '#c2410c',
  SEXUAL_OFFENSE: '#db2777',
  KIDNAPPING: '#9333ea',
  STALKING: '#a855f7',
  VEHICLE_THEFT: '#ca8a04',
  BURGLARY: '#0891b2',
  VANDALISM: '#64748b',
  ARSON: '#ea580c',
  DRUG_RELATED_CRIME: '#16a34a',
  HUMAN_TRAFFICKING: '#4c1d95',
  OTHER: '#6b7280',
};

export const STATION_COLOR = '#2563eb';
export const HOTSPOT_COLOR = '#dc2626';
