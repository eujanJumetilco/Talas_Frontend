'use client';

// A small map for choosing where a report happened: click to place the pin.
// Loaded inside the report dialog with dynamic(..., { ssr: false }).

import MapView from './MapView';
import DraftMarker from './DraftMarker';

export default function LocationPicker({ location, onPick }) {
  return (
    <div className="h-[220px] cursor-crosshair overflow-hidden rounded-[10px] border border-line">
      <MapView onMapClick={onPick}>{location && <DraftMarker location={location} />}</MapView>
    </div>
  );
}
