'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChartColumn, LoaderCircle, MessageSquarePlus, Route as RouteIcon } from 'lucide-react';
import { getCrimes, getHotspots, getMeta, getStations, getStats } from '../lib/api';
import { CRIME_LIMIT, MAP_CENTER, MAP_ZOOM, MIN_ZOOM_FOR_CRIMES, USE_MOCKS } from '../lib/constants';
import { formatNumber } from '../lib/format';
import { manilaDayEndExclusiveUtc, manilaDayStartUtc } from '../lib/time';
import FilterPanel, { EMPTY_FILTERS } from '../components/FilterPanel';
import StatsPanel from '../components/StatsPanel';
import RoutePanel from '../components/RoutePanel';
import ReportPanel from '../components/ReportPanel';

// Leaflet needs the browser (it uses "window"), so these are never rendered on the server
const MapView = dynamic(() => import('../components/MapView'), { ssr: false });
const CrimeLayer = dynamic(() => import('../components/CrimeLayer'), { ssr: false });
const HotspotLayer = dynamic(() => import('../components/HotspotLayer'), { ssr: false });
const StationLayer = dynamic(() => import('../components/StationLayer'), { ssr: false });
const RouteLayer = dynamic(() => import('../components/RouteLayer'), { ssr: false });
const DraftMarker = dynamic(() => import('../components/DraftMarker'), { ssr: false });
const Legend = dynamic(() => import('../components/Legend'), { ssr: false });

const TABS = [
  { id: 'crime', label: 'Crime Info', icon: ChartColumn },
  { id: 'route', label: 'Route', icon: RouteIcon },
  { id: 'report', label: 'Add Report', icon: MessageSquarePlus },
];

// Turns the applied filter form into backend query params.
// The form keeps Philippine dates (YYYY-MM-DD); the backend wants UTC timestamps.
function toFilterParams(filters) {
  return {
    area: filters.area.trim(),
    type: filters.type,
    source: filters.source,
    from: filters.fromDate ? manilaDayStartUtc(filters.fromDate) : '',
    to: filters.toDate ? manilaDayEndExclusiveUtc(filters.toDate) : '',
  };
}

// Small switch used for the three layer toggles in the header
function LayerToggle({ label, checked, onChange, swatch }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
        checked ? 'border-cyan/50 bg-white/10 text-white' : 'border-white/15 text-white/50'
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: checked ? swatch : 'transparent', boxShadow: `0 0 0 1px ${swatch}` }} />
      {label}
    </label>
  );
}

