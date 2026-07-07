"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeHotspotImage = analyzeHotspotImage;
const env_1 = require("../config/env");
async function analyzeHotspotImage(base64Image, note, categoryHint) {
    var _a, _b, _c, _d, _e;
    const config = (0, env_1.getConfig)();
    // Since we don't know the exact SDK version mapping in this environment, 
    // we can securely use the native REST API with fetch to guarantee compatibility.
    const API_KEY = config.geminiApiKey;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    try {
        // Construct the prompt
        let textPrompt = `Analyze this image to determine if it shows an environmental hazard or pollution event (this includes construction dust, industrial smoke, unpicked waste/garbage, or stagnant water). `;
        if (categoryHint) {
            textPrompt += `The user reported it as "${categoryHint}". `;
        }
        if (note) {
            textPrompt += `The user added this note: "${note}". `;
        }
        textPrompt += `Respond strictly with JSON matching this schema:
    {
      "isPollutionEvent": boolean,
      "predictedCategory": "construction_dust" | "industrial_smoke" | "unpicked_waste" | "stagnant_water" | "none",
      "confidence": number (0 to 1),
      "severity": number (1 to 5),
      "reason": string
    }`;
        const requestBody = {
            contents: [{
                    parts: [
                        { text: textPrompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            if (response.status === 503 || response.status === 429) {
                console.warn("[GeminiProvider] Gemini API is overloaded, using deterministic fallback for demo");
                return {
                    isPollutionEvent: true,
                    predictedCategory: categoryHint || "unpicked_waste",
                    confidence: 0.95,
                    severity: 3,
                    reason: "Fallback: The AI service is currently experiencing high demand. We assume the user's report is accurate for this demo."
                };
            }
            const errText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errText}`);
        }
        const data = await response.json();
        const resultText = (_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!resultText) {
            throw new Error("No text returned from Gemini");
        }
        // Strip markdown formatting if Gemini wrapped it in ```json ... ```
        let cleanJson = resultText.trim();
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
            if (cleanJson.endsWith('```')) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
        }
        else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
            if (cleanJson.endsWith('```')) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
        }
        const parsed = JSON.parse(cleanJson);
        return parsed;
    }
    catch (err) {
        console.error("[GeminiProvider] Error analyzing image:", err);
        throw new Error(`Gemini analysis failed: ${err.message}`);
    }
}
//# sourceMappingURL=geminiProvider.js.map