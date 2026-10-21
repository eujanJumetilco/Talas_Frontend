'use client';

import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

// Reads the visible area and zoom level in the shape page.js uses
function readView(map) {
  const bounds = map.getBounds();
  return {
    bounds: {
      minLat: bounds.getSouth(),
      minLng: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLng: bounds.getEast(),
    },
    zoom: map.getZoom(),
  };
}

// Tells page.js when the map moves (or is clicked)
export default function MapEvents({ onViewChange, onMapClick }) {
  const map = useMapEvents({
    moveend: () => onViewChange(readView(map)),
    click: (event) => onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });

  // Report the starting view once, when the map first appears
  useEffect(() => {
    onViewChange(readView(map));
  }, [map, onViewChange]);

  return null;
}

// Moves the map smoothly to { lat, lng, zoom } whenever the target changes
export function FlyTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom);
  }, [map, target]);

  return null;
}
