'use client';

import { Popup, Rectangle } from 'react-leaflet';
import { HOTSPOT_COLOR } from '../lib/constants';
import { labelOf } from '../lib/format';

// One red square per hotspot (a ~250 m grid square with a high weighted crime score)
export default function HotspotLayer({ hotspots, meta }) {
  return (
    <>
      {hotspots.map((hotspot) => (
        <Rectangle
          key={hotspot.id}
          bounds={[
            [hotspot.bounds.south, hotspot.bounds.west],
            [hotspot.bounds.north, hotspot.bounds.east],
          ]}
          pathOptions={{ color: HOTSPOT_COLOR, weight: 1.5, fillColor: HOTSPOT_COLOR, fillOpacity: 0.25 }}
        >
          <Popup>
            Hotspot: {hotspot.crimeCount} reported crimes (weight {hotspot.weight}). Most common:{' '}
            {labelOf(hotspot.topType, meta?.crimeTypes)}.
          </Popup>
        </Rectangle>
      ))}
    </>
  );
}
