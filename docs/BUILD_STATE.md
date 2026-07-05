# Build State

## Planned Milestones
- **Milestone 1:** Planning & Architecture (Completed)
- **Milestone 2:** Scaffold Project & Firebase Emulators (Completed)
- **Milestone 3:** Citizen Reporting Flow (Frontend Upload + Firestore) (Completed)
- **Milestone 4:** Gemini Integration & Backend Pipeline (Completed)
- **Milestone 5:** Clustering Logic & Risk Scoring (Completed)
- **Milestone 6:** Authority Dashboard & Resolution Flow (Completed)
- **Milestone 7:** Final Polish & Demo Prep (Completed)

## Current Status
**Status:** AirPatch is feature-complete for the MVP hackathon demo! All primary flows (Reporting, AI Verification, Context Enrichment, Aggregation, Risk Scoring, Authority Dashboard, and Resolution) are fully integrated and tested.

## Complete Features
1. **Report Submission:** Image upload with coordinates and optional notes.
2. **AI Verification:** Gemini Flash identifies pollution categories and severity accurately.
3. **Context Enrichment:** Backend safely mocks AQI, PM2.5, Temperature, and Wind data.
4. **Hotspot Engine:** Dynamically groups reports within 5km of each other matching the same category.
5. **Risk Engine:** Heuristically determines Low/Medium/High/Critical risk bands based on severity, duration, and active reports.
6. **Authority Dashboard:** Real-time visibility into Top Active Hotspots and High-Risk escalations.
7. **Resolution Engine:** Cascading resolution (resolving a hotspot auto-resolves child reports; resolving a report safely drops the hotspot active count).
8. **UI/UX Polish:** Fallback states, image previews, error handling, auto-centering maps.

## Known Limitations (MVP Deferred)
- **Firebase Auth:** Skipped for demo friction. Anyone can access the dashboard.
- **Provider API Keys:** The context enrichment relies on a mock layer instead of real OpenWeatherMap / AQICN API keys to avoid hitting rate limits during a live demo.
- **Database Rules:** `firestore.rules` blocks deletions, but reads/creates/updates are globally open. This is insecure for production but required for a frictionless, auth-free demo.

## Demo Script Suggestions

### 1. The Citizen Experience
- Open the **Home Map** and show existing clustered hotspots.
- Click **Report Pollution** in the navigation bar.
- Upload an image of "industrial smoke", set the category, and click **Use Current Location**.
- Submit the form. Show how it redirects to the **Report Detail** page.
- *Talking Point:* Explain that the image is currently being processed by Gemini AI in the background. Refresh the page to show the "AI Verification" block appearing with high confidence and severity.

### 2. The Aggregation Magic
- Navigate back to the **Home Map**. 
- Show that a new red pin has appeared (or an existing pin's count has increased).
- Click the pin to open the **Hotspot Detail**.
- *Talking Point:* Point out the Environmental Context (AQI, PM2.5) and the Risk Assessment (e.g. Critical). Explain how individual reports are automatically clustered into actionable insights for the government.

### 3. The Authority Resolution
- Navigate to the **Authority Dashboard**.
- Show the lists of High-Risk Hotspots. Click on the one we just created.
- Scroll down to the **Resolution Panel**.
- Upload a "cleanup" photo and add a note: *"Dispatched inspection team. Factory fined for non-compliance."*
- Click **Resolve Hotspot**.
- Notice the UI instantly changes to a green success banner with the evidence history.
- Return to the **Dashboard** and show that the Hotspot has been successfully cleared from the active queue!

## Next Tasks
- Pitch the project! No further coding required.
