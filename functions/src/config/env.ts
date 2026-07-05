import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local if it exists (for local development via Firebase emulator)
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getConfig() {
  return {
    geminiApiKey: requireEnv('GEMINI_API_KEY'),
    openWeatherApiKey: requireEnv('OPENWEATHER_API_KEY'),
  };
}
