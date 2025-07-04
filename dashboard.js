// Weather Dashboard JS - Cool, Minimal, Modern

// ====== CONFIG ======
const API_KEY = "6730bc5adb6ff3171a98134e5b3016ce"; // <-- Replace with your API key

// ====== DOM ======
const html = document.documentElement; // Get the root <html> element of the page
const darkModeToggle = document.getElementById("darkModeToggle"); // Get the dark mode toggle button by its ID
const searchBtn = document.getElementById("searchBtn"); // Get the search button by its ID
const citySearch = document.getElementById("citySearch"); // Get the city search input box by its ID
const historyDiv = document.getElementById("history"); // Get the search history container by its ID
const searchLoader = document.getElementById("searchLoader"); // Get the search loader spinner by its ID

// ====== DARK MODE ======
// Check if dark mode should be enabled (either saved in localStorage or preferred by system)
if (
  localStorage.getItem("darkMode") === "true" || // If user previously chose dark mode
  (!localStorage.getItem("darkMode") &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) // Or if no choice saved, but system prefers dark
)
  html.classList.add("dark"); // Add the 'dark' class to <html> to enable dark mode
// Add a click event to the dark mode toggle button
// When clicked, toggle the 'dark' class and save the preference
// Also add a blue ring effect for feedback
// Remove the ring after 400ms
darkModeToggle.addEventListener("click", () => {
  html.classList.toggle("dark"); // Toggle dark mode class
  localStorage.setItem("darkMode", html.classList.contains("dark")); // Save preference to localStorage
  darkModeToggle.classList.add("ring-4", "ring-blue-300"); // Add ring effect
  setTimeout(
    () => darkModeToggle.classList.remove("ring-4", "ring-blue-300"), // Remove ring after 400ms
    400
  );
});

// ====== LIVE CLOCK ======
function updateDateTime() {
  // Get the current date and time
  const now = new Date();
  // Arrays for day and month names
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
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
  // Set the current day name
  document.getElementById("currentDay").textContent = days[now.getDay()];
  // Set the current date in 'Month Day, Year' format
  document.getElementById("currentDate").textContent = `${months[now.getMonth()]
    } ${now.getDate()}, ${now.getFullYear()}`;
  // Set the current time in 12-hour format with AM/PM
  document.getElementById("currentTime").textContent = now.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true }
  );
}
updateDateTime(); // Set the date and time immediately on page load
setInterval(updateDateTime, 1000); // Update the date and time every second

// ====== SEARCH HISTORY ======
function saveHistory(city) {
  // Save a searched city to the search history in localStorage
  let hist = JSON.parse(localStorage.getItem("weatherHistory") || "[]"); // Get history as array, or empty if none
  hist = hist.filter((c) => c.toLowerCase() !== city.toLowerCase()); // Remove duplicates (case-insensitive)
  hist.unshift(city); // Add the new city to the start of the array
  if (hist.length > 10) hist = hist.slice(0, 10); // Keep only the last 10 cities
  localStorage.setItem("weatherHistory", JSON.stringify(hist)); // Save updated history to localStorage
  renderHistory(); // Update the history display on the page
}
function renderHistory() {
  // Show the search history as clickable buttons
  let hist = JSON.parse(localStorage.getItem("weatherHistory") || "[]"); // Get history array
  if (hist.length === 0) {
    historyDiv.innerHTML = ""; // If no history, clear the display
    return;
  }
  // Create a button for each city and a clear button
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
  // Add click events to each city button to trigger a search
  Array.from(historyDiv.getElementsByClassName("city-history-btn")).forEach(
    (btn, i) =>
    (btn.onclick = () => {
      citySearch.value = hist[i]; // Set the search box to the city name
      searchWeather(); // Search for that city
    })
  );
  // Add click event to the clear button to erase history
  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn)
    clearBtn.onclick = () => {
      localStorage.removeItem("weatherHistory"); // Remove history from storage
      renderHistory(); // Update the display
    };
}
renderHistory(); // Show the history when the page loads

