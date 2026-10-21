'use client';

import { CircleMarker, Popup } from 'react-leaflet';
import { STATION_COLOR } from '../lib/constants';

// One blue dot per police station. The station with highlightId is drawn larger.
// interactive=false lets clicks go through to the map (Leaflet only reads it when the layer is created).
export default function StationLayer({ stations, highlightId, interactive = true }) {
  return (
    <>
      {stations.map((station) => (
        <CircleMarker
          key={station.id}
          interactive={interactive}
          center={[station.lat, station.lng]}
          radius={station.id === highlightId ? 12 : 7}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: STATION_COLOR, fillOpacity: 1 }}
        >
          <Popup>
            <strong>Police station</strong>
            <br />
            {station.address}
            {station.contactNumber && (
              <>
                <br />
                {station.contactNumber}
              </>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
