const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Example key, ideally user provides their own
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherService = {
    async getWeather(city) {
        try {
            const response = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
            if (!response.ok) throw new Error('City not found');
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getForecast(city) {
        try {
            const response = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
            if (!response.ok) throw new Error('Forecast not found');
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    getIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    }
};
