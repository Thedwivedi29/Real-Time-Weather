// Open-Meteo API - No API key required!
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather Code → Description
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear Sky',
        1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Icy Fog',
        51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
        61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
        71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
        80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
        85: 'Snow Showers', 86: 'Heavy Snow Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Severe Thunderstorm'
    };
    return descriptions[code] || 'Unknown';
}

// WMO Code → OpenWeather icon code (for icons)
function getIconCode(code, isDay = true) {
    const suffix = isDay ? 'd' : 'n';
    if (code === 0) return `01${suffix}`;
    if (code <= 2) return `02${suffix}`;
    if (code === 3) return `03${suffix}`;
    if (code <= 48) return `50${suffix}`;
    if (code <= 55) return `09${suffix}`;
    if (code <= 65) return `10${suffix}`;
    if (code <= 77) return `13${suffix}`;
    if (code <= 82) return `09${suffix}`;
    if (code <= 86) return `13${suffix}`;
    return `11${suffix}`;
}

// WMO Code → Background scenery
export function getWeatherBgImage(code) {
    if (code === 0 || code === 1) return 'clear.png';
    if (code <= 3 || (code >= 45 && code <= 48)) return 'cloudy.png';
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return 'rainy.png';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy.png';
    if (code >= 95) return 'stormy.png';
    return 'clear.png';
}

export const weatherService = {
    async getCoords(city) {
        const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const data = await res.json();
        if (!data.results || data.results.length === 0) throw new Error('City not found');
        const { latitude, longitude, name, country_code } = data.results[0];
        return { latitude, longitude, name, country: country_code?.toUpperCase() };
    },

    async getWeatherAndForecast(lat, lon) {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min',
            timezone: 'auto',
            forecast_days: 6
        });
        const res = await fetch(`${WEATHER_URL}?${params}`);
        if (!res.ok) throw new Error('Failed to fetch weather data');
        return await res.json();
    },

    normalizeWeather(cityMeta, rawData) {
        const c = rawData.current;
        const wmoCode = c.weather_code;
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 20;
        
        return {
            cityName: cityMeta.name,
            country: cityMeta.country,
            timestamp: c.time,
            temperature: Math.round(c.temperature_2m),
            feelsLike: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            windSpeed: c.wind_speed_10m.toFixed(1),
            pressure: Math.round(c.surface_pressure),
            description: getWeatherDescription(wmoCode),
            iconCode: getIconCode(wmoCode, isDay),
            bgImage: getWeatherBgImage(wmoCode),
        };
    },

    normalizeForecast(rawData) {
        // Skip today (index 0), show next 5 days
        return rawData.daily.time.slice(1, 6).map((time, i) => ({
            time,
            wmoCode: rawData.daily.weather_code[i + 1],
            iconCode: getIconCode(rawData.daily.weather_code[i + 1], true),
            tempMax: Math.round(rawData.daily.temperature_2m_max[i + 1]),
            tempMin: Math.round(rawData.daily.temperature_2m_min[i + 1]),
        }));
    },

    getIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    }
};
