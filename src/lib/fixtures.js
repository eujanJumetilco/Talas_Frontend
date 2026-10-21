// SAMPLE DATA for mock mode (NEXT_PUBLIC_USE_MOCKS=true). Not real crimes or real police stations.
// Every shape follows the API contract, so the UI behaves the same as with the real backend.

import { METRO_MANILA_BOUNDS } from './constants';

const CELL_DEG = 0.0025; // same grid size as the backend

// ---------- meta ----------

const crimeTypes = [
  { value: 'THEFT', label: 'Theft', weight: 3 },
  { value: 'ASSAULT', label: 'Assault', weight: 4 },
  { value: 'HOMICIDE', label: 'Homicide', weight: 5 },
  { value: 'WEAPON_VIOLENCE', label: 'Weapon violence', weight: 4 },
  { value: 'GANG_VIOLENCE', label: 'Gang violence', weight: 4 },
  { value: 'SEXUAL_OFFENSE', label: 'Sexual offense', weight: 5 },
  { value: 'KIDNAPPING', label: 'Kidnapping', weight: 5 },
  { value: 'STALKING', label: 'Stalking', weight: 2 },
  { value: 'VEHICLE_THEFT', label: 'Vehicle theft', weight: 2 },
  { value: 'BURGLARY', label: 'Burglary', weight: 3 },
  { value: 'VANDALISM', label: 'Vandalism', weight: 1 },
  { value: 'ARSON', label: 'Arson', weight: 3 },
  { value: 'DRUG_RELATED_CRIME', label: 'Drug-related crime', weight: 3 },
  { value: 'HUMAN_TRAFFICKING', label: 'Human trafficking', weight: 5 },
  { value: 'OTHER', label: 'Other', weight: 1 },
];

const sources = [
  { value: 'POLICE_REPORT', label: 'Police report' },
  { value: 'GOVERNMENT_STATISTICS', label: 'Government statistics' },
  { value: 'VERIFIED_PUBLIC_REPORT', label: 'Verified public report' },
  { value: 'COMMUNITY_REPORT', label: 'Community report' },
  { value: 'OTHER', label: 'Other' },
];

// ---------- crimes (about 80, generated the same way every time) ----------

// A tiny random number generator with a fixed seed, so the sample data never changes
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const places = [
  { lat: 14.6033, lng: 120.9862, address: 'Recto Ave, Sampaloc, Manila' },
  { lat: 14.5987, lng: 120.9837, address: 'Quezon Blvd, Quiapo, Manila' },
  { lat: 14.6045, lng: 120.972, address: 'Divisoria, Tondo, Manila' },
  { lat: 14.618, lng: 120.966, address: 'Tondo, Manila' },
  { lat: 14.5826, lng: 120.984, address: 'Ermita, Manila' },
  { lat: 14.61, lng: 120.989, address: 'España Blvd, Sampaloc, Manila' },
  { lat: 14.6195, lng: 121.053, address: 'Cubao, Quezon City' },
  { lat: 14.6890, lng: 121.087, address: 'Commonwealth Ave, Quezon City' },
  { lat: 14.6366, lng: 121.0334, address: 'Timog Ave, Quezon City' },
  { lat: 14.5547, lng: 121.0244, address: 'Ayala Ave, Makati' },
  { lat: 14.565, lng: 121.03, address: 'Poblacion, Makati' },
  { lat: 14.5378, lng: 121.0014, address: 'Taft Ave, Pasay' },
  { lat: 14.5869, lng: 121.0614, address: 'Ortigas Center, Pasig' },
  { lat: 14.654, lng: 120.984, address: 'Monumento, Caloocan' },
];

// UTC hours with more reports in the Philippine evening (UTC 9 to 14 = 5 PM to 10 PM Philippine time)
const busyUtcHours = [9, 10, 11, 12, 13, 14, 2, 4, 6, 8, 15, 16, 0];

