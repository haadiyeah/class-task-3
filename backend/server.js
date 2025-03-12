const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const weatherService = require('./weatherService');

const app = express();
const port = process.env.PORT || 4000;

// Database connection setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
    // Create table if it doesn't exist
    pool.query(`
      CREATE TABLE IF NOT EXISTS searches (
        id SERIAL PRIMARY KEY,
        city VARCHAR(255) NOT NULL,
        search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Routes
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    const weatherData = await weatherService.getWeatherByCity(city);
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.post('/api/save-search', async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    await pool.query('INSERT INTO searches (city) VALUES ($1)', [city]);
    
    // Return updated recent searches
    const result = await pool.query(
      'SELECT * FROM searches ORDER BY search_time DESC LIMIT 5'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save search' });
  }
});

app.get('/api/recent-searches', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM searches ORDER BY search_time DESC LIMIT 5'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch recent searches' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});