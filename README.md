# WeatherNow

WeatherNow is a premium React weather application that auto-detects your current location, shows real-time weather, and provides a polished five-day forecast experience.

## Features

- Auto-detect local weather using browser geolocation
- Manually search weather for any city
- Displays current temperature, feels-like, humidity, wind, visibility, and UV index
- Responsive modern UI with glassmorphism styling and dynamic background themes
- Smooth loading and error states

## Live Deployment
The app is hosted from the GitHub repository and can be deployed using a static hosting service connected to the `main` branch.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ManjeetSingh255/weatherApp.git
   cd weatherApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your OpenWeatherMap API key:
   ```env
   VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
   ```

4. Start development server:
   ```bash
   npm start
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Notes

- The app uses Vite for development and build tooling.
- For deployment, connect the repo to a hosting provider like Vercel, Netlify, or GitHub Pages.

## Author

Built by Manjeet Singh
