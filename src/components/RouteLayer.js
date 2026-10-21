'use client';

import { useEffect } from 'react';
import { CircleMarker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { formatDateTime, labelOf, typeColor } from '../lib/format';

// Zooms the map so every route fits on screen whenever a new result arrives
function FitToRoutes({ routes }) {
  const map = useMap();

  useEffect(() => {
    const points = routes.flatMap((route) => route.path);
    if (points.length === 0) return;
    // On wide maps, keep the routes clear of the legend in the bottom-left corner
    const leftPadding = map.getSize().x > 700 ? 240 : 40;
    // No animation: two quick calls (React runs effects twice in development) could otherwise
    // leave Leaflet's zoom animation half-finished, with missing map tiles
    map.fitBounds(points, { paddingTopLeft: [leftPadding, 40], paddingBottomRight: [40, 40], animate: false });
  }, [map, routes]);

  return null;
}

// A start or end point: a dark dot with a label that is always visible
function EndPoint({ point, label }) {
  return (
    <CircleMarker
      center={[point.lat, point.lng]}
      radius={8}
      pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#071426', fillOpacity: 1 }}
    >
      <Tooltip permanent direction="top" offset={[0, -8]} className="map-tag">
        {label}
      </Tooltip>
    </CircleMarker>
  );
}

export default function RouteLayer({ result, selectedIndex, onSelect, origin, destination, meta }) {
  const selected = result.routes[selectedIndex];
  const selectedColor = selectedIndex === result.recommendedIndex ? '#16a34a' : '#2563eb';

  return (
    <>
      <FitToRoutes routes={result.routes} />

      {/* Routes that are not selected: gray and dashed */}
      {result.routes.map((route, index) =>
        index === selectedIndex ? null : (
          <Polyline
            key={`other-${index}`}
            positions={route.path}
            pathOptions={{ color: '#6b7280', weight: 4, dashArray: '8 8' }}
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
            pathOptions={{ color: '#000000', weight: 1.5, fillColor: typeColor(crime.type), fillOpacity: 0.9 }}
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
