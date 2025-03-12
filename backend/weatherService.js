const fetch = require('node-fetch');

const API_KEY = process.env.WEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Get weather data for a specific city
 * @param {string} city - The city name
 * @returns {Promise<Object>} - Formatted weather data
 */
async function getWeatherByCity(city) {
  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    
    const data = await response.json();
    
    // Format the data for our frontend
    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed),
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather service error:', error);
    throw error;
  }
}

module.exports = {
  getWeatherByCity
};