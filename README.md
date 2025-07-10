 

# Live Weather Dashboard

This is a simple, modern weather dashboard web app that shows live weather and air quality for any city. It also displays weather for major global cities and supports dark mode.

## Features

- **Live Weather Search:** Enter any city to get current weather, temperature, humidity, wind speed, pressure, sunrise/sunset, visibility, and air quality index (AQI).
- **Major Cities Overview:** See weather for major cities like Mumbai, Delhi, New York, London, and more.
- **Search History:** Quickly revisit recent city searches.
- **Dark Mode:** Toggle between light and dark themes.
- **Live Clock:** Shows current day, date, and time.
- **Map Search:** Pick a city by clicking on a map (uses OpenStreetMap and Nominatim for reverse geocoding).

## API Used

- **OpenWeatherMap API:**  
  - [https://openweathermap.org/](https://openweathermap.org/)  
  - Used for fetching weather and air quality data.
  - Endpoints used: `/weather` for weather, `/air_pollution` for AQI.

## Major JavaScript Functions

- `searchWeather(city)`:  
  Fetches and displays weather and AQI for the given city. Handles errors and updates the UI.

- `saveHistory(city)`:  
  Saves searched cities to localStorage and updates the search history display.

- `renderHistory()`:  
  Renders the search history as clickable buttons.

- `fetchCityWeather(city, country)`:  
  Fetches weather for a specific city and country (used for the major cities grid).

- `renderGlobalCitiesWeather()`:  
  Displays weather cards for a list of major cities.

- `updateDateTime()`:  
  Updates the live clock on the dashboard.

- **Dark Mode Toggle:**  
  Remembers user preference and toggles dark mode on the site.

- **Map Modal Functions:**  
  Lets users pick a city from a map using Leaflet.js and OpenStreetMap.

## How to Use

1. Open `index.html` in your browser.
2. Enter a city name and click the search button to view weather.
3. Click on any city in the "Weather in Major Cities" section for quick info.
4. Use the map button to pick a city by location.
5. Toggle dark mode using the button in the top-right corner.

## Tech Stack

- HTML, CSS (Tailwind CSS), JavaScript (Vanilla)
- OpenWeatherMap API for weather and AQI
- Leaflet.js and OpenStreetMap for map-based city selection

## Credits

- Weather data by [OpenWeatherMap](https://openweathermap.org/)
- Map by [OpenStreetMap](https://www.openstreetmap.org/) and [Leaflet.js](https://leafletjs.com/)

 
