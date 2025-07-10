//   CONFIG  
const API_KEY = '0ea9e6853472a66eb4e99597c797b87e'; //   OpenWeatherMap API key
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5'; // Base URL for weather API
const AQI_API_BASE = 'https://api.openweathermap.org/data/2.5'; // Base URL for air quality API

// DOM 
const html = document.documentElement; // The <html> tag of the page
const darkModeToggle = document.getElementById("darkModeToggle"); // Button to switch dark mode
const searchBtn = document.getElementById("searchBtn"); // Button to search for weather
const citySearch = document.getElementById("citySearch"); // Input box for city name
const historyDiv = document.getElementById("history"); // Where search history is shown
const searchLoader = document.getElementById("searchLoader"); // Loader spinner for search

// DARK MODE 
// Check if dark mode should be on (user's choice or system preference)
if (
  localStorage.getItem("darkMode") === "true" || // User chose dark mode before
  (!localStorage.getItem("darkMode") &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) // Or system prefers dark
)
  html.classList.add("dark"); // Turn on dark mode
// When the dark mode button is clicked, switch modes and save the choice
// Also show a blue ring for a short time as feedback
// Remove the ring after 400ms
darkModeToggle.addEventListener("click", () => {
  html.classList.toggle("dark"); // Switch dark mode on/off
  localStorage.setItem("darkMode", html.classList.contains("dark")); // Save choice
  darkModeToggle.classList.add("ring-4", "ring-blue-300"); // Show blue ring
  setTimeout(
    () => darkModeToggle.classList.remove("ring-4", "ring-blue-300"), // Remove ring
    400
  );
});

// LIVE CLOCK 
function updateDateTime() {
  // Show the current day, date, and time on the page
  const now = new Date(); // Get current date and time
  const days = [// Day names
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]; 
  const months = [ // Month names
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]; 
  document.getElementById("currentDay").textContent = days[now.getDay()]; // Show day
  document.getElementById("currentDate").textContent = `${months[now.getMonth()] } ${now.getDate()}, ${now.getFullYear()}`; // Show date
  document.getElementById("currentTime").textContent = now.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true }// Show time
  ); 
}
updateDateTime(); // Show time right away
setInterval(updateDateTime, 1000); // Update every second

// SEARCH HISTORY 
function saveHistory(city) {
  // Save the city to search history  - in localStorage 
  let hist = JSON.parse(localStorage.getItem("weatherHistory") || "[]"); // Get history or empty
  hist = hist.filter((c) => c.toLowerCase() !== city.toLowerCase()); // Remove duplicates
  hist.unshift(city); // Add new city to the start
  if (hist.length > 10) hist = hist.slice(0, 10); // Keep only 10 cities
  localStorage.setItem("weatherHistory", JSON.stringify(hist)); // Save back to storage
  renderHistory(); // Update the history shown on the page
}
function renderHistory() {
  // Show the search history as buttons
  let hist = JSON.parse(localStorage.getItem("weatherHistory") || "[]"); // Get history
  if (hist.length === 0) {
    historyDiv.innerHTML = ""; 
    return;
  }
  // Make a button for each city and a clear button
  historyDiv.innerHTML = `
    <div class='flex flex-wrap gap-2 items-center'>
      ${hist
      .map(
        (city) => `
        <button class='flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm hover:scale-105 transition-all city-history-btn' title='Search ${city}'>
          <svg class='w-3.5 h-3.5 text-blue-400 dark:text-blue-200' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M12 8v4l3 3'/></svg>
          ${city}
        </button>
      `
      )
      .join("")}
      <button id='clearHistoryBtn' class='ml-2 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-semibold shadow-sm hover:bg-red-200 dark:hover:bg-red-800 transition-all'>Clear</button>
    </div>
  `;
  // Add click events to each city button to search for that city
  Array.from(historyDiv.getElementsByClassName("city-history-btn")).forEach(
    (btn, i) =>
    (btn.onclick = () => {
      citySearch.value = hist[i]; // Put city name in the input
      searchWeather(); // Search for that city
    })
  );
  // Add click event to clear button to erase history
  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn)
    clearBtn.onclick = () => {
      localStorage.removeItem("weatherHistory"); // Remove all history
      renderHistory(); // Update display
    };
}
renderHistory(); // Show history when page loads

