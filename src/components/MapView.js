'use client';

// The Leaflet map. Layers are passed in as children by the pages.
// Pages load this file with dynamic(..., { ssr: false }) because Leaflet only works in the browser.

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import {
  MAP_BOUNDS,
  MAP_CENTER,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_ZOOM,
  TILE_LAYERS,
} from '../lib/constants';
import MapEvents, { FlyTo } from './MapEvents';

export default function MapView({ children, onViewChange, onMapClick, flyTo, className = 'h-full w-full' }) {
  return (
    // preferCanvas draws circles on one canvas, which stays fast with thousands of crimes
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      minZoom={MAP_MIN_ZOOM}
      maxZoom={MAP_MAX_ZOOM}
      maxBounds={MAP_BOUNDS}
      maxBoundsViscosity={1}
      preferCanvas
      className={className}
    >
      {TILE_LAYERS.map((layer) => (
        <TileLayer key={layer.url} url={layer.url} attribution={layer.attribution} maxZoom={MAP_MAX_ZOOM} />
      ))}
      <MapEvents onViewChange={onViewChange} onMapClick={onMapClick} />
      <FlyTo target={flyTo} />
      {children}
    </MapContainer>
  );
}
