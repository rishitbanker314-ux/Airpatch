# Firestore Schema

This document dictates the structure of the Firestore database for AirPatch. It maps exactly to the TypeScript interfaces defined in `shared/types.ts`.

## `users` (Optional for MVP Anonymous Flow, Required for Authorities)
- `id`: `string` (Document ID)
- `role`: `'citizen' | 'authority'`
- `createdAt`: `timestamp`

## `reports`
Individual citizen reports of visible pollution.

- `id`: `string` (Document ID)
- `userId`: `string` (Anonymous UID or Auth UID)
- `category`: `'waste_burning_smoke' | 'construction_dust' | 'industrial_smoke'`
- `note`: `string` (optional)
- `imageMetadata`: `map`
  - `url`: `string`
  - `storagePath`: `string`
  - `uploadedAt`: `timestamp`
- `location`: `GeoPoint`
- `status`: `'pending' | 'verified' | 'rejected' | 'resolved'`
- `aiStatus`: `'pending' | 'processed' | 'failed'`
- `contextStatus`: `'pending' | 'processed' | 'failed'`
- `aiVerification`: `map` (optional)
  - `isPollutionEvent`: `boolean`
  - `predictedCategory`: `string` (enum: `waste_burning_smoke`, `construction_dust`, `industrial_smoke`, `none`)
  - `confidence`: `number` (0 to 100)
  - `severity`: `number` (0 to 100)
  - `reason`: `string`
  - `analyzedAt`: `timestamp`
- `context`: `map` (optional)
  - `aqi`: `number`
  - `pm25`: `number` (optional)
  - `pm10`: `number` (optional)
  - `temperature`: `number`
  - `weatherCondition`: `string`
  - `windSpeed`: `number`
  - `windDirection`: `string`
- `hotspotId`: `string` (optional, null if unclustered)
- `createdAt`: `timestamp`

## `hotspots`
Clustered reports representing a severe local event.

- `id`: `string` (Document ID)
- `category`: `'waste_burning_smoke' | 'construction_dust' | 'industrial_smoke'`
- `centerCoordinates`: `GeoPoint`
- `activeReportCount`: `number`
- `totalReportCount`: `number`
- `averageSeverity`: `number`
- `status`: `'active' | 'resolved'`
- `riskSummary`: `map` (optional)
  - `riskBand`: `'low' | 'medium' | 'high' | 'critical'`
  - `riskScore`: `number` (0-100)
  - `predictionWindow`: `number` (24)
  - `summary`: `string`
  - `drivers`: `array of strings`
- `latestReportAt`: `timestamp`
- `createdAt`: `timestamp`
- `updatedAt`: `timestamp`

## `resolutions`
Records of authorities resolving a hotspot.

- `id`: `string` (Document ID)
- `hotspotId`: `string`
- `resolvedBy`: `string` (Authority UID)
- `resolutionNote`: `string`
- `resolvedAt`: `timestamp`
