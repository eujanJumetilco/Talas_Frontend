'use client';

// The Leaflet map. Layers are passed in as children by page.js.
// page.js loads this file with dynamic(..., { ssr: false }) because Leaflet only works in the browser.

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_CENTER, MAP_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '../lib/constants';
import MapEvents, { FlyTo } from './MapEvents';

export default function MapView({ children, onViewChange, onMapClick, flyTo }) {
  return (
    // preferCanvas draws circles on one canvas, which stays fast with thousands of crimes
    <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} preferCanvas className="h-full w-full">
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <MapEvents onViewChange={onViewChange} onMapClick={onMapClick} />
      <FlyTo target={flyTo} />
      {children}
    </MapContainer>
  );
}
