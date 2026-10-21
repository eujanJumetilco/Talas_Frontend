'use client';

import { useState } from 'react';
import { Building2, LoaderCircle, Navigation, TriangleAlert, X } from 'lucide-react';
import { findRoutes, geocode, getNearbyStations } from '../lib/api';
import { MAX_NEARBY_CRIMES } from '../lib/constants';
import { formatDateTime, labelOf, typeColor } from '../lib/format';

// A list of radio buttons so the user can pick one of several places found for a search text
function PlaceChoice({ title, options, chosen, onChoose }) {
  return (
    <fieldset className="rounded-lg border border-line bg-paper p-3">
      <legend className="px-1 text-xs font-bold">{title}: pick one</legend>
      {options.map((place) => (
        <label key={`${place.lat},${place.lng}`} className="flex items-start gap-2 py-1 text-sm">
          <input
            type="radio"
            className="mt-1 accent-brand"
            checked={chosen === place}
            onChange={() => onChoose(place)}
          />
          {place.label}
        </label>
      ))}
    </fieldset>
  );
}

export default function RoutePanel({
  meta,
  routeResult,
  selectedRouteIndex,
  onSelectRoute,
  onRouteFound,
  onClearRoute,
  origin,
  mapCenter,
  onShowStation,
}) {
  const [startText, setStartText] = useState('');
  const [destText, setDestText] = useState('');
  const [mode, setMode] = useState('driving-car');
  const [buffer, setBuffer] = useState(150);

  // Geocoding results when a search text matched several places
  const [startOptions, setStartOptions] = useState(null);
  const [destOptions, setDestOptions] = useState(null);
  const [startPlace, setStartPlace] = useState(null);
  const [destPlace, setDestPlace] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  // The buffer that was used for the current result (the select may have changed since)
  const [usedBuffer, setUsedBuffer] = useState(150);

  const [nearbyStations, setNearbyStations] = useState(null);
  const [stationsBusy, setStationsBusy] = useState(false);
  const [stationsError, setStationsError] = useState(null);

  // Step 2: both places are known, so ask the backend for routes
  async function runRoute(start, dest) {
    setBusy(true);
    setError(null);
    try {
      const body = {
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: dest.lat, lng: dest.lng },
        mode,
        bufferMeters: buffer,
      };
      const result = await findRoutes(body);
      setUsedBuffer(buffer);
      onRouteFound({ result, origin: body.origin, destination: body.destination });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Step 1: turn both texts into places. Only runs when the button is clicked (or Enter is pressed).
  async function handleFind(event) {
    event.preventDefault();
    if (busy) return; // prevent double submits
    if (startText.trim().length < 2 || destText.trim().length < 2) {
      setError('Enter a start and a destination (at least 2 characters each).');
      return;
    }
    setBusy(true);
    setError(null);
    setStartOptions(null);
    setDestOptions(null);
    setStartPlace(null);
    setDestPlace(null);
    try {
      const [startResults, destResults] = await Promise.all([geocode(startText.trim()), geocode(destText.trim())]);
      if (startResults.length === 0) throw new Error(`No places found for '${startText.trim()}'.`);
      if (destResults.length === 0) throw new Error(`No places found for '${destText.trim()}'.`);

      // Exactly one match: use it. Several: let the user pick.
      const start = startResults.length === 1 ? startResults[0] : null;
      const dest = destResults.length === 1 ? destResults[0] : null;
      setStartPlace(start);
      setDestPlace(dest);
      if (!start) setStartOptions(startResults);
      if (!dest) setDestOptions(destResults);

      setBusy(false);
      if (start && dest) await runRoute(start, dest);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  // When the user picks a place from a list, find the route as soon as both places are chosen
  function chooseStart(place) {
    setStartPlace(place);
    if (destPlace) runRoute(place, destPlace);
  }
  function chooseDest(place) {
    setDestPlace(place);
    if (startPlace) runRoute(startPlace, place);
  }

  function handleClear() {
    setStartOptions(null);
    setDestOptions(null);
    setStartPlace(null);
    setDestPlace(null);
    setError(null);
    onClearRoute();
  }

  // Police stations within 2 km of the start point (or of the map center if there is no route yet)
  async function showNearbyStations() {
    const point = origin ?? mapCenter;
    if (!point) return;
    setStationsBusy(true);
    setStationsError(null);
    try {
      setNearbyStations(await getNearbyStations(point.lat, point.lng, 2));
    } catch (e) {
      setStationsError(e.message);
    } finally {
      setStationsBusy(false);
    }
  }

  const routes = routeResult?.routes ?? [];
  const selected = routes[selectedRouteIndex];

  return (
    <div className="space-y-4">
      <form onSubmit={handleFind} className="card space-y-3">
        <p className="eyebrow">Plan a route</p>
        <div>
          <label htmlFor="start" className="field-label">Start</label>
          <input
            id="start"
            className="input"
            placeholder="e.g. Cubao"
            value={startText}
            onChange={(e) => {
              setStartText(e.target.value);
              setStartOptions(null);
              setStartPlace(null);
            }}
          />
        </div>
        <div>
          <label htmlFor="destination" className="field-label">Destination</label>
          <input
            id="destination"
            className="input"
            placeholder="e.g. Recto"
            value={destText}
            onChange={(e) => {
              setDestText(e.target.value);
              setDestOptions(null);
              setDestPlace(null);
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="mode" className="field-label">Travel mode</label>
            <select id="mode" className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="driving-car">Driving</option>
              <option value="foot-walking">Walking</option>
            </select>
          </div>
          <div>
            <label htmlFor="buffer" className="field-label">Check crimes within</label>
            <select id="buffer" className="input" value={buffer} onChange={(e) => setBuffer(Number(e.target.value))}>
              <option value={100}>100 m</option>
              <option value={150}>150 m</option>
              <option value={250}>250 m</option>
            </select>
          </div>
        </div>

        {startOptions && <PlaceChoice title="Start" options={startOptions} chosen={startPlace} onChoose={chooseStart} />}
        {destOptions && <PlaceChoice title="Destination" options={destOptions} chosen={destPlace} onChoose={chooseDest} />}

        {error && <p className="msg-error">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1" disabled={busy}>
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Navigation size={16} />}
            {busy ? 'Finding route...' : 'Find Route'}
          </button>
          {routeResult && (
            <button type="button" className="btn-ghost" onClick={handleClear}>
              <X size={16} /> Clear route
            </button>
          )}
        </div>
      </form>

      {routeResult && (
        <div className="space-y-3">
          {/* One card per route; clicking a card selects that route */}
          {routes.map((route, index) => {
            const isSelected = index === selectedRouteIndex;
            const isRecommended = index === routeResult.recommendedIndex;
            const count = route.nearbyCrimes.length;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectRoute(index)}
                className={`card w-full text-left transition ${
                  isSelected ? (isRecommended ? 'border-green-600 ring-2 ring-green-600/20' : 'border-brand ring-2 ring-brand/20') : 'hover:border-brand/40'
                }`}
              >
                <p className="font-bold">
                  {route.label}
                  {isRecommended && <span className="ml-1 text-green-700">(recommended)</span>}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {route.distanceKm} km · {route.durationMin} min
                </p>
                <p className="mt-2 text-sm">
                  Reported-crime score: <strong>{route.riskScore}</strong>
                </p>
                <p className="text-sm">
                  {count >= MAX_NEARBY_CRIMES ? `${MAX_NEARBY_CRIMES}+` : count} reported crimes within {usedBuffer} m
                </p>
              </button>
            );
          })}

          {routeResult.warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {routeResult.warnings.map((warning) => (
                <li key={warning} className="flex gap-2">
                  <TriangleAlert size={15} className="mt-0.5 shrink-0" /> {warning}
                </li>
              ))}
            </ul>
          )}

          {routes[0].nearbyCrimes.length === 0 && (
            <p className="text-sm">No reported crimes found near this route.</p>
          )}

          {selected && selected.nearbyCrimes.length > 0 && (
            <div className="card">
              <p className="eyebrow mb-2">Reported crimes near this route</p>
              <ul className="divide-y divide-line text-sm">
                {selected.nearbyCrimes.map((crime) => (
                  <li key={crime.id} className="flex gap-2 py-2">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: typeColor(crime.type) }} />
                    <span className="flex-1">
                      <strong>{labelOf(crime.type, meta?.crimeTypes)}</strong> · {formatDateTime(crime.occurredAt)}
                      {crime.address && <span className="block text-muted">{crime.address}</span>}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums">{crime.distanceM} m</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted">{routeResult.notice}</p>
        </div>
      )}

      <div className="card space-y-2">
        <p className="eyebrow">Police stations</p>
        <button type="button" className="btn-ghost w-full" onClick={showNearbyStations} disabled={stationsBusy}>
          {stationsBusy ? <LoaderCircle size={16} className="animate-spin" /> : <Building2 size={16} />}
          Show nearby police stations
        </button>
        <p className="text-xs text-muted">Within 2 km of {origin ? 'the route start' : 'the map center'}.</p>
        {stationsError && <p className="msg-error">{stationsError}</p>}
        {nearbyStations && nearbyStations.length === 0 && (
          <p className="text-sm text-muted">No police stations found within 2 km.</p>
        )}
        {nearbyStations && nearbyStations.length > 0 && (
          <ul className="divide-y divide-line">
            {nearbyStations.map((station) => (
              <li key={station.id}>
                <button
                  type="button"
                  onClick={() => onShowStation(station)}
                  className="w-full py-2 text-left text-sm hover:text-brand"
                >
                  <strong>{station.address}</strong>
                  <span className="block text-muted">
                    {station.contactNumber ?? 'No contact number'} · {station.distanceKm} km
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
