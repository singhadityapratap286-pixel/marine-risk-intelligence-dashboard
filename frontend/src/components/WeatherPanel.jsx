function WeatherPanel() {
  const weather = [
    { day: "Mon", temp: "29°C", icon: "☀️", wind: "18 km/h" },
    { day: "Tue", temp: "28°C", icon: "🌤️", wind: "22 km/h" },
    { day: "Wed", temp: "27°C", icon: "🌧️", wind: "35 km/h" },
    { day: "Thu", temp: "30°C", icon: "☀️", wind: "16 km/h" },
    { day: "Fri", temp: "29°C", icon: "⛅", wind: "20 km/h" },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">
        🌦 Marine Weather Forecast
      </h2>

      <div className="grid grid-cols-5 gap-4">
        {weather.map((item, index) => (
          <div
            key={index}
            className="bg-slate-700 rounded-lg p-4 text-center"
          >
            <h3 className="font-semibold">{item.day}</h3>
            <div className="text-4xl my-3">{item.icon}</div>
            <p>{item.temp}</p>
            <p className="text-sm text-gray-300 mt-2">
              💨 {item.wind}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherPanel;