# Talas Frontend

The web app for **Talas**, a crime-awareness and route-information system for Metro Manila
(CIT 202 Data Structures and Algorithms final project). Built with Next.js (App Router, JavaScript),
Tailwind CSS, Leaflet (`react-leaflet`), `react-leaflet-cluster`, `recharts` and `lucide-react`.

Pages (the look follows the `TalasFrontendDesign` prototype):

- **Home** (`/`): landing page with links to the other pages and the "Report an incident" call to action.
- **Crime map** (`/crime-map`): reported crimes on the map (zoom in to level 13 or closer), hotspot squares and
  police stations; filter by area, crime type, source and date.
- **Route planner** (`/route-planner`): enter a start and destination, compare the fastest route with an option
  that has fewer reported crimes nearby, and list police stations near the start.
- **Insights** (`/insights`): statistics by type, hour of day, day of week, busiest spots and source, for the
  same filters.
- **Report an incident**: a pop-up (header button, available on every page). Click the small map to mark the
  place, fill in the type and time, and submit.

> **Times are shown in Philippine time (UTC+8).** The backend stores and returns everything in UTC; all
> conversion happens in `src/lib/time.js` (and `manilaInputToUtcIso` in `src/lib/format.js`).

The app never talks to OpenRouteService or the database directly: it only calls the Talas backend.

## Setup

1. Install [Node.js](https://nodejs.org) 20.9 or newer.
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
If it is not, the page shows "Could not reach the server. Is the backend running?".

Other commands: `npm run build` (production build), `npm run start` (serve the build), `npm run lint`.

## Mock mode (no backend needed)

Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` and restart `npm run dev`. Every API call then returns sample
data from `src/lib/fixtures.js` after a short delay: about 80 sample crimes, 6 hotspots, 8 sample police
stations, geocoding for "Cubao" and "Recto", and a two-route result. A **Sample data** badge appears in the
footer. Mock data is not real and new reports are only kept until the page is reloaded.

Note: `NEXT_PUBLIC_` values are read when the app starts or is built, so restart `npm run dev` after changing them.

## Deploy

The app is a standard Next.js app: any host that runs Node.js 20.9 or newer works. [Vercel](https://vercel.com)
is the simplest because it needs no extra setup.

### Before you deploy

1. `npm run build` and `npm run lint` pass locally.
2. All changes are committed and pushed (the host builds what is in the repository, not your working folder).
3. Pick what the deployed site talks to:
   - **The real backend.** The backend must be reachable on a public **`https://`** address. Browsers block an
     `https://` site from calling an `http://` API. Note that the backend has no login (see its README), so
     anyone who finds its URL can add reports and use up the routing provider's free quota.
   - **Sample data only.** Set `NEXT_PUBLIC_USE_MOCKS=true`. No backend is needed. This is the safest choice
     for a public demo link.

### Environment variables

Set these in the host's dashboard (not in a committed file):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The backend's public address, for example `https://talas-api.example.com` (no `/api` at the end) |
| `NEXT_PUBLIC_USE_MOCKS` | `false` for the real backend, `true` for sample data |

`NEXT_PUBLIC_` values are built into the site's JavaScript, so **redeploy after changing them**. A production
build stops with an error if `NEXT_PUBLIC_API_URL` is missing and mock mode is off, so a missing value cannot
quietly ship a site that calls `localhost`.

### Vercel

1. Push the repository to GitHub.
2. On vercel.com, choose **Add New → Project** and import the repository. The framework (Next.js), build command
   and output are detected automatically. If the repository holds more than this folder, set **Root Directory**
   to `talas-frontend`.
3. Add the environment variables above, then click **Deploy**.
4. Copy the site's address (for example `https://talas.vercel.app`) and set it as the backend's `ALLOWED_ORIGIN`,
   then restart the backend. Use the exact address: `https://`, no trailing `/`. Otherwise the browser blocks
   every request with a CORS error and the site shows "Could not reach the server".

### Other Node.js hosts (Render, Railway and similar)

- Build command: `npm ci && npm run build`
- Start command: `npm run start` (listens on the `PORT` the host provides, or 3000)
- Set the same environment variables **before the build runs**, then set the backend's `ALLOWED_ORIGIN` as in
  step 4 above.

### After deploying, check

- The home page, `/crime-map`, `/route-planner` and `/insights` load, and an unknown address shows the
  "Page not found" page.
- The crime map shows hotspots and stations. If it shows "Could not reach the server", open the browser's
  developer console. A CORS error means `ALLOWED_ORIGIN` is wrong; a "mixed content" error means the backend
  URL is `http://`.
- In mock mode, the footer shows the **Sample data** badge.

## Files

```
src/app/                 layout.js (fonts, header, footer), globals.css (design tokens, shared classes),
                         page.js (home), crime-map/, route-planner/, insights/ (each page.js is a thin wrapper),
                         error.js (shown if a page crashes), not-found.js (404 page)
next.config.mjs          security headers, the build-time check for NEXT_PUBLIC_API_URL, Tailwind loader
src/components/screens/  CrimeMapScreen, RoutePlannerScreen, InsightsScreen (the state of each page)
src/components/layout/   SiteHeader, SiteFooter, BrandMark, ReportButton
src/components/          AppProvider (meta + report dialog), ReportDialog, LocationPicker, FilterPanel,
                         StatsPanel, RoutePanel, Legend, and the Leaflet pieces (MapView, MapEvents,
                         CrimeLayer, HotspotLayer, StationLayer, RouteLayer, DraftMarker)
src/hooks/               useCrimesInView, useHotspots, useStations, useStats (data loading)
src/lib/                 api.js (one function per endpoint, the only file that calls the backend),
                         constants.js, filters.js, format.js, time.js, mapIcons.js, fixtures.js (mock data)
```

To connect or change the backend, only `src/lib/api.js` (and `NEXT_PUBLIC_API_URL`) needs to change.

## Notes

- Results are based only on reported-crime data; routes are suggestions, not a guarantee about any place or route.
- Map tiles are the Esri dark-gray basemap from the design (`TILE_LAYERS` in `src/lib/constants.js`; a comment there
  shows how to switch to OpenStreetMap tiles). Both are fine for a class demo but not for heavy traffic.
- If a CSS change does not show up while `npm run dev` is running, stop it, delete the `.next` folder and start again.