// WEATHER API 
async function searchWeather(cityArg) {
  // Main function to search for weather for a city
  const city = typeof cityArg === "string" ? cityArg : citySearch.value.trim(); // Use argument or input value
  if (!city) return; // If no city, do nothing
  searchBtn.classList.add("animate-spin"); // Show loading animation
  if (searchLoader) searchLoader.classList.remove("hidden"); // Show loader spinner
  try {
         const weatherUrl = `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const weatherRes = await fetch(weatherUrl); // Fetch weather data
    
    if (!weatherRes.ok) {
      // If the response is not OK, handle errors
      let msg = "City not found!";
      if (weatherRes.status === 401) msg = "API key invalid or not activated.";
      if (weatherRes.status === 429)
        msg = "API quota exceeded. Please try again later.";
      throw new Error(msg); // Show error message
    }
    
    const weatherData = await weatherRes.json(); // Get weather data as JSON
    
    // Fetch air quality data (AQI)
    let aqiData = null;
    try {
      const aqiUrl = `${AQI_API_BASE}/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`;
      const aqiRes = await fetch(aqiUrl); // Fetch AQI data
      if (aqiRes.ok) {
        aqiData = await aqiRes.json(); // Get AQI data as JSON
      }
    } catch (aqiError) {
      console.log("AQI data not available:", aqiError); // If AQI fails, just log
    }
    
    // Update the page with weather data
    document.getElementById("location").textContent =
      weatherData.name + (weatherData.sys.country ? ", " + weatherData.sys.country : ""); // City, Country
    document.getElementById("currentTemp").textContent =
      Math.round(weatherData.main.temp) + "°C"; // Current temperature
    document.getElementById("weatherDesc").textContent =
      weatherData.weather[0].description.replace(/\b\w/g, (l) => l.toUpperCase()); // Description
    document.getElementById("minTemp").textContent =
      Math.round(weatherData.main.temp_min) + "°C"; // Min temp
    document.getElementById("maxTemp").textContent =
      Math.round(weatherData.main.temp_max) + "°C"; // Max temp
    document.getElementById("windSpeed").textContent =
      Math.round(weatherData.wind.speed) + " km/h"; // Wind speed
    document.getElementById("humidity").textContent = weatherData.main.humidity + "%"; // Humidity
    document.getElementById("feelsLike").textContent =
      Math.round(weatherData.main.feels_like) + "°C"; // Feels like
    document.getElementById("pressure").textContent = weatherData.main.pressure + " hPa"; // Pressure
    document.getElementById("sunrise").textContent = new Date(
      weatherData.sys.sunrise * 1000
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Sunrise
    document.getElementById("sunset").textContent = new Date(
      weatherData.sys.sunset * 1000
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Sunset
    document.getElementById("visibility").textContent =
      (weatherData.visibility / 1000).toFixed(1) + " km"; // Visibility
    // AQI
    let aqi = "-";
    if (aqiData && aqiData.list && aqiData.list[0] && aqiData.list[0].main && aqiData.list[0].main.aqi) {
      const aqiVal = aqiData.list[0].main.aqi;
      const aqiLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
      aqi = `${aqiVal} (${aqiLevels[aqiVal - 1]})`;
    }
    document.getElementById("aqi").textContent = aqi; // Show AQI
    // Show weather icon
    const icon = weatherData.weather[0].icon; // Icon code
    document.getElementById(
      "weatherIcon"
    ).innerHTML = `<img src='https://openweathermap.org/img/wn/${icon}@4x.png' alt='icon' class='w-full h-full drop-shadow-xl animate-fade-in'/>`;
    saveHistory(weatherData.name); // Save city to history
    // Animate the main card for fun
    document.querySelector("main").classList.add("animate-pulse");
    setTimeout(
      () => document.querySelector("main").classList.remove("animate-pulse"),
      700
    );
  } catch (e) {
    // If there was an error, show a red question mark and alert
    document.getElementById(
      "weatherIcon"
    ).innerHTML = `<span class='text-red-500 text-3xl animate-bounce'>?</span>`;
    alert(e.message || "City not found!");
    return;
  } finally {
    // Always stop the loading animation
    searchBtn.classList.remove("animate-spin");
    if (searchLoader) searchLoader.classList.add("hidden");
  }
}
searchBtn.onclick = searchWeather; // When search button is clicked, search for weather
citySearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWeather(); // When Enter is pressed, search
});

// CARD HOVER EFFECTS 
document.querySelectorAll(".card-hover").forEach((card) => {
  // Make cards pop up a bit and glow when hovered
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-5px) scale(1.02)"; // Move and scale
    card.classList.add("ring-2", "ring-blue-200", "dark:ring-blue-700"); // Blue ring
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0) scale(1)"; // Reset
    card.classList.remove("ring-2", "ring-blue-200", "dark:ring-blue-700"); // Remove ring
  });
});

// GLOBAL CITIES WEATHER 
const majorCities = [
  { name: "Mumbai", country: "IN" },
  { name: "Delhi", country: "IN" },
  { name: "Bangalore", country: "IN" },
  { name: "Chennai", country: "IN" },
  { name: "Kolkata", country: "IN" },
  { name: "New York", country: "US" },
  { name: "London", country: "GB" },
  { name: "Tokyo", country: "JP" },
  { name: "Paris", country: "FR" },
  { name: "Sydney", country: "AU" },
]; // List of big cities

async function fetchCityWeather(city, country) {
  // Get weather for a city and country
  try {
    const url = `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}${country ? `,${encodeURIComponent(country)}` : ''}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url); // Fetch weather
    if (!res.ok) throw new Error("Not found"); // If not found, error
    const weatherData = await res.json(); // Get data
    return weatherData;
  } catch {
    return null; // On error, return null
  }
}

