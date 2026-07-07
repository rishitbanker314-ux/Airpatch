import { getConfig } from '../config/env';

export interface GeminiAnalysisResult {
  isPollutionEvent: boolean;
  predictedCategory: "construction_dust" | "industrial_smoke" | "unpicked_waste" | "stagnant_water" | "none";
  confidence: number;
  severity: 1 | 2 | 3 | 4 | 5;
  reason: string;
}



export async function analyzeHotspotImage(
  base64Image: string,
  note?: string,
  categoryHint?: string
): Promise<GeminiAnalysisResult> {
  const config = getConfig();
  
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
           predictedCategory: (categoryHint as any) || "unpicked_waste",
           confidence: 0.95,
           severity: 3,
           reason: "Fallback: The AI service is currently experiencing high demand. We assume the user's report is accurate for this demo."
        };
      }
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
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
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.substring(3);
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
    }

    const parsed: GeminiAnalysisResult = JSON.parse(cleanJson);
    return parsed;

  } catch (err: any) {
    console.error("[GeminiProvider] Error analyzing image:", err);
    throw new Error(`Gemini analysis failed: ${err.message}`);
  }
}
