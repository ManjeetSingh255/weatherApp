
import React from "react";
import Weather from "./weather";   // import your Weather component
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>🌤️ Weather App</h1>
      <Weather />
    </div>
  );
}

export default App;