export default function Home() {
  const [tab, setTab] = useState('crime');

  // Data from the backend
  const [meta, setMeta] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [stations, setStations] = useState([]);
  const [crimes, setCrimes] = useState([]);
  const [stats, setStats] = useState(null);

  // Loading and error states
  const [initialLoading, setInitialLoading] = useState(true);
  const [crimesLoading, setCrimesLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  // Map state
  const [view, setView] = useState(null); // { bounds, zoom }, updated after every map move
  const [flyTo, setFlyTo] = useState(null);
  const [showCrimes, setShowCrimes] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [highlightStationId, setHighlightStationId] = useState(null);

  // Filters: only change when Search or Reset is clicked. bounds is set when "Only the current map view" was ticked.
  const [appliedFilters, setAppliedFilters] = useState({ ...EMPTY_FILTERS, bounds: null });
  // Increase this number to load the crimes in view again (used after adding a report)
  const [crimesReloadKey, setCrimesReloadKey] = useState(0);
  // Counts crime requests, so an old response that arrives late can be ignored
  const crimeRequestRef = useRef(0);

  // Route state
  const [routeResult, setRouteResult] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  // Add Report state
  const [draftLocation, setDraftLocation] = useState(null);

  // First load: dropdown data, hotspots and stations together, and the unfiltered statistics
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [metaData, hotspotData, stationData] = await Promise.all([getMeta(), getHotspots(), getStations()]);
        setMeta(metaData);
        setHotspots(hotspotData);
        setStations(stationData);
      } catch (e) {
        setError(e.message);
      } finally {
        setInitialLoading(false);
      }
    }
    async function loadInitialStats() {
      try {
        setStats(await getStats({}));
      } catch (e) {
        setStatsError(e.message);
      } finally {
        setStatsLoading(false);
      }
    }
    loadInitialData();
    loadInitialStats();
  }, []);

  // Crimes in view: only when zoomed in far enough, and only after the map has been still for 400 ms
  useEffect(() => {
    if (!view || view.zoom < MIN_ZOOM_FOR_CRIMES) return;

    const timer = setTimeout(async () => {
      const requestId = ++crimeRequestRef.current;
      setCrimesLoading(true);
      try {
        const data = await getCrimes({ ...toFilterParams(appliedFilters), ...view.bounds, limit: CRIME_LIMIT });
        // A newer request was started while this one was running: drop this result
        if (requestId !== crimeRequestRef.current) return;
        setCrimes(data);
        setError(null);
      } catch (e) {
        if (requestId === crimeRequestRef.current) setError(e.message);
      } finally {
        if (requestId === crimeRequestRef.current) setCrimesLoading(false);
      }
    }, 400);

    // The map moved again before 400 ms passed: cancel this request
    return () => clearTimeout(timer);
  }, [view, appliedFilters, crimesReloadKey]);

  async function loadStats(filters) {
    setStatsLoading(true);
    setStatsError(null);
    try {
      setStats(await getStats({ ...toFilterParams(filters), ...(filters.bounds ?? {}) }));
    } catch (e) {
      setStatsError(e.message);
    } finally {
      setStatsLoading(false);
    }
  }

  // Search: apply the form. The crimes effect above reloads by itself because appliedFilters changed.
  function handleSearch(form) {
    const filters = { ...form, bounds: form.onlyView && view ? view.bounds : null };
    setAppliedFilters(filters);
    loadStats(filters);
  }

  function handleReset() {
    const filters = { ...EMPTY_FILTERS, bounds: null };
    setAppliedFilters(filters);
    loadStats(filters);
  }

  // Refetch everything that a new report changes: hotspots, the crimes in view and the statistics
  async function reloadData() {
    setCrimesReloadKey((key) => key + 1);
    loadStats(appliedFilters);
    try {
      setHotspots(await getHotspots());
    } catch (e) {
      setError(e.message);
    }
  }

  // Map clicks only matter on the Add Report tab
  function handleMapClick(point) {
    if (tab === 'report') setDraftLocation(point);
  }

  function handleRouteFound({ result, origin: start, destination: end }) {
    setRouteResult(result);
    setSelectedRouteIndex(result.recommendedIndex);
    setOrigin(start);
    setDestination(end);
  }

  function clearRoute() {
    setRouteResult(null);
    setOrigin(null);
    setDestination(null);
    setFlyTo({ lat: MAP_CENTER[0], lng: MAP_CENTER[1], zoom: MAP_ZOOM });
  }

  function showStation(station) {
    setShowStations(true);
    setHighlightStationId(station.id);
    setFlyTo({ lat: station.lat, lng: station.lng, zoom: 16 });
  }

  const zoomedIn = view !== null && view.zoom >= MIN_ZOOM_FOR_CRIMES;
  const layersInteractive = tab !== 'report';
  const mapCenter = view
    ? { lat: (view.bounds.minLat + view.bounds.maxLat) / 2, lng: (view.bounds.minLng + view.bounds.maxLng) / 2 }
    : { lat: MAP_CENTER[0], lng: MAP_CENTER[1] };

  return (
    <div className="wide:grid wide:h-screen wide:grid-cols-[400px_1fr]">
      {/* ---------- Sidebar ---------- */}
      <aside className="flex flex-col border-line bg-paper wide:h-screen wide:overflow-hidden wide:border-r">
        <header className="relative overflow-hidden bg-ink px-5 pt-5 text-white">
          {/* Soft glow behind the wordmark, like the homepage hero */}
          <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl leading-none font-bold italic">
                Talas<span className="text-cyan">.</span>
              </h1>
              <p className="mt-1.5 text-[10px] font-extrabold tracking-[0.2em] text-white/60 uppercase">
                Reported-crime map · Metro Manila
              </p>
            </div>
            {USE_MOCKS && (
              <span className="rounded-full border border-cyan/40 px-2 py-0.5 text-[10px] font-bold text-cyan">
                Sample data
              </span>
            )}
          </div>

          <div className="relative mt-4 flex flex-wrap gap-1.5">
            <LayerToggle label="Crimes" checked={showCrimes} onChange={setShowCrimes} swatch="#f59e0b" />
            <LayerToggle label="Hotspots" checked={showHotspots} onChange={setShowHotspots} swatch="#dc2626" />
            <LayerToggle label="Stations" checked={showStations} onChange={setShowStations} swatch="#2563eb" />
          </div>

          <nav className="relative mt-4 flex" aria-label="Sidebar sections">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pt-1 pb-3 text-xs font-bold transition ${
                  tab === id ? 'border-cyan text-white' : 'border-transparent text-white/55 hover:text-white'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 space-y-4 px-4 py-4 wide:overflow-y-auto">
          {initialLoading && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <LoaderCircle size={16} className="animate-spin" /> Loading map data…
            </p>
          )}
          {error && <p className="msg-error">{error}</p>}

          {/* Crime Info and Route stay mounted (just hidden) so their form values survive tab switches */}
          <div hidden={tab !== 'crime'} className="space-y-4">
            {!zoomedIn && (
              <p className="rounded-lg bg-ink/5 px-3 py-2 text-xs text-muted">
                Zoom in to see individual crimes. Hotspots are shown for the whole map.
              </p>
            )}
            {zoomedIn && crimes.length === CRIME_LIMIT && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Showing the {formatNumber(CRIME_LIMIT)} most recent crimes in this view. Zoom in or narrow the
                filters to see more.
              </p>
            )}
            <FilterPanel meta={meta} onSearch={handleSearch} onReset={handleReset} busy={statsLoading} />
            <StatsPanel
              stats={stats}
              meta={meta}
              filters={appliedFilters}
              loading={statsLoading}
              error={statsError}
              onFlyTo={setFlyTo}
            />
          </div>

          <div hidden={tab !== 'route'}>
            <RoutePanel
              meta={meta}
              routeResult={routeResult}
              selectedRouteIndex={selectedRouteIndex}
              onSelectRoute={setSelectedRouteIndex}
              onRouteFound={handleRouteFound}
              onClearRoute={clearRoute}
              origin={origin}
              mapCenter={mapCenter}
              onShowStation={showStation}
            />
          </div>

          {/* Only rendered while open, so its "latest allowed time" is always fresh */}
          {tab === 'report' && (
            <ReportPanel
              meta={meta}
              draftLocation={draftLocation}
              onClearDraft={() => setDraftLocation(null)}
              onReportAdded={reloadData}
            />
          )}
        </div>

        <footer className="border-t border-line bg-white px-4 py-3 text-[11px] leading-snug text-muted">
          Based on reported-crime data. Times shown in Philippine time. Not a guarantee about any place or route.
        </footer>
      </aside>

      {/* ---------- Map ---------- */}
      <main className={`relative h-[60vh] wide:h-screen ${tab === 'report' ? 'placing-report cursor-crosshair' : ''}`}>
        <MapView onViewChange={setView} onMapClick={handleMapClick} flyTo={flyTo}>
          {/* On the Add Report tab, data layers ignore clicks so every click places the report.
              The key changes with the tab, so the layers are re-created with the new setting. */}
          {showHotspots && (
            <HotspotLayer key={`hotspots-${layersInteractive}`} hotspots={hotspots} meta={meta} interactive={layersInteractive} />
          )}
          {showCrimes && zoomedIn && (
            <CrimeLayer key={`crimes-${layersInteractive}`} crimes={crimes} meta={meta} interactive={layersInteractive} />
          )}
          {showStations && (
            <StationLayer
              key={`stations-${layersInteractive}`}
              stations={stations}
              highlightId={highlightStationId}
              interactive={layersInteractive}
            />
          )}
          {routeResult && (
            <RouteLayer
              result={routeResult}
              selectedIndex={selectedRouteIndex}
              onSelect={setSelectedRouteIndex}
              origin={origin}
              destination={destination}
              meta={meta}
            />
          )}
          {tab === 'report' && draftLocation && <DraftMarker location={draftLocation} />}
        </MapView>

        <Legend meta={meta} />

        {crimesLoading && (
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <LoaderCircle size={14} className="animate-spin text-cyan" /> Loading crimes…
          </div>
        )}
        {tab === 'report' && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            Click the map to place the report
          </div>
        )}
      </main>
    </div>
  );
}
