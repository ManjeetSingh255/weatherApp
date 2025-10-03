import React from "react";
import "./WeatherCard.css"; // Optional separate CSS or use main CSS

function WeatherCard({ title, icon, children }) {
  return (
    <div className="weather-card">
      <h3>{title}</h3>
      {icon && <img src={icon} alt={title} />}
      <div className="card-content">{children}</div>
    </div>
  );
}

export default WeatherCard;
