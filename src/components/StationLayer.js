'use client';

import { Marker, Popup } from 'react-leaflet';
import { owlPinIcon } from '../lib/mapIcns';

// Icons are created once, not on every render
const NORMAL_ICON = owlPinIcon(40);
const HIGHLIGHT_ICON = owlPinIcon(58);

// One owl pin per police station. The station with highlightId is drawn larger.
export default function StationLayer({ stations, highlightId }) {
  return (
    <>
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={station.id === highlightId ? HIGHLIGHT_ICON : NORMAL_ICON}
          zIndexOffset={station.id === highlightId ? 1000 : 0}
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
        </Marker>
      ))}
    </>
  );
}
