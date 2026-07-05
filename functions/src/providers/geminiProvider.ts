import { getConfig } from '../config/env';

export interface GeminiAnalysisResult {
  isPollutionEvent: boolean;
  predictedCategory: "waste_burning_smoke" | "construction_dust" | "industrial_smoke" | "none";
  confidence: number;
  severity: 1 | 2 | 3 | 4 | 5;
  reason: string;
}

/**
 * Helper to fetch image bytes from a URL. 
 * Assumes the URL is publicly accessible or signed.
 */
async function fetchImageBytes(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function analyzeHotspotImage(
  imageUrl: string,
  note?: string,
  categoryHint?: string
): Promise<GeminiAnalysisResult> {
  const config = getConfig();
  
  // Since we don't know the exact SDK version mapping in this environment, 
  // we can securely use the native REST API with fetch to guarantee compatibility.
  const API_KEY = config.geminiApiKey;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const base64Data = await fetchImageBytes(imageUrl);
    
    // Construct the prompt
    let textPrompt = `Analyze this image to determine if it shows a pollution event. `;
    if (categoryHint) {
      textPrompt += `The user reported it as "${categoryHint}". `;
    }
    if (note) {
      textPrompt += `The user added this note: "${note}". `;
    }
    textPrompt += `Respond strictly with JSON matching this schema:
    {
      "isPollutionEvent": boolean,
      "predictedCategory": "waste_burning_smoke" | "construction_dust" | "industrial_smoke" | "none",
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
              data: base64Data
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
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No text returned from Gemini");
    }

    const parsed: GeminiAnalysisResult = JSON.parse(resultText);
    return parsed;

  } catch (err: any) {
    console.error("[GeminiProvider] Error analyzing image:", err);
    throw new Error(`Gemini analysis failed: ${err.message}`);
  }
}
