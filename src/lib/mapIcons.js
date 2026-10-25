// The owl pin from the design, as a Leaflet icon. Only import this from map components
// (they are loaded with ssr: false, because Leaflet needs the browser).

import L from 'leaflet';

const OWL_PIN_URL = '/images/talas-owl-pin.svg';
const POLICE_PIN_URL = '/images/talas-owl-pnp.svg';

// The artwork is 48 x 58, so the width is 83% of the height. The tip of the pin is the anchor.
export function owlPinIcon(height = 46) {
  const width = Math.round(height * 0.83);
  return L.icon({
    iconUrl: OWL_PIN_URL,
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 2],
    popupAnchor: [0, -height + 6],
    tooltipAnchor: [0, -height + 6],
  });
}

export function owlPolicePinIcon(height = 46) {
  const width = Math.round(height * 0.83);
  return L.icon({
    iconUrl: POLICE_PIN_URL,
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 2],
    popupAnchor: [0, -height + 6],
    tooltipAnchor: [0, -height + 6],
  });
}