function buildCrimes() {
  const random = seededRandom(20261021);
  const start = Date.UTC(2025, 9, 1); // Oct 1, 2025, 00:00 UTC
  const dayMs = 24 * 60 * 60 * 1000;
  const list = [];
  for (let i = 0; i < 80; i++) {
    const place = places[i % places.length];
    const type = crimeTypes[Math.floor(random() * random() * crimeTypes.length)].value;
    const source = sources[Math.floor(random() * sources.length)].value;
    const day = Math.floor(random() * 365);
    const hour = busyUtcHours[Math.floor(random() * busyUtcHours.length)];
    const minute = Math.floor(random() * 60);
    const time = start + day * dayMs + (hour * 60 + minute) * 60 * 1000;
    list.push({
      id: 1000 + i,
      type,
      source,
      lat: Number((place.lat + (random() - 0.5) * 0.006).toFixed(5)),
      lng: Number((place.lng + (random() - 0.5) * 0.006).toFixed(5)),
      occurredAt: new Date(time).toISOString().replace('.000Z', 'Z'),
      address: i % 9 === 4 ? null : place.address,
    });
  }
  return list;
}

// "let" because createCrime adds to it (in memory only; a page reload resets it)
let crimes = buildCrimes();

export function getMeta() {
  const times = crimes.map((c) => c.occurredAt).sort();
  return {
    crimeTypes,
    sources,
    dateRange: times.length
      ? { earliest: times[0], latest: times[times.length - 1] }
      : { earliest: null, latest: null },
  };
}

// Applies the same filters as the backend: area, type, source, from/to and the bounding box
function filterCrimes(params = {}) {
  const area = (params.area || '').trim().toLowerCase();
  return crimes.filter((c) => {
    if (area && !(c.address && c.address.toLowerCase().includes(area))) return false;
    if (params.type && c.type !== params.type) return false;
    if (params.source && c.source !== params.source) return false;
    if (params.from && c.occurredAt < new Date(params.from).toISOString().replace('.000Z', 'Z')) return false;
    if (params.to && c.occurredAt >= new Date(params.to).toISOString().replace('.000Z', 'Z')) return false;
    if (params.minLat !== undefined && params.minLat !== null) {
      if (c.lat < params.minLat || c.lat > params.maxLat || c.lng < params.minLng || c.lng > params.maxLng) {
        return false;
      }
    }
    return true;
  });
}

export function getCrimes(params = {}) {
  const limit = params.limit || 3000;
  return filterCrimes(params)
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, limit);
}

export function createCrime(body) {
  const { minLat, maxLat, minLng, maxLng } = METRO_MANILA_BOUNDS;
  if (body.lat < minLat || body.lat > maxLat || body.lng < minLng || body.lng > maxLng) {
    throw new Error('Location must be within Metro Manila.');
  }
  const crime = {
    id: Math.max(...crimes.map((c) => c.id)) + 1,
    type: body.type,
    source: body.source || 'OTHER',
    lat: body.lat,
    lng: body.lng,
    occurredAt: new Date(body.occurredAt).toISOString().replace('.000Z', 'Z'),
    address: body.address && body.address.trim() ? body.address.trim() : null,
  };
  crimes = [...crimes, crime];
  return crime;
}

// ---------- stats (counted in UTC, like the backend) ----------

