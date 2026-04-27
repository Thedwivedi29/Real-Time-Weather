import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { weatherService } from "./weather-service";
import { particlesConfig } from "./particles-config";

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherContent = document.getElementById('weather-content');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const cityNameEl = document.getElementById('city-name');
const currentDateEl = document.getElementById('current-date');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('weather-desc');
const mainIconEl = document.getElementById('main-icon');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const pressureEl = document.getElementById('pressure');
const forecastGrid = document.getElementById('forecast-grid');
const mainCard = document.querySelector('.main-card');

// Initialize Particles
async function initParticles() {
    await loadSlim(tsParticles);
    await tsParticles.load("tsparticles", particlesConfig);
}

// Format Date
function formatDate(dateStr) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

// Day name from date string
function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Update Background Image based on scenery filename
function updateBackground(bgImage) {
    mainCard.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('/images/weather/${bgImage}')`;
    mainCard.style.backgroundSize = 'cover';
    mainCard.style.backgroundPosition = 'center';
}

// Update UI with normalized weather data
function updateWeatherUI(weather) {
    cityNameEl.textContent = `${weather.cityName}, ${weather.country}`;
    currentDateEl.textContent = formatDate(weather.timestamp);
    tempEl.textContent = weather.temperature;
    descEl.textContent = weather.description;
    mainIconEl.src = weatherService.getIconUrl(weather.iconCode);
    mainIconEl.alt = weather.description;
    feelsLikeEl.textContent = `${weather.feelsLike}°C`;
    humidityEl.textContent = `${weather.humidity}%`;
    windSpeedEl.textContent = `${weather.windSpeed} km/h`;
    pressureEl.textContent = `${weather.pressure} hPa`;
    updateBackground(weather.bgImage);
}

// Update forecast
function updateForecastUI(forecast) {
    forecastGrid.innerHTML = '';
    forecast.forEach(day => {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <p class="day">${getDayName(day.time)}</p>
            <img src="${weatherService.getIconUrl(day.iconCode)}" alt="forecast icon">
            <p class="temp">${day.tempMax}°<span class="min">${day.tempMin}°</span></p>
        `;
        forecastGrid.appendChild(item);
    });
}

// Main Search Logic
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    loader.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        // Step 1: Geocode the city name → lat/lon
        const cityMeta = await weatherService.getCoords(city);
        // Step 2: Fetch weather using coordinates
        const rawData = await weatherService.getWeatherAndForecast(cityMeta.latitude, cityMeta.longitude);
        // Step 3: Normalize and render
        const weather = weatherService.normalizeWeather(cityMeta, rawData);
        const forecast = weatherService.normalizeForecast(rawData);

        updateWeatherUI(weather);
        updateForecastUI(forecast);
        weatherContent.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        errorMessage.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
cityInput.addEventListener('click', () => {
    cityInput.value = '';
});

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
    initParticles();
    cityInput.value = 'Kanpur';
    handleSearch();
});
