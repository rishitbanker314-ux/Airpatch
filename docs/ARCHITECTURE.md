# Architecture

## Frontend Structure
- **Framework:** React + TypeScript via Vite.
- **State Management:** React Context (for Auth & simple global states).
- **Styling:** Tailwind CSS.
- **Map Integration:** Google Maps JavaScript API.
- **Key Directories:**
  - `src/components/`: Reusable UI elements (Buttons, Cards).
  - `src/pages/`: Main views (ReportPage, DashboardPage).
  - `src/services/`: Firebase initialization and abstracted database calls.
  - `src/utils/`: Formatting helpers, geolocation wrappers.

## Backend Modules
- **Framework:** Firebase Cloud Functions (TypeScript).
- **Core Modules:**
  - `verifyReport`: Triggered on new `reports` documents. Calls Gemini API for image classification and AQI/Weather APIs for enrichment.
  - `clusterReports`: Triggered periodically (Pub/Sub) or on successful verification. Evaluates unclustered reports and updates/creates `hotspots`.
  - `resolveHotspot`: Callable function for authorities to update the status of a hotspot and all its associated reports.

## Firestore Collections

### `reports`
- `id`: string
- `category`: string (e.g., `waste_burning_smoke`)
- `location`: GeoPoint
- `photoUrl`: string
- `status`: string (`pending` | `verified` | `rejected` | `resolved`)
- `geminiConfidence`: number
- `weatherContext`: object
- `hotspotId`: string (null if unclustered)
- `timestamp`: timestamp

### `hotspots`
- `id`: string
- `centerLocation`: GeoPoint
- `radius`: number
- `reportCount`: number
- `primaryCategory`: string
- `riskScore`: number (0-100)
- `status`: string (`active` | `resolved`)
- `lastUpdated`: timestamp

## End-to-End Data Flow
1. **Upload:** Client uploads a photo to Firebase Storage and writes a `pending` document to the `reports` collection.
2. **Verify:** A Cloud Function listens to `onCreate` events on `reports`. It downloads the image, asks Gemini to classify it, and updates the document to `verified` if successful.
3. **Cluster:** A scheduled (or chained) Cloud Function checks for new `verified` reports, calculates distances to existing active `hotspots`, and merges them or creates a new hotspot. It calculates the `riskScore`.
4. **Display:** The React frontend (Dashboard) maintains an `onSnapshot` listener on active `hotspots` and renders them on the Google Map in real-time.
5. **Resolve:** Authority clicks "Resolve" on the frontend, triggering a Cloud Function that marks the `hotspot` and its constituent `reports` as `resolved`.
