import React from "react";

function WeatherCard({ title, icon, primary, className = "" }) {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-label">{title}</div>
      <div className="metric-value">{primary}</div>
    </div>
  );
}

export default WeatherCard;
