import { useEffect, useState } from "react";

function LiveWeatherPanel() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=19.07&longitude=72.87&current=temperature_2m,wind_speed_10m"
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.current);
      });
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-6">
        🌡 Live Weather API
      </h2>

      {!weather ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">

          <div className="flex justify-between">
            <span>Temperature</span>
            <span>{weather.temperature_2m}°C</span>
          </div>

          <div className="flex justify-between">
            <span>Wind Speed</span>
            <span>{weather.wind_speed_10m} km/h</span>
          </div>

          <div className="flex justify-between">
            <span>Location</span>
            <span>Mumbai Coast</span>
          </div>

        </div>
      )}
    </div>
  );
}

export default LiveWeatherPanel;