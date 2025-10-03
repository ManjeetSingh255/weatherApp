import React, { useState } from "react";
import "./Weather.css";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const getWeather = async () => {
    if (!city) {
      setError("Please enter a city name!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
        setError("");
      } else {
        setError(data.message);
        setWeather(null);
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-container">
      <h1>Weather App</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getWeather()}
        />
        <button onClick={getWeather}>Get Weather</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading...</p>}

      {weather && (
        <div className="cards-row">
          {/* Temperature Card */}
          <div className="weather-card temp-card">
            <h3>Temperature</h3>
            <p className="icon">🌡️</p>
            <p className="main">{weather.main.temp}°C</p>
            <p>Feels like: {weather.main.feels_like}°C</p>
            <p>Min: {weather.main.temp_min}°C / Max: {weather.main.temp_max}°C</p>
          </div>

          {/* Condition Card */}
          <div className="weather-card condition-card">
            <h3>Condition</h3>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="weather-icon"
            />
            <p className="main">{weather.weather[0].main}</p>
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
          </div>

          {/* Wind Card */}
          <div className="weather-card wind-card">
            <h3>Wind</h3>
            <p className="icon">💨</p>
            <p className="main">{weather.wind.speed} m/s</p>
            <p>Direction: {weather.wind.deg}°</p>
            <p>Pressure: {weather.main.pressure} hPa</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;
