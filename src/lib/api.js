// One function per backend endpoint. Components call these instead of using fetch directly.
// With NEXT_PUBLIC_USE_MOCKS=true, the sample data in fixtures.js is returned instead.

import { API_URL, USE_MOCKS } from './constants';
import * as mock from './fixtures';

const FALLBACK_MESSAGE = 'Could not reach the server. Is the backend running?';

// Builds "?a=1&b=2", leaving out empty, null and undefined values
function toQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    search.append(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

// Calls the backend and returns the parsed JSON. Throws an Error with a readable message on failure.
async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, {
      ...options,
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    });
  } catch {
    // The request never reached the server (backend stopped, wrong URL, no network)
    throw new Error(FALLBACK_MESSAGE);
  }

  if (!response.ok) {
    let message = FALLBACK_MESSAGE;
    try {
      const data = await response.json();
      if (data && data.message) message = data.message;
    } catch {
      // The error body was not JSON; keep the fallback message
    }
    throw new Error(message);
  }
  return response.json();
}

// Mock mode: wait 300 ms like a real network call, then return the value
function mockDelay(makeValue) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(makeValue());
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
}

export async function getMeta() {
  if (USE_MOCKS) return mockDelay(() => mock.getMeta());
  return request('/api/meta');
}

export async function getCrimes(params) {
  if (USE_MOCKS) return mockDelay(() => mock.getCrimes(params));
  return request('/api/crimes' + toQuery(params));
}

export async function createCrime(body) {
  if (USE_MOCKS) return mockDelay(() => mock.createCrime(body));
  return request('/api/crimes', { method: 'POST', body: JSON.stringify(body) });
}

export async function getStats(params) {
  if (USE_MOCKS) return mockDelay(() => mock.getStats(params));
  return request('/api/stats' + toQuery(params));
}

export async function getHotspots() {
  if (USE_MOCKS) return mockDelay(() => mock.hotspots);
  return request('/api/hotspots');
}

export async function getStations() {
  if (USE_MOCKS) return mockDelay(() => mock.stations);
  return request('/api/stations');
}

export async function getNearbyStations(lat, lng, radiusKm = 2) {
  if (USE_MOCKS) return mockDelay(() => mock.getNearbyStations(lat, lng, radiusKm));
  return request('/api/stations/nearby' + toQuery({ lat, lng, radiusKm }));
}

export async function geocode(q) {
  if (USE_MOCKS) return mockDelay(() => mock.geocode(q));
  return request('/api/geocode' + toQuery({ q }));
}

export async function findRoutes(body) {
  if (USE_MOCKS) return mockDelay(() => mock.findRoutes(body));
  return request('/api/routes/safe', { method: 'POST', body: JSON.stringify(body) });
}
