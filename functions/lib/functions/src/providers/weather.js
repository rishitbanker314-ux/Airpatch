"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWeatherProvider = void 0;
class MockWeatherProvider {
    async getContext(lat, lng) {
        // In production, you would use these keys to fetch real data
        const aqiKey = process.env.AQI_API_KEY;
        const weatherKey = process.env.WEATHER_API_KEY;
        if (aqiKey && weatherKey) {
            console.log(`[WeatherProvider] Using AQI_API_KEY and WEATHER_API_KEY for lat:${lat}, lng:${lng}`);
        }
        else {
            console.log(`[WeatherProvider] Missing API keys. Falling back to mock data.`);
        }
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
exports.MockWeatherProvider = MockWeatherProvider;
//# sourceMappingURL=weather.js.map