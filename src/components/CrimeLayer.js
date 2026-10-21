'use client';

import { memo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { formatDateTime, labelOf, typeColor } from '../lib/format';

// One colored dot per crime, grouped into numbered clusters where they are close together.
// interactive=false lets clicks go through to the map (Leaflet only reads it when the layer is created).
function CrimeLayer({ crimes, meta, interactive = true }) {
  return (
    <MarkerClusterGroup chunkedLoading maxClusterRadius={45} showCoverageOnHover={false}>
      {crimes.map((crime) => {
        const color = typeColor(crime.type);
        return (
          <CircleMarker
            key={crime.id}
            interactive={interactive}
            center={[crime.lat, crime.lng]}
            radius={5}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1 }}
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
              <span className="text-muted">Source: {labelOf(crime.source, meta?.sources)}</span>
            </Popup>
          </CircleMarker>
        );
      })}
    </MarkerClusterGroup>
  );
}

// memo: skip re-drawing thousands of markers when only other parts of the page change
export default memo(CrimeLayer);
