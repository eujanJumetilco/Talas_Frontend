'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { CRIME_LIMIT, MIN_ZOOM_FOR_CRIMES } from '../../lib/constants';
import { EMPTY_FILTERS } from '../../lib/filters';
import { formatNumber } from '../../lib/format';
import useCrimesInView from '../../hooks/useCrimesInView';
import useHotspots from '../../hooks/useHotspots';
import useStations from '../../hooks/useStations';
import { useApp } from '../AppProvider';
import FilterPanel from '../FilterPanel';
import Legend from '../Legend';

// Leaflet needs the browser (it uses "window"), so these are never rendered on the server
const MapView = dynamic(() => import('../MapView'), { ssr: false, loading: () => <div className="h-full bg-soft" /> });
const CrimeLayer = dynamic(() => import('../CrimeLayer'), { ssr: false });
const HotspotLayer = dynamic(() => import('../HotspotLayer'), { ssr: false });
const StationLayer = dynamic(() => import('../StationLayer'), { ssr: false });

// A small on/off switch for one map layer
function LayerToggle({ label, checked, onChange, swatch }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        checked ? 'border-deep/40 bg-white text-ink' : 'border-line text-muted'
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: checked ? swatch : 'transparent', boxShadow: `0 0 0 1.5px ${swatch}` }} />
      {label}
    </label>
  );
}

// Reads ?lat=..&lng=.. (the insights page links here) as a place to zoom to
function startingTarget(params) {
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  if (!params.get('lat') || !params.get('lng') || Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng, zoom: 16 };
}

export default function CrimeMapScreen() {
  const { meta, metaError, reportVersion } = useApp();
  const searchParams = useSearchParams();

  const [view, setView] = useState(null); // { bounds, zoom }, updated after every map move
  const [flyTo] = useState(() => startingTarget(searchParams));
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [showCrimes, setShowCrimes] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showStations, setShowStations] = useState(true);

  const { hotspots, loading: hotspotsLoading, error: hotspotsError } = useHotspots(reportVersion);
  const { stations, error: stationsError } = useStations();
  const { crimes, loading: crimesLoading, error: crimesError } = useCrimesInView({
    view,
    filters: appliedFilters,
    reloadKey: reportVersion,
  });

  const zoomedIn = view !== null && view.zoom >= MIN_ZOOM_FOR_CRIMES;
  const error = metaError || hotspotsError || stationsError || crimesError;

  return (
    <main className="mx-auto w-[min(1200px,92%)] pt-[110px] pb-14 md:pt-[130px]">
      <div className="page-heading mb-6">
        <p className="eyebrow">Metro Manila awareness</p>
        <h1>Metro Manila crime map</h1>
        <p>Explore reported incidents and nearby police stations.</p>
      </div>

      <FilterPanel meta={meta} busy={false} onSearch={setAppliedFilters} onReset={() => setAppliedFilters(EMPTY_FILTERS)} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <LayerToggle label="Crimes" checked={showCrimes} onChange={setShowCrimes} swatch="#eeb33e" />
        <LayerToggle label="Hotspots" checked={showHotspots} onChange={setShowHotspots} swatch="#dc2626" />
        <LayerToggle label="Stations" checked={showStations} onChange={setShowStations} swatch="#2878d0" />
        {(hotspotsLoading || crimesLoading) && (
          <span className="flex items-center gap-2 text-xs font-semibold text-muted" role="status">
            <LoaderCircle size={14} className="animate-spin text-deep" /> Loading…
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2 empty:hidden" aria-live="polite">
        {error && <p className="msg-error">{error}</p>}
        {!zoomedIn && view && (
          <p className="text-xs text-muted">Zoom in to see individual crimes. Hotspots are shown for the whole map.</p>
        )}
        {zoomedIn && crimes.length === CRIME_LIMIT && (
          <p className="msg-warning">
            Showing the {formatNumber(CRIME_LIMIT)} most recent crimes in this view. Zoom in or narrow the filters to
            see more.
          </p>
        )}
      </div>

      <section className="map-shell mt-3" aria-label="Crime and police station map">
        <div className="h-[62vh] min-h-[360px] md:h-[min(70vh,720px)] md:min-h-[420px]">
          <MapView onViewChange={setView} flyTo={flyTo}>
            {showHotspots && <HotspotLayer hotspots={hotspots} meta={meta} />}
            {showCrimes && zoomedIn && <CrimeLayer crimes={crimes} meta={meta} />}
            {showStations && <StationLayer stations={stations} />}
          </MapView>
        </div>
        <Legend meta={meta} />
      </section>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Hotspots are about 250 m grid squares with the highest weighted counts of reported crimes. A higher count does
        not mean a place is worse; it can also reflect how much gets reported there.
      </p>
    </main>
  );
}
