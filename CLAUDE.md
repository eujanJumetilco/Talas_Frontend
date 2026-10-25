# Talas Frontend: Build Instructions for Claude Code

Save this file as `CLAUDE.md` in the root of the `talas-frontend` project, then tell Claude Code:

> Read CLAUDE.md fully, then execute phases F1 to F10 in order. Stop and ask me only for the things listed under "When to stop and ask".

> **Design update (2026-10-25):** the UI now follows the `TalasFrontendDesign` prototype. The single-page sidebar
> described below was split into pages (`/`, `/crime-map`, `/route-planner`, `/insights`) plus a "Report an
> incident" dialog; state moved from `page.js` into per-page screens in `src/components/screens/` and small hooks in
> `src/hooks/`. The API contract (section 4), time rules, wording rules and `src/lib/api.js` are unchanged. Other
> differences: Esri dark-gray tiles instead of OSM, owl-pin markers for stations, start/end and the report spot, and
> the "Only the current map view" filter was dropped (the map already loads the visible area). See README.md for the
> current file layout.

---

## 1. Project context

**Talas** is a school project (2nd-year IT students, course "Data Structures and Algorithms"). It is a crime-awareness and route-information system for Metro Manila. This repository is the **frontend only**. A separate Spring Boot backend (`talas-backend`, default `http://localhost:8080`) serves all data as JSON using the contract in section 4.

The frontend:
1. Draws a Leaflet map of Metro Manila with crimes, hotspots and police stations.
2. Lets users filter by area (address search), crime type, source and date range, and see **how many, what type, where and when** crimes are reported.
3. Lets users enter a start and destination, then shows routes, the reported crimes near each route, and warnings.
4. Lets users **add a new crime report** by clicking a spot on the map and filling in a short form.
5. Never talks to OpenRouteService or the database directly. It only calls the backend.

### The data

Each crime has: location (`lat`, `lng`), `occurredAt` (UTC timestamp), `type` (crime type enum), `source` (source enum) and `address` (may be `null`). There is no separate city field; the address text holds the street, barangay and city.

