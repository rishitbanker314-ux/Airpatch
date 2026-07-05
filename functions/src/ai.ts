import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

const getGenAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeReportImage = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.aiStatus !== 'pending') {
      return;
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
      }

      const storagePath = data.imageMetadata?.storagePath;
      if (!storagePath) {
        throw new Error('No storage path found in report');
      }

      // Download image from Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(storagePath);
      const [buffer] = await file.download();

      // Get MIME type from metadata
      const [metadata] = await file.getMetadata();
      const mimeType = metadata.contentType || 'image/jpeg';

      const prompt = `
Analyze the provided image for pollution.
You must classify the image into one of these exact categories: 'waste_burning_smoke', 'construction_dust', 'industrial_smoke', or 'none'.
Return a JSON object with the following schema exactly:
{
  "isPollutionEvent": boolean,
  "predictedCategory": string,
  "confidence": number,
  "severity": number,
  "reason": string
}
`;

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: buffer.toString('base64'),
                  mimeType: mimeType
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('No text returned from Gemini');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Gemini output is not a JSON object');
        }
      } catch (err) {
        throw new Error('Failed to parse Gemini output as JSON');
      }

      // Defensive mapping
      const validCategories = ['waste_burning_smoke', 'construction_dust', 'industrial_smoke', 'none'];
      const rawCategory = typeof parsed.predictedCategory === 'string' ? parsed.predictedCategory : 'none';
      const finalCategory = validCategories.includes(rawCategory) ? rawCategory : 'none';

      const isPollutionEvent = typeof parsed.isPollutionEvent === 'boolean' 
        ? parsed.isPollutionEvent 
        : (finalCategory !== 'none');
      
      const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
      const severity = typeof parsed.severity === 'number' ? parsed.severity : 0;
      const reason = typeof parsed.reason === 'string' ? parsed.reason : 'Classification succeeded but no reason was parsed.';

      const aiVerification = {
        isPollutionEvent,
        predictedCategory: finalCategory,
        confidence,
        severity,
        reason,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const finalStatus = isPollutionEvent ? 'verified' : 'rejected';

      await snap.ref.update({
        aiStatus: 'processed',
        status: finalStatus,
        aiVerification
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Store safe failure state rather than crashing
      await snap.ref.update({
        aiStatus: 'failed'
      });
    }
  });
