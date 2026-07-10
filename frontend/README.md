# 🌊 AI Marine Risk Intelligence Dashboard

A single console that fuses live weather, water quality, satellite imagery,
ship tracking, and an explainable AI risk model — built for two audiences:
**port/coast-guard authorities** monitoring coast-wide risk, and
**fishermen** deciding whether it's safe to take the boat out today.

---

## Feature overview

### For port authorities & coast guard (`/dashboard`)
- **Overview** — live sensor cards (pH, turbidity, TDS, temperature, toxicity), an explainable AI risk score with a factor-by-factor breakdown, and trend charts.
- **Map & Globe** — Leaflet GIS map of major coastal cities + an interactive 3D globe.
- **Environment** — water quality history, live weather (real API), satellite bathymetry imagery.
- **Operations & Alerts** — per-zone risk comparison, live alert feed, ship tracking.

### For fishermen (`/fishermen`)
- **"Safe to go fishing today?"** — a live Go / Caution / Do-Not-Go verdict with an expandable factor breakdown, tuned to small-boat safety thresholds.
- **Catch potential estimate** — a documented heuristic based on sea-temperature anomaly and wave calmness.
- **Trip cost calculator** — live sliders for distance and fuel efficiency, instantly computing fuel cost vs. catch value vs. profit.
- **Nearest safe harbors** with one-tap directions.
- **Emergency panel** — tap-to-call coast guard helpline + share-my-GPS-location.
- **Multilingual** — English, Hindi, and Tamil for every safety-critical string.

### Platform-wide
- **Live-drifting sensor simulation** — every reading ticks and trends realistically instead of sitting static (swap for a real feed later — see below).
- **Explainable AI risk engine** — a transparent, weighted scoring model (`src/utils/riskEngine.js`) with a documented factor breakdown, not a hardcoded label.
- **Live alerts** — a notification bell with unread badge and a running feed.
- **Consistent UI shell** — every utility page (History, Configuration, Reports, Account, Submit Report, AI Assistant, Help Desk, Circuit Diagram, API Docs, About) shares the same padding, back-navigation, and footer via `PageShell`.
- **404 page** and a global **error boundary** so a single panel crashing doesn't white-screen the whole app.

---

## Tech stack

React 19 · Vite · Tailwind CSS v4 · React Router v7 · Leaflet / react-leaflet · react-globe.gl + Three.js · Recharts · lucide-react icons

No backend is required to run this — all data is realistic simulated data or free public APIs (Open-Meteo for live weather, NASA imagery for satellite view). See "What's real vs. simulated" below.

---

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint        # ESLint
```

---

## Project structure

```
src/
├── pages/                  One file per route (Home, Dashboard, FishermenZone, ...)
├── components/              Shared UI + dashboard panels
│   └── fishermen/            Fishermen-Zone-specific components
├── context/                 AlertContext (live notifications), LanguageContext (EN/HI/TA)
├── hooks/                   useLiveMarineData — simulated live sensor feed
├── utils/                   riskEngine.js — the explainable scoring model
└── MapSection.jsx           Shared Leaflet map used on the Dashboard
```

---

## What's real vs. simulated (be upfront about this in your submission)

| Data | Status |
|---|---|
| Live weather (`LiveWeatherPanel`) | **Real** — public Open-Meteo API, no key needed |
| Satellite imagery (`SatellitePanel`) | **Real** — public NASA bathymetry image |
| Wave height, wind speed, pressure, sea-temp anomaly, swell period | **Simulated** — realistic bounded random walk via `useLiveMarineData`, standing in for a live sensor/buoy feed |
| AI risk score | **Real computation** — a documented weighted formula over the above inputs, not hardcoded, but not yet a trained ML model |
| Ship positions, harbor status | **Simulated** — mock data, ready to be replaced with a real AIS feed |

This framing is a strength, not a gap to hide: the full architecture, UI, and scoring logic are built and working end-to-end, so plugging in a real sensor/AIS feed later is a data-source swap, not a rebuild.

---

## Where to plug in real data next

1. **Live sensor feed** — replace the `setInterval` body in `src/hooks/useLiveMarineData.js` with a `fetch()` to your actual buoy/IoT endpoint. Every consumer (cards, prediction panel, risk zones, fishermen advisory) updates automatically — no other file needs to change.
2. **Trained ML model** — `src/utils/riskEngine.js` documents exactly which inputs it expects and what it returns (`score`, `label`, `confidence`, `breakdown`). Swap the `computeRisk()` body for an API call to your model and keep the same return shape.
3. **Real ship tracking** — `ShipTrackingPanel` and the harbor list in `SafeHarbors.jsx` are ready to be wired to a real AIS provider (e.g. MarineTraffic API, AISHub).
4. **Backend / persistence** — none of this currently persists anything (Configuration uses `localStorage` as a placeholder). If you need real accounts or saved reports, that's the next layer to add.

---

## Pre-submission checklist

- [ ] Run `npm install && npm run build` once to confirm there are no build errors on your machine (this was written and syntax-verified in a sandbox without network access — a real build hasn't been run yet).
- [ ] Update the "Frontend by Aditya" credit line in `Footer.jsx` / `Dashboard.jsx` if the team has changed.
- [ ] Double check the Coast Guard helpline number in `EmergencyPanel.jsx` (currently India's toll-free `1554`) is correct for your target region.
- [ ] If presenting, be ready to explain the "real vs. simulated" data table above — it's a strength when stated upfront, and looks bad if a judge discovers it first.
