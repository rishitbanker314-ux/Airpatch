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

### 1. Install Dependencies
```bash
# Backend
cd functions
npm install

# Frontend
cd ../web
npm install
```

### 2. Run Firebase Emulators
Ensure you have Java installed (required for Firebase Emulators).
```bash
cd functions
npm run serve
```

### 3. Run Frontend
In a new terminal window:
```bash
cd web
npm run dev
```
