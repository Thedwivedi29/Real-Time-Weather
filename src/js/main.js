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
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

// Update Background Image based on Weather
function updateBackground(weatherId) {
    let bgImage = 'clear.png';
    
    if (weatherId >= 200 && weatherId < 300) bgImage = 'stormy.png';
    else if (weatherId >= 300 && weatherId < 600) bgImage = 'rainy.png';
    else if (weatherId >= 600 && weatherId < 700) bgImage = 'snowy.png';
    else if (weatherId >= 700 && weatherId < 800) bgImage = 'cloudy.png';
    else if (weatherId === 800) bgImage = 'clear.png';
    else if (weatherId > 800) bgImage = 'cloudy.png';

    mainCard.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/weather/${bgImage}')`;
}

// Update UI with Weather Data
function updateWeatherUI(data) {
    updateBackground(data.weather[0].id);
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    currentDateEl.textContent = formatDate(data.dt);
    tempEl.textContent = Math.round(data.main.temp);
    descEl.textContent = data.weather[0].description;
    mainIconEl.src = weatherService.getIconUrl(data.weather[0].icon);
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} km/h`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
}

// Update UI with Forecast Data
function updateForecastUI(data) {
    forecastGrid.innerHTML = '';
    // Filter to get one forecast per day (OpenWeather provides 3-hour chunks)
    const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p class="day">${dayName}</p>
            <img src="${weatherService.getIconUrl(day.weather[0].icon)}" alt="${day.weather[0].description}">
            <p class="temp">${Math.round(day.main.temp_max)}°<span class="min">${Math.round(day.main.temp_min)}°</span></p>
        `;
        forecastGrid.appendChild(forecastItem);
    });
}

// Search Logic
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    // Show loading state
    loader.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        const weatherData = await weatherService.getWeather(city);
        const forecastData = await weatherService.getForecast(city);
        
        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);

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

// Initial Load (Default City)
window.addEventListener('DOMContentLoaded', () => {
    initParticles();
    cityInput.value = 'Kanpur'; // Default city
    handleSearch();
});
