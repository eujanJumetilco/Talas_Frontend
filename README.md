# Talas Frontend

The web app for **Talas**, a crime-awareness and route-information system for Metro Manila
(CIT 202 Data Structures and Algorithms final project). Built with Next.js (App Router, JavaScript),
Tailwind CSS, Leaflet (`react-leaflet`), `react-leaflet-cluster`, `recharts` and `lucide-react`.

What you can do:

- **Crime Info**: see reported crimes on the map (zoom in to level 13 or closer), hotspot squares and police
  stations; filter by area, crime type, source and date; read statistics by type, hour, weekday, busiest spots
  and source.
- **Route**: enter a start and destination, compare the fastest route with an option that has fewer reported
  crimes nearby, and list police stations near the start.
- **Add Report**: click the map, fill in the type and time, and submit a new crime report.

> **Times are shown in Philippine time (UTC+8).** The backend stores and returns everything in UTC; all
> conversion happens in `src/lib/time.js` (and `manilaInputToUtcIso` in `src/lib/format.js`).

The app never talks to OpenRouteService or the database directly: it only calls the Talas backend.

## Setup

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. Install the packages:

   ```bash
   npm install
   ```

3. Create `.env.local` (copy `.env.example`):

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_USE_MOCKS=false
   ```

   `NEXT_PUBLIC_API_URL` is where the Spring Boot backend runs.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`. The backend must be running at `NEXT_PUBLIC_API_URL` (see the backend's README).
If it is not, the sidebar shows "Could not reach the server. Is the backend running?".

Other commands: `npm run build` (production build), `npm run start` (serve the build), `npm run lint`.

## Mock mode (no backend needed)

Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` and restart `npm run dev`. Every API call then returns sample
data from `src/lib/fixtures.js` after a short delay: about 80 sample crimes, 6 hotspots, 8 sample police
stations, geocoding for "Cubao" and "Recto", and a two-route result. A **Sample data** badge appears in the
header. Mock data is not real and new reports are only kept until the page is reloaded.

Note: `NEXT_PUBLIC_` values are read when the app starts or is built, so restart `npm run dev` after changing them.

## Files

```
src/app/        layout.js (fonts, title), page.js (all shared state), globals.css (colors, Leaflet styles)
src/components/ MapView, MapEvents, CrimeLayer, HotspotLayer, StationLayer, RouteLayer, DraftMarker,
                FilterPanel, StatsPanel, RoutePanel, ReportPanel, Legend
src/lib/        api.js (one function per endpoint), constants.js, format.js, time.js, fixtures.js (mock data)
```

## Notes

- Results are based only on reported-crime data; routes are suggestions, not a guarantee about any place or route.
- Map tiles come from the OpenStreetMap tile server, which is fine for a class demo but not for heavy traffic.
- If a CSS change does not show up while `npm run dev` is running, stop it, delete the `.next` folder and start again.