async function renderGlobalCitiesWeather() {
  // Show weather cards for all big cities
  const grid = document.getElementById("citiesWeatherGrid"); // The grid
  if (!grid) return; // If not found, do nothing
  grid.innerHTML =
    '<div class="col-span-full text-center text-gray-400 dark:text-gray-500">Loading...</div>';
  // Show loading text
  const results = await Promise.all(
    majorCities.map((c) => fetchCityWeather(c.name, c.country))
  ); // Get weather for all cities at once
  grid.innerHTML = results
    .map((d, i) => {
      const cityName = majorCities[i].name; // City name
      if (!d)
        return `<div class='glass rounded-2xl p-5 text-center card-hover opacity-60 cursor-not-allowed'><div class='text-lg font-semibold mb-2'>${cityName}</div><div class='text-red-400'>N/A</div></div>`; // Show N/A if not found
      const icon = d.weather[0].icon; // Weather icon
      return `<div class='glass rounded-2xl p-5 text-center card-hover transition-all cursor-pointer city-weather-card' data-city='${cityName}'>
      <div class='flex flex-col items-center mb-2'>
        <img src='https://openweathermap.org/img/wn/${icon}@2x.png' alt='icon' class='w-14 h-14 mb-1'/>
        <div class='text-xl font-bold text-gray-800 dark:text-gray-200'>${Math.round(
        d.main.temp
      )}°C</div>
      </div>
      <div class='text-blue-700 dark:text-blue-300 font-semibold mb-1'>${cityName}</div>
      <div class='text-gray-500 dark:text-gray-400 text-sm mb-1'>${d.weather[0].main
        }</div>
      <div class='text-xs text-gray-400 dark:text-gray-500'>${d.sys.country
        }</div>
    </div>`;
    })
    .join(""); // Make a card for each city
  // Add click events to each city card
  Array.from(document.getElementsByClassName("city-weather-card")).forEach(
    (card) => {
      card.onclick = function () {
        const city = this.getAttribute("data-city"); // Get city name
        if (window.citySearch && window.searchWeather) {
          window.citySearch.value = city; // Put city in input
          window.searchWeather(); // Search for that city
          window.citySearch.blur(); // Remove focus
          window.scrollTo({
            top: document.querySelector("main").offsetTop - 40,
            behavior: "smooth",
          }); // Scroll to main card
        }
      };
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  // When the page loads
  renderGlobalCitiesWeather(); // Show big cities weather
  searchWeather("Kolhapur"); // Show Kolhapur weather by default
});

// INIT 
window.citySearch = citySearch; // Make citySearch input available everywhere
window.searchWeather = searchWeather; // Make searchWeather function available everywhere