# AirPatch MVP Specification

## Problem Statement
Authorities lack real-time, verified visual data on localized pollution events (like open waste burning or construction dust), making it difficult to prioritize responses. Citizens want a simple way to report visible pollution without navigating bureaucratic channels.

## Target Users
1. **Citizens (Reporters):** Everyday people who spot visible pollution events and want to quickly report them via their smartphones.
2. **Local Authorities (Responders):** City officials or environmental officers who need a prioritized dashboard to dispatch response teams.

## Exact MVP Features
- **Photo Upload with Geotagging:** Citizens can snap a photo and attach their current location.
- **Automated Verification:** Gemini analyzes the image to confirm if a pollution event is likely visible.
- **Context Enrichment:** The backend attaches current AQI and weather data for the location.
- **Hotspot Clustering:** Proximate reports are automatically grouped into "hotspots."
- **Heuristic Risk Scoring:** Hotspots receive a 24-hour heuristic risk score based on category, density, and weather.
- **Authority Dashboard:** A map/list view of active hotspots with the ability to mark them as "resolved."

## Supported Pollution Categories
- `waste_burning_smoke`
- `construction_dust`
- `industrial_smoke`

## Non-Goals / Cut Features
- No stagnant water reporting.
- No garbage truck tracking.
- No generic social feed (reports are routed directly to the dashboard).
- No overcomplicated analytics or historical reporting.
- No iOS/Android native apps (web app only).

## Core Screens
1. **Landing/Report Screen (Citizen):** A simple camera interface or photo upload button with category selection and a "Submit" CTA.
2. **Success Screen (Citizen):** A brief confirmation message thanking the user.
3. **Dashboard Map View (Authority):** A map plotting active hotspots, color-coded by risk score.
4. **Hotspot Detail View (Authority):** A modal or panel showing the clustered photos, Gemini analysis summary, and a "Mark Resolved" button.

## User Flows

### Flow 1: Citizen Reporting
1. User visits web app on a mobile browser.
2. User taps "Report Pollution".
3. User takes/uploads a photo, grants location access, and selects a category (e.g., `waste_burning_smoke`).
4. User taps "Submit".
5. App displays "Report submitted successfully."

### Flow 2: Automated Verification & Clustering (Backend)
1. Report document created in Firestore; triggers a Cloud Function.
2. Cloud Function sends the image to Gemini.
3. If verified, the function fetches AQI/Weather data and updates the report.
4. Another function evaluates nearby verified reports and merges them into an active hotspot.

### Flow 3: Authority Resolution
1. Authority logs into the web dashboard.
2. Clicks on a high-risk red hotspot on the map.
3. Reviews the aggregated photos and Gemini's description.
4. Clicks "Mark Resolved", moving the hotspot and its reports to an archived state.

## Demo Story
"Meet Sarah. She's walking to work and sees thick smoke from a nearby construction site. She pulls out her phone, goes to AirPatch, snaps a photo, and hits submit. Behind the scenes, Google's Gemini verifies the smoke and correlates it with current wind data. At the city control room, an officer sees a new red 'High Risk' hotspot pop up on their dashboard, aggregating Sarah's report with two others. They dispatch a team and immediately mark the issue as resolved."

## Success Criteria
- [ ] End-to-end flow works: Upload -> Gemini Verify -> Map Display.
- [ ] Gemini accurately rejects clearly unrelated photos (e.g., a photo of a cat).
- [ ] Clustering correctly groups reports within a ~500m radius.
- [ ] The dashboard updates in near real-time using Firestore subscriptions.
