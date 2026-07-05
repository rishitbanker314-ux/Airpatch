import { getConfig } from '../config/env';

export interface OpenWeatherContext {
  temperatureC?: number;
  humidityPct?: number;
  windSpeedMps?: number;
  windDeg?: number;
  weatherMain?: string;
  weatherDescription?: string;
  fetchedAt: string;
}

export interface OpenWeatherAQIContext {
  aqi?: number;
  pm25?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  fetchedAt: string;
}

/**
 * Fetch general weather data from OpenWeather API
 */
export async function getWeather(lat: number, lng: number): Promise<OpenWeatherContext> {
  const config = getConfig();
  const apiKey = config.openWeatherApiKey;
  
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`OpenWeather API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temperatureC: data.main?.temp,
      humidityPct: data.main?.humidity,
      windSpeedMps: data.wind?.speed,
      windDeg: data.wind?.deg,
      weatherMain: data.weather?.[0]?.main,
      weatherDescription: data.weather?.[0]?.description,
      fetchedAt: new Date().toISOString()
    };
  } catch (err: any) {
    console.error("[OpenWeatherProvider] Error fetching weather:", err);
    throw new Error(`Weather fetch failed: ${err.message}`);
  }
}

/**
 * Fetch Air Pollution (AQI) data from OpenWeather API
 */
export async function getAirPollution(lat: number, lng: number): Promise<OpenWeatherAQIContext> {
  const config = getConfig();
  const apiKey = config.openWeatherApiKey;
  
  const endpoint = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`OpenWeather AQI API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const listData = data.list?.[0];
    const components = listData?.components || {};
    
    return {
      aqi: listData?.main?.aqi,
      pm25: components.pm2_5,
      pm10: components.pm10,
      co: components.co,
      no2: components.no2,
      o3: components.o3,
      so2: components.so2,
      fetchedAt: new Date().toISOString()
    };
  } catch (err: any) {
    console.error("[OpenWeatherProvider] Error fetching air pollution:", err);
    throw new Error(`Air pollution fetch failed: ${err.message}`);
  }
}
