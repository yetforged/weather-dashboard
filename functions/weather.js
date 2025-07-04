const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const { city, country } = event.queryStringParameters;
  if (!city) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'City is required.' }),
    };
  }

  try {
    // Build weather API URL
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}`;
    if (country) weatherUrl += `,${encodeURIComponent(country)}`;
    weatherUrl += `&appid=${API_KEY}&units=metric`;

    // Fetch weather data
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      return {
        statusCode: weatherRes.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Weather not found.' }),
      };
    }
    const weatherData = await weatherRes.json();

    // Fetch AQI data
    let aqiData = null;
    if (weatherData.coord && weatherData.coord.lat && weatherData.coord.lon) {
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`;
      const aqiRes = await fetch(aqiUrl);
      if (aqiRes.ok) {
        aqiData = await aqiRes.json();
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ weather: weatherData, aqi: aqiData }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
}; 