function countAndSort(list, key) {
  const counts = {};
  for (const c of list) counts[c[key]] = (counts[c[key]] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

export function getStats(params = {}) {
  const list = filterCrimes(params);
  const byHour = new Array(24).fill(0);
  const byWeekdayHour = Array.from({ length: 7 }, () => new Array(24).fill(0));
  const squares = {};

  for (const c of list) {
    const time = new Date(c.occurredAt);
    const hour = time.getUTCHours();
    const weekday = (time.getUTCDay() + 6) % 7; // getUTCDay: 0 = Sunday; we want 0 = Monday
    byHour[hour] += 1;
    byWeekdayHour[weekday][hour] += 1;

    const row = Math.floor(c.lat / CELL_DEG);
    const col = Math.floor(c.lng / CELL_DEG);
    const key = `${row},${col}`;
    if (!squares[key]) squares[key] = { row, col, count: 0, addresses: {} };
    squares[key].count += 1;
    if (c.address) squares[key].addresses[c.address] = (squares[key].addresses[c.address] || 0) + 1;
  }

  const busiestSpots = Object.values(squares)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((sq) => {
      const topAddress = Object.entries(sq.addresses).sort((a, b) => b[1] - a[1])[0];
      return {
        lat: Number(((sq.row + 0.5) * CELL_DEG).toFixed(6)),
        lng: Number(((sq.col + 0.5) * CELL_DEG).toFixed(6)),
        crimeCount: sq.count,
        sampleAddress: topAddress ? topAddress[0] : null,
      };
    });

  return {
    total: list.length,
    byType: countAndSort(list, 'type'),
    bySource: countAndSort(list, 'source'),
    byHour,
    byWeekdayHour,
    busiestSpots,
  };
}

// ---------- hotspots (6 grid squares) ----------

function hotspot(row, col, weight, crimeCount, topType) {
  return {
    id: `h-${row}-${col}`,
    weight,
    crimeCount,
    topType,
    bounds: {
      south: Number((row * CELL_DEG).toFixed(4)),
      west: Number((col * CELL_DEG).toFixed(4)),
      north: Number(((row + 1) * CELL_DEG).toFixed(4)),
      east: Number(((col + 1) * CELL_DEG).toFixed(4)),
    },
  };
}

export const hotspots = [
  hotspot(5839, 48393, 36, 11, 'THEFT'),        // Quiapo
  hotspot(5841, 48394, 29, 9, 'ASSAULT'),       // Recto
  hotspot(5841, 48388, 24, 8, 'THEFT'),         // Divisoria
  hotspot(5847, 48421, 21, 7, 'VEHICLE_THEFT'), // Cubao
  hotspot(5821, 48409, 15, 5, 'THEFT'),         // Ayala Ave
  hotspot(5847, 48386, 12, 4, 'DRUG_RELATED_CRIME'), // Tondo
];

// ---------- police stations (8 SAMPLE stations, not real addresses or numbers) ----------

export const stations = [
  { id: 1, address: 'Sample Station 1 (mock data), Quiapo, Manila', contactNumber: '0000-000-0001', lat: 14.5995, lng: 120.9855, distanceKm: null },
  { id: 2, address: 'Sample Station 2 (mock data), Sampaloc, Manila', contactNumber: '0000-000-0002', lat: 14.6085, lng: 120.9925, distanceKm: null },
  { id: 3, address: 'Sample Station 3 (mock data), Tondo, Manila', contactNumber: '0000-000-0003', lat: 14.6150, lng: 120.9700, distanceKm: null },
  { id: 4, address: 'Sample Station 4 (mock data), Ermita, Manila', contactNumber: '0000-000-0004', lat: 14.5840, lng: 120.9810, distanceKm: null },
  { id: 5, address: 'Sample Station 5 (mock data), Cubao, Quezon City', contactNumber: '0000-000-0005', lat: 14.6215, lng: 121.0500, distanceKm: null },
  { id: 6, address: 'Sample Station 6 (mock data), Diliman, Quezon City', contactNumber: '0000-000-0006', lat: 14.6400, lng: 121.0400, distanceKm: null },
  { id: 7, address: 'Sample Station 7 (mock data), Makati', contactNumber: '0000-000-0007', lat: 14.5560, lng: 121.0200, distanceKm: null },
  { id: 8, address: 'Sample Station 8 (mock data), Pasay', contactNumber: '0000-000-0008', lat: 14.5400, lng: 121.0000, distanceKm: null },
];

// Distance in meters between two points (accurate enough for a few kilometers)
function metersBetween(lat1, lng1, lat2, lng2) {
  const dy = (lat2 - lat1) * 110540;
  const dx = (lng2 - lng1) * 111320 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dx * dx + dy * dy);
}

export function getNearbyStations(lat, lng, radiusKm = 2) {
  return stations
    .map((s) => ({ ...s, distanceKm: Number((metersBetween(lat, lng, s.lat, s.lng) / 1000).toFixed(2)) }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// ---------- geocoding ----------

const geocodePlaces = [
  { label: 'Cubao, Quezon City', lat: 14.6195, lng: 121.053 },
  { label: 'Araneta City Bus Port, Cubao, Quezon City', lat: 14.6223, lng: 121.0549 },
  { label: 'Recto Ave, Sampaloc, Manila', lat: 14.6033, lng: 120.9862 },
  { label: 'Quiapo Church, Quiapo, Manila', lat: 14.5986, lng: 120.9838 },
  { label: 'Divisoria, Tondo, Manila', lat: 14.6045, lng: 120.972 },
  { label: 'Ayala Ave, Makati', lat: 14.5547, lng: 121.0244 },
  { label: 'Taft Ave, Pasay', lat: 14.5378, lng: 121.0014 },
];

export function geocode(q) {
  const text = (q || '').trim().toLowerCase();
  if (text.length < 2) throw new Error('q must be at least 2 characters.');
  return geocodePlaces.filter((p) => p.label.toLowerCase().includes(text)).slice(0, 5);
}

// ---------- routes ----------

// A gently curving path of 16 points from a to b. "bend" pushes the middle sideways (in degrees).
function makePath(a, b, bend) {
  const path = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sideways = Math.sin(Math.PI * t) * bend + Math.sin(Math.PI * t * 5) * 0.0008;
    path.push([
      Number((a.lat + (b.lat - a.lat) * t + sideways).toFixed(5)),
      Number((a.lng + (b.lng - a.lng) * t - sideways * 0.5).toFixed(5)),
    ]);
  }
  return path;
}

// Shortest distance in meters from a point to a path (checks every segment)
function distanceToPath(lat, lng, path) {
  let best = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const [lat1, lng1] = path[i];
    const [lat2, lng2] = path[i + 1];
    const cos = Math.cos((lat1 * Math.PI) / 180);
    const px = (lng - lng1) * 111320 * cos;
    const py = (lat - lat1) * 110540;
    const sx = (lng2 - lng1) * 111320 * cos;
    const sy = (lat2 - lat1) * 110540;
    const lengthSq = sx * sx + sy * sy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, (px * sx + py * sy) / lengthSq));
    best = Math.min(best, Math.hypot(px - t * sx, py - t * sy));
  }
  return best;
}

