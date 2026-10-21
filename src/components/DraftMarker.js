'use client';

import { CircleMarker, Tooltip } from 'react-leaflet';

// The spot the user clicked for a new report
export default function DraftMarker({ location }) {
  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      radius={9}
      pathOptions={{ color: '#000000', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
    >
      <Tooltip permanent direction="top" offset={[0, -9]} className="map-tag">
        New report
      </Tooltip>
    </CircleMarker>
  );
}
