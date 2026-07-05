export interface WeatherContext {
  aqi: number;
  pm25?: number;
  pm10?: number;
  temperature: number;
  weatherCondition: string;
  windSpeed: number;
  windDirection: string;
}

export interface WeatherProvider {
  getContext(lat: number, lng: number): Promise<WeatherContext>;
}

export class MockWeatherProvider implements WeatherProvider {
  async getContext(lat: number, lng: number): Promise<WeatherContext> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate realistic random data based loosely on coordinates for consistency
    const pseudoRandom = Math.abs(Math.sin(lat * lng));
    
    const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Haze'];
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    const aqi = Math.floor(50 + pseudoRandom * 150); // 50 to 200
    
    return {
      aqi,
      pm25: Math.floor(aqi * 0.4), // rough correlation for mockup
      pm10: Math.floor(aqi * 0.8),
      temperature: Math.floor(15 + pseudoRandom * 20), // 15 to 35 C
      weatherCondition: conditions[Math.floor(pseudoRandom * conditions.length)],
      windSpeed: Math.floor(5 + pseudoRandom * 25), // 5 to 30 km/h
      windDirection: directions[Math.floor(pseudoRandom * directions.length)],
    };
  }
}
