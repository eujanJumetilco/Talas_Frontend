'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MAP_CENTER, MAP_ZOOM } from '../../lib/constants';
import useStations from '../../hooks/useStations';
import { useApp } from '../AppProvider';
import Legend from '../Legend';
import RoutePanel from '../RoutePanel';

// Leaflet needs the browser, so these are never rendered on the server
const MapView = dynamic(() => import('../MapView'), { ssr: false, loading: () => <div className="h-full bg-soft" /> });
const RouteLayer = dynamic(() => import('../RouteLayer'), { ssr: false });
const StationLayer = dynamic(() => import('../StationLayer'), { ssr: false });

export default function RoutePlannerScreen() {
  const { meta, metaError } = useApp();
  const { stations, error: stationsError } = useStations();

  const [view, setView] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [highlightStationId, setHighlightStationId] = useState(null);

  // Route state, filled in by RoutePanel
  const [routeResult, setRouteResult] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

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
    setHighlightStationId(station.id);
    setFlyTo({ lat: station.lat, lng: station.lng, zoom: 16 });
  }

  // The middle of the visible map: where "nearby stations" looks when there is no route yet
  const mapCenter = view
    ? { lat: (view.bounds.minLat + view.bounds.maxLat) / 2, lng: (view.bounds.minLng + view.bounds.maxLng) / 2 }
    : { lat: MAP_CENTER[0], lng: MAP_CENTER[1] };

  return (
    <main className="mx-auto w-[min(1200px,92%)] pt-[110px] pb-14 md:pt-[130px]">
      <div className="page-heading mb-6">
        <p className="eyebrow">Metro Manila awareness</p>
        <h1>
          Plan your <em>route.</em>
        </h1>
        <p>
          Enter a start and destination to see the reported crimes near the road route, and a suggestion with fewer
          reported crimes when one is available.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        <div className="space-y-4">
          {(metaError || stationsError) && <p className="msg-error">{metaError || stationsError}</p>}
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

        <section className="map-shell lg:sticky lg:top-5" aria-label="Route map">
          <div className="relative h-[60vh] min-h-[360px] lg:h-[620px]">
            <MapView onViewChange={setView} flyTo={flyTo}>
              <StationLayer stations={stations} highlightId={highlightStationId} />
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
            </MapView>
            <div className="map-stamp right-4 top-4 rotate-2">
              ROUTE BOARD
              <br />
              <span className="text-[7px] text-white/80">METRO MANILA</span>
            </div>
          </div>
          <Legend meta={meta} />
        </section>
      </div>
    </main>
  );
}
