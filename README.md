# AirPatch MVP

AirPatch lets citizens upload geo-tagged photos of visible local pollution events, verifies them with Gemini, enriches them with environmental context, clusters nearby reports into hotspots, and gives authorities a simple dashboard to prioritize response.

## Repository Structure

- `/docs`: Architecture, Firestore Schema, API Contracts, and Build State.
- `/shared`: Shared TypeScript types across frontend and backend.
- `/web`: React + Vite + TypeScript frontend.
- `/functions`: Firebase Cloud Functions backend.

## Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)

## Local Setup

### 1. Environment Variables

**Frontend (`web/`)**
Create a `.env.local` file in the `web/` directory based on `web/.env.example`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

**Backend (`functions/`)**
Firebase Cloud Functions will require these secrets in production (see `functions/.env.example`):
- `GEMINI_API_KEY`
- `AQI_API_KEY`
- `WEATHER_API_KEY`
For local development, you can use a `.env` file in the `functions/` directory or rely on the Firebase emulator's local configuration.

### 2. Firebase Services Required
To deploy this project to Firebase, you must enable the following services in your Firebase Console:
- **Firestore Database** (Native mode)
- **Cloud Storage**
- **Authentication** (Google Sign-In provider enabled)
- **Functions** (Requires Blaze plan)

### 3. Install Dependencies
```bash
# Backend
cd functions
npm install

# Frontend
cd ../web
npm install
```

### 4. Run Firebase Emulators
Ensure you have Java installed (required for Firebase Emulators).
```bash
cd functions
npm run serve
```

### 5. Run Frontend
In a new terminal window:
```bash
cd web
npm run dev
```