Each police station has only `address` (which includes the station's name), `contactNumber`, `lat` and `lng`.

**Time zone rule: the backend is UTC-only; the frontend does all conversion.**
- Every timestamp from the backend is UTC. **Always display times in Philippine time** (`Asia/Manila`).
- `byHour` and `byWeekdayHour` statistics arrive counted in **UTC**. Convert them to Philippine time before drawing the charts (helpers in section 3).
- The date pickers show Philippine calendar dates. Convert them to UTC timestamps before sending `from` and `to`.
- When the user enters a time in the Add Report form, treat it as Philippine time and send it as UTC.
- The Philippines has no daylight saving time, so Philippine time is always exactly UTC+8. That is why a fixed 8-hour shift is correct.

---

## 2. Hard constraints (follow strictly)

**Stack:** Next.js (App Router, `src/` directory), **JavaScript** (TypeScript not required), React, Leaflet via `react-leaflet`, `recharts` for charts.

**Allowed libraries (use them when they make the code simpler):**
- **Tailwind CSS** for styling (accept it in the create-next-app prompts)
- `lucide-react` for icons
- `react-leaflet-cluster` for marker clustering (pick the version that works with the installed `react-leaflet`; if no compatible version exists, fall back to plain `CircleMarker`s with the limits in F4)

Install `react-leaflet` and `leaflet`, choosing the `react-leaflet` major version that matches the installed React (v5 for React 19, v4 for React 18).

**Keep it simple. Do NOT add:**
- **Caching** of any kind (no React Query/SWR, no saving responses in `localStorage`).
- **Quota protection or rate limiting** beyond the simple rules below.
- **Project plumbing:** Docker, CI files, testing libraries, Storybook, Husky, Prettier configs beyond the defaults.
- Redux/Zustand, large UI kits (MUI, Chakra), date libraries (use the built-in `Intl.DateTimeFormat`), axios (use `fetch`), or any mapping SDK other than Leaflet.

Simple request rules (these are just good habits, not a feature): only search or find a route when a button is clicked (never on every keystroke), and debounce map-move requests as described in F4.

**Code style (important):** the authors must be able to explain every line.
- Keep components small and readable. State lives in `src/app/page.js` and is passed down as props.
- Use `async/await`, `useState` and `useEffect`. No clever abstractions.
- Add a short comment above each non-obvious step.

**Product wording rules:** never show the words "safe route", "dangerous", or "guaranteed" in the UI. Use "reported crimes near this route" and "fewer reported crimes". Always show the backend's `notice` text under route results.

**Data note:** show a small, always-visible footer in the sidebar: "Based on reported-crime data. Times shown in Philippine time. Not a guarantee about any place or route."

---

## 3. Configuration

`.env.local` (do not commit; also create `.env.example` with the same keys):
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

Settings in `src/lib/constants.js`:
- `MAP_CENTER = [14.5995, 120.9842]`, `MAP_ZOOM = 12`
- `MIN_ZOOM_FOR_CRIMES = 13` (individual crimes are only loaded at this zoom or closer)
- `CRIME_LIMIT = 3000`
- `TIME_ZONE = 'Asia/Manila'`
- `MANILA_OFFSET_HOURS = 8` (Philippine time is always UTC+8; no daylight saving)
- `METRO_MANILA_BOUNDS = { minLat: 14.35, maxLat: 14.85, minLng: 120.85, maxLng: 121.20 }`
- `WEEKDAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']` (index 0 = Monday)
- Tile URL `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with attribution `© OpenStreetMap contributors`
- `CRIME_TYPE_COLORS` (fixed, one per enum value):

| Type | Color | Type | Color |
| --- | --- | --- | --- |
| THEFT | `#f59e0b` | VEHICLE_THEFT | `#ca8a04` |
| ASSAULT | `#ef4444` | BURGLARY | `#0891b2` |
| HOMICIDE | `#7f1d1d` | VANDALISM | `#64748b` |
| WEAPON_VIOLENCE | `#b91c1c` | ARSON | `#ea580c` |
| GANG_VIOLENCE | `#c2410c` | DRUG_RELATED_CRIME | `#16a34a` |
| SEXUAL_OFFENSE | `#db2777` | HUMAN_TRAFFICKING | `#4c1d95` |
| KIDNAPPING | `#9333ea` | OTHER | `#6b7280` |
| STALKING | `#a855f7` | | |

Helpers in `src/lib/format.js`:
- `typeColor(type)`: `CRIME_TYPE_COLORS[type]` or `#6b7280`.
- `formatDateTime(iso)`: `new Intl.DateTimeFormat('en-PH', { timeZone: TIME_ZONE, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))`, e.g. "Sep 14, 2026, 9:30 PM".
- `labelOf(value, list)`: finds the `label` for an enum `value` in a `[{ value, label }]` list from `/api/meta`, falling back to the raw value.
- `hourLabel(h)`: `0` becomes "12 AM", `13` becomes "1 PM".
- `manilaInputToUtcIso(value)`: converts a `datetime-local` value such as `"2026-10-19T21:30"` (Philippine time) to UTC: `new Date(value + ':00+08:00').toISOString()`.

Time conversion helpers in `src/lib/time.js` (all conversion between UTC and Philippine time lives in this one file, with comments):
- `manilaDayStartUtc(dateStr)`: start of a Philippine calendar day as a UTC timestamp. `"2026-01-01"` becomes `new Date('2026-01-01T00:00:00+08:00').toISOString()`, i.e. `"2025-12-31T16:00:00.000Z"`. Used for `from`.
- `manilaDayEndExclusiveUtc(dateStr)`: start of the **next** Philippine day as a UTC timestamp (`manilaDayStartUtc` + 24 hours). Used for `to`, which the backend treats as exclusive, so the whole picked day is included.
- `utcToManilaDateStr(iso)`: the Philippine calendar date of a UTC timestamp, as `YYYY-MM-DD`: `new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(iso))`. Used for the date pickers' `min`/`max`.
- `toManilaHours(byHourUtc)`: shifts the 24 UTC hour counts to Philippine hours.
  ```js
  // A crime at UTC hour h happened at Philippine hour (h + 8) mod 24.
  const local = new Array(24).fill(0);
  for (let h = 0; h < 24; h++) local[(h + MANILA_OFFSET_HOURS) % 24] += byHourUtc[h];
  ```
- `toManilaWeekdays(byWeekdayHourUtc)`: turns the 7 x 24 UTC table into 7 Philippine weekday totals (index 0 = Monday).
  ```js
  // Number the 168 hours of the week from Monday 00:00 (UTC), shift by 8 hours,
  // and wrap around at the end of the week. A late-Sunday UTC hour becomes early Monday.
  const local = new Array(7).fill(0);
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const hourOfWeek = (d * 24 + h + MANILA_OFFSET_HOURS) % 168;
      local[Math.floor(hourOfWeek / 24)] += byWeekdayHourUtc[d][h];
    }
  }
  ```
  (The backend sends the full weekday x hour table, not 7 weekday totals, because one UTC day overlaps two Philippine days; 7 UTC totals cannot be converted correctly.)

---

## 4. API contract (shared with the backend; follow exactly)

Rules: base path `/api`, JSON only. Coordinates are `lat` and `lng` fields, or `[lat, lng]` pairs in arrays. **That is already Leaflet's order, so never swap.** `occurredAt` is an ISO UTC string ending in `Z`. Errors return an HTTP error status with `{ "message": "text" }`; show that message to the user.

**Common filters** for `/api/crimes` and `/api/stats` (all optional): `area` (text; matches crimes whose address contains it, case-insensitive), `type`, `source`, `from` (inclusive) and `to` (exclusive) as **UTC timestamps with a zone** (for example `2025-12-31T16:00:00.000Z`; build them with the `time.js` helpers), and the bounding box `minLat`, `minLng`, `maxLat`, `maxLng` (all four or none).

| Endpoint | Query / body | Response |
| --- | --- | --- |
| `GET /api/meta` | none | dropdown data |
| `GET /api/crimes` | common filters, `limit` | array of crimes, newest first |
| `POST /api/crimes` | crime body below | 201 with the saved crime |
| `PUT /api/crimes/{id}` | crime body below | 200 with the updated crime (not used by the UI) |
| `GET /api/stats` | common filters | stats object |
| `GET /api/hotspots` | none | array of hotspots (all crimes, not filtered) |
| `GET /api/stations` | none | array of stations (`distanceKm` is `null`) |
| `GET /api/stations/nearby` | `lat`, `lng`, optional `radiusKm` (default 2) | stations sorted by distance |
| `GET /api/geocode` | `q` (at least 2 characters) | up to 5 places |
| `POST /api/routes/safe` | JSON body below | route response |

Shapes:

```json
// meta
{ "crimeTypes": [ { "value": "THEFT", "label": "Theft", "weight": 1 } ],
  "sources":    [ { "value": "POLICE_REPORT", "label": "Police report" } ],
  "dateRange":  { "earliest": "2025-09-30T17:05:00Z", "latest": "2026-09-30T14:20:00Z" } }   // UTC, may be null

// crime
{ "id": 1042, "type": "ASSAULT", "source": "POLICE_REPORT",
  "lat": 14.5995, "lng": 120.9842, "occurredAt": "2026-09-14T13:30:00Z",
  "address": "Recto Ave, Manila" }

// POST /api/crimes body
{ "type": "THEFT", "source": "COMMUNITY_REPORT",
  "lat": 14.6012, "lng": 120.9845,
  "occurredAt": "2026-10-19T13:30:00Z",
  "address": "Near Legarda LRT Station, Sampaloc, Manila" }
// Validation errors (400): unknown type/source, location outside Metro Manila,
// occurredAt without a time zone, occurredAt in the future, address over 255 characters.

// stats (all time counts in UTC)
{ "total": 214,
  "byType":   { "THEFT": 90, "ASSAULT": 61, "VEHICLE_THEFT": 38, "OTHER": 25 },
  "bySource": { "POLICE_REPORT": 150, "COMMUNITY_REPORT": 64 },
  "byHour":   [3,1,0,0,2,4,5,7,6,5,4,6,8,9,7,8,10,14,20,28,31,29,22,9],
  "byWeekdayHour": [ [0,1,0,0,0,1,0,1,1,0,0,1,2,1,1,1,2,3,3,4,5,4,3,1], "... 7 rows x 24 columns ..." ],
  "busiestSpots": [ { "lat": 14.5987, "lng": 120.9737, "crimeCount": 17, "sampleAddress": "Recto Ave, Manila" } ] }

// hotspot
{ "id": "h-5617-48412", "weight": 36, "crimeCount": 17, "topType": "ASSAULT",
  "bounds": { "south": 14.5975, "west": 120.9725, "north": 14.6000, "east": 120.9750 } }

// station
{ "id": 3, "address": "Police Station 3, Quezon Blvd, Quiapo, Manila",
  "contactNumber": "0000-000-0000", "lat": 14.60, "lng": 120.98, "distanceKm": 0.8 }

// geocode result
{ "label": "Cubao, Quezon City", "lat": 14.619, "lng": 121.053 }

// POST /api/routes/safe request
{ "origin": { "lat": 14.619, "lng": 121.053 },
  "destination": { "lat": 14.601, "lng": 120.973 },
  "mode": "driving-car",          // or "foot-walking"
  "bufferMeters": 150 }

// POST /api/routes/safe response
{ "routes": [
    { "label": "Fastest route",
      "path": [[14.619, 121.053], [14.618, 121.050]],
      "distanceKm": 9.4, "durationMin": 28, "riskScore": 17,
      "nearbyCrimes": [ { "id": 1042, "type": "ASSAULT", "lat": 14.6, "lng": 120.98,
                          "occurredAt": "2026-09-14T13:30:00Z", "address": "Recto Ave, Manila",
                          "distanceM": 62 } ] },
    { "label": "Avoids reported hotspots", "path": [[14.619, 121.053]],
      "distanceKm": 10.6, "durationMin": 33, "riskScore": 5, "nearbyCrimes": [] } ],
  "recommendedIndex": 1,
  "warnings": [ "17 weighted reported-crime points lie within 150 m of the fastest route." ],
  "notice": "Suggestions only. Reported-crime data does not guarantee that any route is free of risk." }
```

Notes:
- `byType` and `bySource` only include values with a count above 0, sorted by count descending.
- `byHour` has 24 entries, index = **UTC** hour. `byWeekdayHour` has 7 rows (row 0 = Monday, **UTC**) of 24 **UTC** hours. Never chart them directly: convert with `toManilaHours` and `toManilaWeekdays` first.
- `routes[0]` is always the baseline. If no crimes are near it, there is exactly one route and `warnings` is empty.
- `riskScore` is a weighted count (more serious crime types count more). It is not a percentage.
- A newly posted crime appears immediately in crimes, stats, hotspots and route checks.

---

## 5. File layout

```
src/app/        layout.js, page.js, globals.css
src/components/ MapView.js, MapEvents.js, CrimeLayer.js, HotspotLayer.js, StationLayer.js,
                RouteLayer.js, DraftMarker.js, FilterPanel.js, StatsPanel.js, RoutePanel.js,
                ReportPanel.js, Legend.js
src/lib/        api.js, constants.js, format.js, time.js, fixtures.js
```

---

## 6. Phases (execute in order; after each phase run the check, then `git commit`)

### F1. Scaffold
- Create the Next.js app in the current folder with: JavaScript, App Router, `src/` directory, ESLint yes, **Tailwind yes**.
- `npm install leaflet react-leaflet recharts lucide-react` (and `react-leaflet-cluster` per section 2).
- Create `.env.local`, `.env.example`, `src/lib/constants.js`, `src/lib/format.js`, `src/lib/time.js`, and the empty component files.
- Write the `time.js` helpers now and check them with a quick `node` script (then delete the script): `manilaDayStartUtc('2026-01-01')` is `2025-12-31T16:00:00.000Z`; `toManilaHours` moves a count at UTC hour 20 to index 4; `toManilaWeekdays` moves a count at UTC Sunday 20:00 (`[6][20]`) to Monday (index 0) and one at UTC Monday 03:00 (`[0][3]`) stays on Monday.
- Set the page title to "Talas" (in `layout.js` metadata). Replace the default page content with a placeholder `<h1>Talas</h1>`. Remove default Next.js demo content and images.
- **Check:** `npm run build` succeeds.

### F2. API helper and fixtures
`src/lib/api.js` exports one async function per endpoint used by the UI: `getMeta`, `getCrimes(params)`, `createCrime(body)`, `getStats(params)`, `getHotspots`, `getStations`, `getNearbyStations(lat, lng, radiusKm)`, `geocode(q)`, `findRoutes(body)`.

Rules for the helper:
- One internal function `request(path, options)` that calls `fetch(BASE + path, ...)`, with `Content-Type: application/json` for POST bodies.
- Remove empty, `null` or undefined values from query params before building the query string.
- If the response is not OK, read `{ message }` from the JSON (fallback text: "Could not reach the server. Is the backend running?") and `throw new Error(message)`. Network failures use the same fallback text.
- If `NEXT_PUBLIC_USE_MOCKS === 'true'`, every function returns data from `src/lib/fixtures.js` (after a 300 ms delay) instead of calling the network. Fixtures must follow section 4 exactly: a full meta object (all 15 types, 5 sources, a UTC `dateRange`), about 80 crimes spread over Metro Manila with varied types, sources, addresses (including city names such as "Manila", "Quezon City", "Makati") and times (the mock `getCrimes` applies the area, type, source and bounding box filters), 6 hotspots, 8 stations, a stats object in UTC (with a full 7 x 24 `byWeekdayHour` whose numbers add up to `byHour` and `total`), geocode results for "Cubao" and "Recto", and a route response with two routes (with a realistic 10 to 20 point `path`). The mock `createCrime` returns the body with a new `id` and adds it to the in-memory fixture list. This lets the UI be built before the backend runs.
- **Check:** `npm run build` succeeds.

### F3. Map shell and view tracking
- `MapView.js`: a `MapContainer` with the center and zoom from the constants, a `TileLayer` with the attribution, full width and height of its parent. It accepts `children` (layers), an `onViewChange` callback, an `onMapClick` callback, and a `flyTo` prop (`{ lat, lng, zoom }` or `null`).
- `MapEvents.js` (child of the map): uses `useMapEvents` to call `onViewChange({ bounds: {minLat, minLng, maxLat, maxLng}, zoom })` on `moveend` and once on load, and `onMapClick({ lat, lng })` on `click`. Also a small component using `useMap()` that calls `map.flyTo` whenever the `flyTo` prop changes.
- In `page.js`, load `MapView` with `dynamic(() => import('../components/MapView'), { ssr: false })`. Leaflet needs the browser, so this is required. Import `leaflet/dist/leaflet.css` once inside `MapView.js`.
- Page layout: a two-column grid, sidebar 400 px wide on the left (scrolls vertically, Tailwind classes), map fills the rest at full viewport height. Under 800 px wide the sidebar stacks above the map with a map height of 60vh.
- Sidebar has a "Talas" heading, three tabs ("Crime Info", "Route", "Add Report"; `useState('crime')`), and the footer note from section 2 pinned at the bottom.
- `page.js` keeps `view` state (`{ bounds, zoom }`) from `onViewChange`.
- **Check:** `npm run build` succeeds. Ask the user to confirm the map shows.

### F4. Data layers (crimes, hotspots, stations)
All layers are children of `MapView` and receive data via props.
- **Meta:** on load fetch `getMeta()` into `meta` state (used for dropdowns, labels and the legend).
- **Crimes in view:** when `view.zoom >= MIN_ZOOM_FOR_CRIMES`, fetch `getCrimes({ ...appliedFilters, ...view.bounds, limit: CRIME_LIMIT })` after the map stops moving, **debounced by 400 ms**, and ignore results from an outdated request (keep a request counter in a `useRef`). Below that zoom, show no crimes and display the sidebar hint "Zoom in to see individual crimes. Hotspots are shown for the whole map." If the number returned equals `CRIME_LIMIT`, show "Showing the 3,000 most recent crimes in this view. Zoom in or narrow the filters to see more."
- `CrimeLayer`: one `CircleMarker` per crime (radius 5, `typeColor(type)`, fill opacity 0.7) with a `Popup` showing: type label (bold), date and time in Philippine time (`formatDateTime`), address (if any), and "Source: <source label>". Wrap the markers in `react-leaflet-cluster`'s `MarkerClusterGroup` if installed. **Do not use default pin `Marker` icons for crimes** (they break in Next.js without extra image setup).
- `HotspotLayer`: one `Rectangle` per hotspot with bounds `[[south, west], [north, east]]`, red outline, red fill at 0.25 opacity, popup "Hotspot: N reported crimes (weight W). Most common: <topType label>."
- `StationLayer`: one `CircleMarker` per station, radius 7, blue (`#2563eb`) with a white border, popup with "Police station" (bold), the address, and the contact number. Optional `highlightId` draws one station larger.
- In `page.js`: state `crimes`, `hotspots`, `stations`, plus layer toggle booleans `showCrimes`, `showHotspots`, `showStations` (default all true). On first load fetch `getMeta()`, `getHotspots()` and `getStations()` with `Promise.all`. Show a loading indicator, and a red error message in the sidebar when a request fails. Write a `reloadData()` function in `page.js` that refetches hotspots, the crimes in view and the current stats; F9 uses it.
- **Check:** `npm run build` succeeds. With `NEXT_PUBLIC_USE_MOCKS=true`, hotspot rectangles and stations render, and crimes appear when zoomed in.

### F5. Filters and statistics
`FilterPanel` (Crime Info tab):
- An **Area** text input ("Street, barangay or city, e.g. Tondo"), crime type `<select>` ("All types" plus `meta.crimeTypes` labels), source `<select>` ("All sources" plus `meta.sources` labels), and `from` / `to` date inputs labeled "From" and "To (Philippine dates)", with `min`/`max` set from `utcToManilaDateStr(meta.dateRange.earliest / latest)` when those are not `null`.
- The form keeps the picked dates as `YYYY-MM-DD`. Only when building request params, convert them: `from: manilaDayStartUtc(fromDate)`, `to: manilaDayEndExclusiveUtc(toDate)`.
- A checkbox **"Only the current map view"** (off by default).
- **Search** and **Reset** buttons (Enter in the Area input also searches). Nothing reloads until Search is clicked. Search copies the form values into `appliedFilters` state, then reloads the crimes in view (F4 rule) and calls `getStats({ ...appliedFilters, ...(onlyView ? view.bounds : {}) })`. Reset clears the form and `appliedFilters` and reloads.
- If `from` is after `to`, show an inline error and do not search.
- Load the unfiltered stats once on first load. Do not refresh stats on every map move.

`StatsPanel`:
- A heading describing what is shown, built from the applied filters, e.g. "214 reported crimes · area "Tondo" · Jan 1 to Sep 30, 2026 · current map view".
- **What:** a horizontal `recharts` bar chart of `byType` (bars colored with `typeColor`, axis labels from `meta.crimeTypes`).
- **When:** first convert: `hours = toManilaHours(stats.byHour)` and `weekdays = toManilaWeekdays(stats.byWeekdayHour)`. Then draw a bar chart of `hours` titled "By hour of day (Philippine time)" with `hourLabel` ticks, and a bar chart of `weekdays` titled "By day of week (Philippine time)" with `WEEKDAY_LABELS`. Highlight the highest bar in each chart in a darker color and add one line of text under them: "Most reports: around <hour>, on <weekday>s."
- **Where:** a "Busiest spots" list: "N reported crimes near <sampleAddress>" (or "near (lat, lng)" with 4 decimals when `sampleAddress` is `null`); clicking flies the map to that spot at zoom 16 via the `flyTo` state.
- **Sources:** a small list of `bySource` with labels and counts.
- When `total === 0`: "No reported crimes match these filters."
- Every chart uses a `ResponsiveContainer` (height about 180 px). Turn the converted `hours` and `weekdays` arrays into `[{ label, count }]` inside the component.
- **Check:** `npm run build` succeeds.

### F6. Route form and geocoding
`RoutePanel` (sidebar "Route" tab):
- Two text inputs (Start, Destination), a travel mode `<select>` (Driving = `driving-car`, Walking = `foot-walking`), a buffer `<select>` (100 m, 150 m, 250 m; default 150), and a **Find Route** button.
- On click (never on typing; Enter in an input also triggers it): call `geocode()` for each input. If a query returns no results, show "No places found for '<text>'." and stop. If a query returns several results, show a small list of radio buttons so the user picks one for that field; if exactly one, use it automatically. Once both places are chosen, call `findRoutes(...)`.
- Disable the button and show "Finding route..." while requests run. Prevent double submits. Show backend error messages in red.
- Lift results up to `page.js` state: `routeResult`, `selectedRouteIndex` (initialize to `recommendedIndex`), `origin`, `destination`.
- **Check:** `npm run build` succeeds. With mocks on, entering "Cubao" and "Recto" shows results.

### F7. Route display
- `RouteLayer`: for each route draw a `Polyline`. The selected route is thick (weight 6): green (`#16a34a`) if it is the recommended route, otherwise blue (`#2563eb`). Non-selected routes are gray (`#6b7280`), weight 4, dashed (`dashArray: '8 8'`). Clicking a polyline selects it. Draw circle markers for the selected route's `nearbyCrimes` (radius 8, black outline, `typeColor` fill) with popups showing type label, date and time in Philippine time, address, and distance from the route. Draw "Start" and "End" markers as `CircleMarker`s with a permanent `Tooltip` (no pin icons).
- Fit the map to the bounds of all route paths when a result arrives: a small child component using `useMap()` and `map.fitBounds(bounds, { padding: [40, 40] })` in a `useEffect`.
- In `RoutePanel`, under the form show one **card per route**: label (add "(recommended)" to the recommended one), distance in km, duration in minutes, "Reported-crime score: N", and "N reported crimes within <buffer> m". Clicking a card selects the route. Then show:
  - the `warnings` as a list (yellow background), if any;
  - for the selected route, the `nearbyCrimes` as a small list (type label, date in Philippine time, address, distance);
  - "No reported crimes found near this route." if the baseline had none;
  - the backend's `notice` in small gray text, **always**.
- A **Clear route** button resets route state and returns the map to the default view.
- **Check:** `npm run build` succeeds. With mocks on, the two-route fixture shows both polylines, the cards and the notice.

### F8. Nearby police stations, legend, layer toggles
- In `RoutePanel`, add a **Show nearby police stations** button. It calls `getNearbyStations(lat, lng, 2)` using the chosen origin (or the map center if none). Show a list: address, contact number, distance in km. Clicking an item highlights that station on the map (`highlightId`) and flies to it.
- `Legend`: a collapsible box over the map's bottom-left corner (absolute positioned, collapsed by default on screens under 800 px) listing all 15 crime types with their colors and labels, the hotspot rectangle, and the station marker.
- Layer toggles: three checkboxes (Crimes, Hotspots, Stations) at the top of the sidebar, wired to the `show*` state from F4.
- **Check:** `npm run build` succeeds.

### F9. Add Report form
`ReportPanel` (sidebar "Add Report" tab):
- While this tab is open, clicking the map sets `draftLocation` (`{ lat, lng }`) via `onMapClick`. `DraftMarker` draws it as a `CircleMarker` (radius 9, black outline, white fill) with a permanent `Tooltip` "New report". Clicking again moves it. On other tabs, map clicks do nothing.
- Form fields: location (read-only text showing `lat, lng` with 5 decimals, or "Click the map to set the location"), crime type `<select>` (required, from `meta.crimeTypes`), source `<select>` (from `meta.sources`, default `COMMUNITY_REPORT`), date and time (`<input type="datetime-local">`, labeled "Date and time (Philippine time)", required, `max` = now in Philippine time), and address (text, optional, `maxLength` 255, placeholder "Street, barangay, city").
- Client-side checks before sending: location set; location inside `METRO_MANILA_BOUNDS` ("Pick a spot within Metro Manila."); type and date filled.
- **Submit** sends `createCrime({ type, source, lat, lng, occurredAt: manilaInputToUtcIso(dateTime), address })`. Disable the button while sending. On success: show "Report added." in green, clear the form and `draftLocation`, then call `reloadData()` so the map, hotspots and stats include the new crime. On error: show the backend's message in red and keep the form values.
- **Check:** `npm run build` succeeds. With mocks on, adding a report shows the success message and the new crime appears on the map when zoomed in.

### F10. Polish and final pass
- Loading and error states exist for every request, and every call is wrapped in try/catch (no unhandled promise rejections).
- Every displayed date and time goes through `formatDateTime`, and every UTC/Philippine conversion goes through `time.js` or `manilaInputToUtcIso` (search for `toLocaleString`, `getHours`, `getDay` and `new Date(` to confirm nothing bypasses them).
- The hour and weekday charts are always drawn from `toManilaHours` / `toManilaWeekdays`, never from the raw UTC arrays.
- All visible text is plain, friendly English. Search all of `src/` for "safe route", "dangerous", "guaranteed": there must be none.
- The footer note from section 2 is visible on every tab.
- Run `npm run lint` and fix warnings that are real problems.
- Write `README.md` titled "Talas Frontend": what the app is, how to set `.env.local`, `npm install`, `npm run dev` (runs on `http://localhost:3000`; the backend must be running at `NEXT_PUBLIC_API_URL`), how to use mock mode, and that times are shown in Philippine time.
- **Check:** `npm run build` and `npm run lint` succeed.

---

## 7. When to stop and ask the user

Stop and ask only for:
1. Confirmation that the backend is running, when you need to test against live data (otherwise use mock mode).
2. A visual check of the map, since you cannot see the browser.

If the backend is not ready, build everything with `NEXT_PUBLIC_USE_MOCKS=true`, and report that live integration is untested.

## 8. Definition of done

- `npm run dev` starts and the page loads at `http://localhost:3000`.
- With the backend running (mocks off): hotspots and stations appear; zooming in shows clustered crimes with full popups; area, type, source and date filters update the map and all stats (type, hour, weekday, busiest spots, sources); a route between two Metro Manila places draws on the map with cards, warnings and the notice; adding a report saves it and it appears on the map and in the stats.
- All times display in Philippine time; the hour and weekday charts show Philippine time; picking "From Jan 1 to Jan 31" includes crimes from Jan 1 00:00 to Jan 31 23:59 Philippine time.
- With the backend stopped: the UI shows a readable error and does not crash.
- Every endpoint the UI uses matches section 4 exactly.
- No banned library in `package.json`. No secrets committed. `README.md` exists.
