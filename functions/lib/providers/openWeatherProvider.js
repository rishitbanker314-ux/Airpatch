"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = getWeather;
exports.getAirPollution = getAirPollution;
exports.getHistoricalAirPollution = getHistoricalAirPollution;
exports.getAirPollutionForecast = getAirPollutionForecast;
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
        const owAqi = ((_b = listData === null || listData === void 0 ? void 0 : listData.main) === null || _b === void 0 ? void 0 : _b.aqi) || 0;
        let usAqi = 0;
        if (owAqi === 1)
            usAqi = 30;
        else if (owAqi === 2)
            usAqi = 75;
        else if (owAqi === 3)
            usAqi = 125;
        else if (owAqi === 4)
            usAqi = 175;
        else if (owAqi === 5)
            usAqi = 250;
        else
            usAqi = owAqi; // fallback
        return {
            aqi: usAqi,
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
/**
 * Fetch Historical Air Pollution (AQI) data from OpenWeather API
 */
async function getHistoricalAirPollution(lat, lng, startUnix, endUnix) {
    const config = (0, env_1.getConfig)();
    const apiKey = config.openWeatherApiKey;
    const endpoint = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lng}&start=${startUnix}&end=${endUnix}&appid=${apiKey}`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`OpenWeather AQI History API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    catch (err) {
        console.error("[OpenWeatherProvider] Error fetching historical air pollution:", err);
        throw new Error(`Historical air pollution fetch failed: ${err.message}`);
    }
}
/**
 * Fetch Air Pollution Forecast (AQI) data from OpenWeather API
 */
async function getAirPollutionForecast(lat, lng) {
    const config = (0, env_1.getConfig)();
    const apiKey = config.openWeatherApiKey;
    const endpoint = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`OpenWeather AQI Forecast API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    catch (err) {
        console.error("[OpenWeatherProvider] Error fetching air pollution forecast:", err);
        throw new Error(`Air pollution forecast fetch failed: ${err.message}`);
    }
}
//# sourceMappingURL=openWeatherProvider.js.map