// ====== WEATHER API ======
async function searchWeather(cityArg) {
  // Main function to search for weather for a city
  const city = typeof cityArg === "string" ? cityArg : citySearch.value.trim(); // Use argument or input value
  if (!city) return; // If no city, do nothing
  searchBtn.classList.add("animate-spin"); // Show loading animation on search button
  if (searchLoader) searchLoader.classList.remove("hidden"); // Show loader spinner
  try {
    // Fetch weather data from OpenWeatherMap API
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) {
      // If the response is not OK, handle errors
      let msg = "City not found!";
      if (res.status === 401) msg = "API key invalid or not activated.";
      if (res.status === 429)
        msg = "API quota exceeded. Please try again later.";
      throw new Error(msg); // Throw error to be caught below
    }
    const d = await res.json(); // Parse the JSON response
    // Update the UI with weather data
    document.getElementById("location").textContent =
      d.name + (d.sys.country ? ", " + d.sys.country : ""); // Show city and country
    document.getElementById("currentTemp").textContent =
      Math.round(d.main.temp) + "°C"; // Show current temperature
    document.getElementById("weatherDesc").textContent =
      d.weather[0].description.replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize description
    document.getElementById("minTemp").textContent =
      Math.round(d.main.temp_min) + "°C"; // Show min temperature
    document.getElementById("maxTemp").textContent =
      Math.round(d.main.temp_max) + "°C"; // Show max temperature
    document.getElementById("windSpeed").textContent =
      Math.round(d.wind.speed) + " km/h"; // Show wind speed
    document.getElementById("humidity").textContent = d.main.humidity + "%"; // Show humidity
    document.getElementById("feelsLike").textContent =
      Math.round(d.main.feels_like) + "°C"; // Show feels like temperature
    document.getElementById("pressure").textContent = d.main.pressure + " hPa"; // Show pressure
    document.getElementById("sunrise").textContent = new Date(
      d.sys.sunrise * 1000
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Show sunrise time
    document.getElementById("sunset").textContent = new Date(
      d.sys.sunset * 1000
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Show sunset time
    document.getElementById("visibility").textContent =
      (d.visibility / 1000).toFixed(1) + " km"; // Show visibility in km
    // Fetch Air Quality Index (AQI)
    const lat = d.coord.lat,
      lon = d.coord.lon; // Get latitude and longitude
    let aqi = "-"; // Default AQI value
    try {
      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        if (
          aqiData &&
          aqiData.list &&
          aqiData.list[0] &&
          aqiData.list[0].main &&
          aqiData.list[0].main.aqi
        ) {
          const aqiVal = aqiData.list[0].main.aqi; // Get AQI value
          const aqiLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"]; // AQI levels
          aqi = `${aqiVal} (${aqiLevels[aqiVal - 1]})`; // Format AQI string
        }
      }
    } catch { } // Ignore AQI errors
    document.getElementById("aqi").textContent = aqi; // Show AQI
    // Show weather icon
    const icon = d.weather[0].icon; // Get icon code
    document.getElementById(
      "weatherIcon"
    ).innerHTML = `<img src='https://openweathermap.org/img/wn/${icon}@4x.png' alt='icon' class='w-full h-full drop-shadow-xl animate-fade-in'/>`;
    saveHistory(d.name); // Save city to history
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
  if (e.key === "Enter") searchWeather(); // When Enter is pressed in the input, search
});

// ====== CARD HOVER EFFECTS ======
document.querySelectorAll(".card-hover").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-5px) scale(1.02)"; // Move and scale card on hover
    card.classList.add("ring-2", "ring-blue-200", "dark:ring-blue-700"); // Add blue ring
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0) scale(1)"; // Reset card position
    card.classList.remove("ring-2", "ring-blue-200", "dark:ring-blue-700"); // Remove ring
  });
});

// ====== GLOBAL CITIES WEATHER ======
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
]; // List of major cities

async function fetchCityWeather(city, country) {
  // Fetch weather for a city and country
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )},${country}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Not found"); // If not found, throw error
    return await res.json(); // Return the weather data
  } catch {
    return null; // On error, return null
  }
}

async function renderGlobalCitiesWeather() {
  // Show weather cards for all major cities
  const grid = document.getElementById("citiesWeatherGrid"); // Get the grid container
  if (!grid) return; // If not found, do nothing
  grid.innerHTML =
    '<div class="col-span-full text-center text-gray-400 dark:text-gray-500">Loading...</div>';
  // Show loading text
  const results = await Promise.all(
    majorCities.map((c) => fetchCityWeather(c.name, c.country))
  ); // Fetch weather for all cities in parallel
  grid.innerHTML = results
    .map((d, i) => {
      const cityName = majorCities[i].name; // Get city name
      if (!d)
        return `<div class='glass rounded-2xl p-5 text-center card-hover opacity-60 cursor-not-allowed'><div class='text-lg font-semibold mb-2'>${cityName}</div><div class='text-red-400'>N/A</div></div>`; // Show N/A if not found
      const icon = d.weather[0].icon; // Get weather icon
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
    .join(""); // Create a card for each city
  // Add click events to each city card
  Array.from(document.getElementsByClassName("city-weather-card")).forEach(
    (card) => {
      card.onclick = function () {
        const city = this.getAttribute("data-city"); // Get city name
        if (window.citySearch && window.searchWeather) {
          window.citySearch.value = city; // Set search box to city
          window.searchWeather(); // Search for that city
          window.citySearch.blur(); // Remove focus from input
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
  renderGlobalCitiesWeather(); // Show global cities weather
  searchWeather("Kolhapur"); // Show Kolhapur weather by default
});

// ====== INIT ======
window.citySearch = citySearch; // Make citySearch input available globally
window.searchWeather = searchWeather; // Make searchWeather function available globally
