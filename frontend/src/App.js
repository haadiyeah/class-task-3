import React, { useState, useEffect } from 'react';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from backend on component mount
    fetch(`${process.env.REACT_APP_API_URL}/api/recent-searches`)
      .then(response => response.json())
      .then(data => setRecentSearches(data))
      .catch(err => console.error('Error fetching recent searches:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/weather?city=${city}`);
      const data = await response.json();
      
      if (response.ok) {
        setWeather(data);
        
        // Save search to backend
        fetch(`${process.env.REACT_APP_API_URL}/api/save-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ city }),
        })
          .then(response => response.json())
          .then(data => setRecentSearches(data))
          .catch(err => console.error('Error saving search:', err));
      } else {
        setError(data.error || 'Failed to fetch weather data');
        setWeather(null);
      }
    } catch (err) {
      setError('Error connecting to server');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          aria-label="City name"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {weather && (
        <div className="weather-card">
          <h2>{weather.city}, {weather.country}</h2>
          <div className="weather-info">
            <p className="temp">{weather.temperature}°C</p>
            <p className="description">{weather.description}</p>
          </div>
          <div className="weather-details">
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind: {weather.wind} km/h</p>
          </div>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3>Recent Searches</h3>
          <ul>
            {recentSearches.map((search, index) => (
              <li key={index}>
                <button 
                  onClick={() => {
                    setCity(search.city);
                    handleSubmit({ preventDefault: () => {} });
                  }}
                >
                  {search.city}
                </button>
                <span className="search-time">
                  {new Date(search.search_time).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;