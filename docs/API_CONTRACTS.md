# API Contracts

This document dictates the backend Cloud Functions for the AirPatch project.

## Callable Functions (Client -> Server)

### `createReport`
- **Trigger:** HTTPS Callable
- **Purpose:** Securely create a new report after the image is uploaded to Firebase Storage.
- **Input:**
  - `category`: `string`
  - `location`: `{ latitude, longitude }`
  - `imageMetadata`: `{ url, storagePath }`
  - `note`: `string` (optional)
- **Process:** Validates input, creates a `reports` document with `status="pending"`, `aiStatus="pending"`, `contextStatus="pending"`.
- **Output:** Returns `{ reportId: string }`.

### `getHotspots`
- **Trigger:** HTTPS Callable (or direct Firestore query via frontend SDK)
- **Purpose:** Retrieve a list of active hotspots for the map.
- **Input:** `void` (or optional bounding box filters).
- **Process:** Fetches documents from `hotspots` where `status == "active"`.
- **Output:** Returns array of `Hotspot` objects.

### `getHotspotDetails`
- **Trigger:** HTTPS Callable
- **Purpose:** Retrieve full hotspot data and its associated reports for the authority dashboard modal.
- **Input:** `{ hotspotId: string }`
- **Process:** Fetches the hotspot document and querying `reports` where `hotspotId == input.hotspotId`.
- **Output:** `{ hotspot: Hotspot, reports: Report[] }`

### `submitResolution`
- **Trigger:** HTTPS Callable
- **Purpose:** Allows an authority to mark a hotspot and its reports as resolved.
- **Input:** `{ hotspotId: string, resolutionNote: string }`
- **Process:** 
  1. Validates authority role.
  2. Updates `hotspot` status to `resolved`.
  3. Updates all associated `reports` status to `resolved`.
  4. Creates a `resolutions` document.
- **Output:** `{ success: boolean }`

---

## Event-Driven Triggers (Server -> Server)

### `analyzeReportImage`
- **Trigger:** Firestore `onCreate` on `reports`
- **Purpose:** Verifies the image using Gemini.
- **Process:** Downloads the image from Storage, calls Gemini API, updates `aiVerification` block, and sets `aiStatus="processed"`. If `isPollution` is true, sets `status="verified"`. Else, `status="rejected"`.

### `enrichReportContext`
- **Trigger:** Firestore `onUpdate` on `reports` (when `aiStatus` changes to `processed` and `status` == `verified`)
- **Purpose:** Adds local weather/AQI context.
- **Process:** Calls external APIs (e.g. OpenWeather), populates `context`, and sets `contextStatus="processed"`.

### `assignReportToHotspot`
- **Trigger:** Firestore `onUpdate` on `reports` (when `contextStatus` changes to `processed`)
- **Purpose:** Clusters the new verified report.
- **Process:** Queries active hotspots nearby. If one exists for the same category within radius, append `hotspotId` to the report. Otherwise, create a new `hotspot`.

### `recomputeHotspot`
- **Trigger:** Firestore `onUpdate` / `onCreate` on `hotspots`
- **Purpose:** Re-evaluates the risk score when a hotspot grows.
- **Process:** Recalculates `averageSeverity` and the `RiskAssessment` block (`riskScore`, `riskBand`, `summary`).
