import React, { useEffect, useMemo, useState } from "react";
import WeatherCard from "./WeatherCard";
import "./Weather.css";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || import.meta.env.REACT_APP_WEATHER_API_KEY;

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [uvIndex, setUvIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [message, setMessage] = useState("Detecting your location...");

  useEffect(() => {
    loadCurrentLocationWeather();
  }, []);

  const fetchJson = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to load weather data.");
    }
    return data;
  };

  const loadOneCallUv = async (lat, lon) => {
    try {
      const oneCall = await fetchJson(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
      );
      return oneCall.current?.uvi ?? null;
    } catch {
      return null;
    }
  };

  const loadWeatherByCoords = async (lat, lon, isCurrentLocation = false) => {
    if (!API_KEY) {
      setMessage("Missing API key. Add REACT_APP_WEATHER_API_KEY to your .env file.");
      setLoading(false);
      setLocationLoading(false);
      return;
    }

    setLoading(true);
    setMessage(isCurrentLocation ? "Loading weather for your current location..." : "Loading weather...");

    try {
      const locationData = await fetchJson(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      const currentWeather = await fetchJson(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await fetchJson(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const uv = await loadOneCallUv(lat, lon);

      const locationName = locationData?.[0]?.name || currentWeather.name || "Current location";
      setWeather({ ...currentWeather, name: locationName });
      setForecast(processForecast(forecastData));
      setUvIndex(uv);
      setMessage("");
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setUvIndex(null);
      setMessage(err.message || "Unable to load weather data.");
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const loadWeatherByCity = async () => {
    if (!city.trim()) {
      setMessage("Enter a city name to search weather.");
      return;
    }

    setLoading(true);
    setMessage(`Searching weather for ${city.trim()}...`);

    try {
      const currentWeather = await fetchJson(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await fetchJson(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${currentWeather.coord.lat}&lon=${currentWeather.coord.lon}&units=metric&appid=${API_KEY}`
      );
      const uv = await loadOneCallUv(currentWeather.coord.lat, currentWeather.coord.lon);

      setWeather(currentWeather);
      setForecast(processForecast(forecastData));
      setUvIndex(uv);
      setMessage("");
      setCity("");
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setUvIndex(null);
      setMessage(err.message || "Unable to find that city.");
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const loadCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser. Search a city manually.");
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    setLoading(true);
    setMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeatherByCoords(position.coords.latitude, position.coords.longitude, true);
      },
      () => {
        setLoading(false);
        setLocationLoading(false);
        setMessage("Location permission denied. Search a city manually or try again.");
      }
    );
  };

  const processForecast = (data) => {
    const daily = {};

    data.list.forEach((item) => {
      const dateKey = new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      if (!daily[dateKey]) {
        daily[dateKey] = {
          date: dateKey,
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          timestamp: item.dt,
        };
      } else {
        daily[dateKey].min = Math.min(daily[dateKey].min, item.main.temp_min);
        daily[dateKey].max = Math.max(daily[dateKey].max, item.main.temp_max);
        if (Math.abs(item.dt - 12 * 3600) < Math.abs(daily[dateKey].timestamp - 12 * 3600)) {
          daily[dateKey].icon = item.weather[0].icon;
          daily[dateKey].description = item.weather[0].description;
          daily[dateKey].timestamp = item.dt;
        }
      }
    });

    return Object.values(daily).slice(0, 5);
  };

  const themeClass = useMemo(() => {
    if (!weather) return "theme-default";

    const main = weather.weather?.[0]?.main?.toLowerCase() || "";
    const localHour = new Date((weather.dt + weather.timezone) * 1000).getUTCHours();
    const isNight = localHour < 6 || localHour > 18;

    if (isNight) return "theme-night";
    if (main.includes("clear")) return "theme-clear";
    if (main.includes("cloud")) return "theme-clouds";
    if (main.includes("rain") || main.includes("drizzle") || main.includes("thunder")) return "theme-rain";
    if (main.includes("snow")) return "theme-snow";
    return "theme-default";
  }, [weather]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadWeatherByCity();
  };

  return (
    <div className={themeClass}>
      <div className="header">
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <h1 className="logo-title">WeatherNow</h1>
        </div>
        <p className="logo-subtitle">Real-time weather, beautifully presented.</p>
      </div>

      <div className="search-container">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search another city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
        <button type="button" className="location-btn" onClick={loadCurrentLocationWeather}>
          📍 Use my location
        </button>
      </div>

      {message && <div className="message"><span className="message-icon">⚠️</span>{message}</div>}

      {(locationLoading || loading) && (
        <div className="loading">
          <div className="spinner">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p className="loading-text">Detecting your location...</p>
        </div>
      )}

      {weather && !locationLoading && (
        <>
          <div className="hero-card">
            <div className="hero-left">
              <p className="city-name">{weather.name}</p>
              <h2 className="weather-condition">{weather.weather[0].main}</h2>
              <p className="weather-description">{weather.weather[0].description}</p>
              <div className="divider"></div>
              <div className="temperature">
                <span>{Math.round(weather.main.temp)}°C</span>
                <span className="feels-like">Feels like {Math.round(weather.main.feels_like)}°C</span>
              </div>
            </div>
            <div className="hero-right">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
            </div>
          </div>

          <div className="metrics-grid">
            <WeatherCard title="Temperature" icon="🌡️" primary={`${Math.round(weather.main.temp)}°C`} />
            <WeatherCard title="Humidity" icon="💧" primary={`${weather.main.humidity}%`} />
            <WeatherCard title="Wind" icon="💨" primary={`${weather.wind.speed} m/s`} />
            <WeatherCard title="Visibility" icon="👁️" primary={`${(weather.visibility / 1000).toFixed(1)} km`} />
            <WeatherCard title="UV Index" icon="☀️" primary={uvIndex !== null ? uvIndex.toFixed(1) : "—"} />
          </div>

          <div className="forecast-section">
            <h3 className="forecast-title">5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((day, index) => (
                <div key={day.date} className={`forecast-card ${index === 0 ? 'today' : ''}`}>
                  <p className="forecast-day">{day.date}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                    alt={day.description}
                    className="forecast-icon"
                  />
                  <div className="forecast-temps">
                    <span className="forecast-high">{Math.round(day.max)}°</span>
                    <span className="forecast-low">{Math.round(day.min)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="footer">
        Powered by WeatherNow • Built by Manjeet Singh
      </div>
    </div>
  );
}

export default Weather;