function pathLengthKm(path) {
  let meters = 0;
  for (let i = 0; i < path.length - 1; i++) {
    meters += metersBetween(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
  }
  return meters / 1000;
}

function buildRoute(label, path, bufferMeters, metersPerMinute) {
  const nearby = crimes
    .map((c) => ({ ...c, distanceM: Math.round(distanceToPath(c.lat, c.lng, path)) }))
    .filter((c) => c.distanceM <= bufferMeters)
    .sort((a, b) => a.distanceM - b.distanceM);
  const riskScore = nearby.reduce((sum, c) => sum + crimeTypes.find((t) => t.value === c.type).weight, 0);
  const distanceKm = Number((pathLengthKm(path) * 1.25).toFixed(1)); // roads are longer than straight lines
  return {
    label,
    path,
    distanceKm,
    durationMin: Math.round((distanceKm * 1000) / metersPerMinute),
    riskScore,
    nearbyCrimes: nearby.slice(0, 20).map(({ id, type, lat, lng, occurredAt, address, distanceM }) => ({
      id, type, lat, lng, occurredAt, address, distanceM,
    })),
  };
}

export function findRoutes(body) {
  const { origin, destination } = body;
  const buffer = body.bufferMeters || 150;
  const metersPerMinute = body.mode === 'foot-walking' ? 80 : 400;
  const { minLat, maxLat, minLng, maxLng } = METRO_MANILA_BOUNDS;
  for (const p of [origin, destination]) {
    if (p.lat < minLat || p.lat > maxLat || p.lng < minLng || p.lng > maxLng) {
      throw new Error('Locations must be within Metro Manila.');
    }
  }

  const fastest = buildRoute('Fastest route', makePath(origin, destination, 0.0015), buffer, metersPerMinute);
  const notice = 'Suggestions only. Reported-crime data does not guarantee that any route is free of risk.';
  if (fastest.nearbyCrimes.length === 0) {
    return { routes: [fastest], recommendedIndex: 0, warnings: [], notice };
  }

  // Unlike the backend, mock mode always returns a second route so the two-route display can be tried out.
  // The recommended route is still the one with the lower score (ties: the shorter one).
  const other = buildRoute('Alternative route', makePath(origin, destination, 0.012), buffer, metersPerMinute);
  const routes = [fastest, other];
  const otherIsBetter = other.riskScore < fastest.riskScore
    || (other.riskScore === fastest.riskScore && other.distanceKm < fastest.distanceKm);

  return {
    routes,
    recommendedIndex: otherIsBetter ? 1 : 0,
    warnings: [`${fastest.riskScore} weighted reported-crime points lie within ${buffer} m of the fastest route.`],
    notice,
  };
}
