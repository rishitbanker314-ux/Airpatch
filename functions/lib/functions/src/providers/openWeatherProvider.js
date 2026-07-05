"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = getWeather;
exports.getAirPollution = getAirPollution;
const env_1 = require("../config/env");
/**
 * Fetch general weather data from OpenWeather API
 */
async function getWeather(lat, lng) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const config = (0, env_1.getConfig)();
    const apiKey = config.openWeatherApiKey;
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`OpenWeather API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return {
            temperatureC: (_a = data.main) === null || _a === void 0 ? void 0 : _a.temp,
            humidityPct: (_b = data.main) === null || _b === void 0 ? void 0 : _b.humidity,
            windSpeedMps: (_c = data.wind) === null || _c === void 0 ? void 0 : _c.speed,
            windDeg: (_d = data.wind) === null || _d === void 0 ? void 0 : _d.deg,
            weatherMain: (_f = (_e = data.weather) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.main,
            weatherDescription: (_h = (_g = data.weather) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.description,
            fetchedAt: new Date().toISOString()
        };
    }
    catch (err) {
        console.error("[OpenWeatherProvider] Error fetching weather:", err);
        throw new Error(`Weather fetch failed: ${err.message}`);
    }
}
/**
 * Fetch Air Pollution (AQI) data from OpenWeather API
 */
async function getAirPollution(lat, lng) {
    var _a, _b;
    const config = (0, env_1.getConfig)();
    const apiKey = config.openWeatherApiKey;
    const endpoint = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`OpenWeather AQI API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const listData = (_a = data.list) === null || _a === void 0 ? void 0 : _a[0];
        const components = (listData === null || listData === void 0 ? void 0 : listData.components) || {};
        return {
            aqi: (_b = listData === null || listData === void 0 ? void 0 : listData.main) === null || _b === void 0 ? void 0 : _b.aqi,
            pm25: components.pm2_5,
            pm10: components.pm10,
            co: components.co,
            no2: components.no2,
            o3: components.o3,
            so2: components.so2,
            fetchedAt: new Date().toISOString()
        };
    }
    catch (err) {
        console.error("[OpenWeatherProvider] Error fetching air pollution:", err);
        throw new Error(`Air pollution fetch failed: ${err.message}`);
    }
}
//# sourceMappingURL=openWeatherProvider.js.map