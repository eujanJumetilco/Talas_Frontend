'use client';

import { Marker, Tooltip } from 'react-leaflet';
import { owlPinIcon } from '../lib/mapIcons';

const ICON = owlPinIcon(44);

// The spot the user clicked for a new report
export default function DraftMarker({ location }) {
  return (
    <Marker position={[location.lat, location.lng]} icon={ICON}>
      <Tooltip permanent direction="top" className="map-tag">
        New report
      </Tooltip>
    </Marker>
  );
}
