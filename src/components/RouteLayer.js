'use client';

import { useEffect } from 'react';
import { CircleMarker, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { ROUTE_COLORS } from '../lib/constants';
import { formatDateTime, labelOf, typeColor } from '../lib/format';
import { owlPinIcon } from '../lib/mapIcons';

// Zooms the map so every route fits on screen whenever a new result arrives
function FitToRoutes({ routes }) {
  const map = useMap();

  useEffect(() => {
    const points = routes.flatMap((route) => route.path);
    if (points.length === 0) return;
    // No animation: two quick calls (React runs effects twice in development) could otherwise
    // leave Leaflet's zoom animation half-finished, with missing map tiles
    map.fitBounds(points, { padding: [40, 40], animate: false });
  }, [map, routes]);

  return null;
}

const END_ICON = owlPinIcon(44);

// A start or end point: an owl pin with a label that is always visible
function EndPoint({ point, label }) {
  return (
    <Marker position={[point.lat, point.lng]} icon={END_ICON}>
      <Tooltip permanent direction="top" className="map-tag">
        {label}
      </Tooltip>
    </Marker>
  );
}

export default function RouteLayer({ result, selectedIndex, onSelect, origin, destination, meta }) {
  const selected = result.routes[selectedIndex];
  const selectedColor = selectedIndex === result.recommendedIndex ? ROUTE_COLORS.recommended : ROUTE_COLORS.selected;

  return (
    <>
      <FitToRoutes routes={result.routes} />

      {/* Routes that are not selected: gray and dashed */}
      {result.routes.map((route, index) =>
        index === selectedIndex ? null : (
          <Polyline
            key={`other-${index}`}
            positions={route.path}
            pathOptions={{ color: ROUTE_COLORS.other, weight: 4, dashArray: '8 8' }}
            eventHandlers={{ click: () => onSelect(index) }}
          />
        ),
      )}

      {/* The selected route is drawn last so it sits on top. A new key re-creates it when the selection changes. */}
      {selected && (
        <Polyline
          key={`selected-${selectedIndex}`}
          positions={selected.path}
          pathOptions={{ color: selectedColor, weight: 6, opacity: 0.9 }}
        />
      )}

      {/* Reported crimes near the selected route */}
      {selected &&
        selected.nearbyCrimes.map((crime) => (
          <CircleMarker
            key={crime.id}
            center={[crime.lat, crime.lng]}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: typeColor(crime.type), fillOpacity: 0.95 }}
          >
            <Popup>
              <strong>{labelOf(crime.type, meta?.crimeTypes)}</strong>
              <br />
              {formatDateTime(crime.occurredAt)}
              {crime.address && (
                <>
                  <br />
                  {crime.address}
                </>
              )}
              <br />
              {crime.distanceM} m from the route
            </Popup>
          </CircleMarker>
        ))}

      {origin && <EndPoint point={origin} label="Start" />}
      {destination && <EndPoint point={destination} label="End" />}
    </>
  );
}
