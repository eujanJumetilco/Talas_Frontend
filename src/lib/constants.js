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

// Map look from the design: a muted dark-gray basemap with a labels layer on top (Esri tiles).
// To switch back to plain OpenStreetMap tiles, use one entry:
// { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' }
const ESRI_TILES = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas';
export const TILE_LAYERS = [
  {
    url: `${ESRI_TILES}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    attribution: 'Tiles &copy; Esri, HERE, Garmin; data &copy; OpenStreetMap contributors',
  },
  { url: `${ESRI_TILES}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, attribution: '' },
];

// The map cannot be panned or zoomed outside Metro Manila (these Esri tiles stop at zoom 16)
export const MAP_BOUNDS = [
  [14.3, 120.88],
  [14.82, 121.22],
];
export const MAP_MIN_ZOOM = 10;
export const MAP_MAX_ZOOM = 16;

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

export const STATION_COLOR = '#2878d0';
export const HOTSPOT_COLOR = '#dc2626';

// Colors for the route lines and charts (from the design palette)
export const ROUTE_COLORS = { recommended: '#328e82', selected: '#2369ff', other: '#9fb4c9' };
export const CHART_COLORS = { bar: '#a9d1f7', peak: '#2d679f' };

// Where each page lives (used by the header, the footer and the home page cards)
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/crime-map', label: 'Crime map' },
  { href: '/route-planner', label: 'Route planner' },
  { href: '/insights', label: 'Insights' },
];

// Shown on every page (required wording: reported data only, never a promise)
export const DATA_NOTE =
  'Based on reported-crime data. Times shown in Philippine time. Not a guarantee about any place or route.';
