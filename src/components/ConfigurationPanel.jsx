import { useState } from "react";

export default function ConfigurationPanel() {
  const [config, setConfig] = useState({
    temperature: 30,
    waveHeight: 4,
    windSpeed: 45,
    refresh: 30,
    alert: "High",
    autoRefresh: true,
    darkMode: true,
  });

  const update = (key, value) =>
    setConfig({ ...config, [key]: value });

  const save = () => {
    localStorage.setItem("marine-config", JSON.stringify(config));
    alert("Configuration Saved!");
  };

  const reset = () => {
    const defaults = {
      temperature: 30,
      waveHeight: 4,
      windSpeed: 45,
      refresh: 30,
      alert: "High",
      autoRefresh: true,
      darkMode: true,
    };
    setConfig(defaults);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-2">⚙️ Configuration</h2>
      <p className="text-slate-400 mb-8">
        Configure AI Marine Risk Dashboard settings
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block mb-2">Temperature Threshold (°C)</label>
          <input className="w-full p-3 rounded bg-slate-900"
            type="number"
            value={config.temperature}
            onChange={(e)=>update("temperature",e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2">Wave Height Limit (m)</label>
          <input className="w-full p-3 rounded bg-slate-900"
            type="number"
            value={config.waveHeight}
            onChange={(e)=>update("waveHeight",e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2">Wind Speed Limit (km/h)</label>
          <input className="w-full p-3 rounded bg-slate-900"
            type="number"
            value={config.windSpeed}
            onChange={(e)=>update("windSpeed",e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2">Refresh Rate (seconds)</label>
          <input className="w-full p-3 rounded bg-slate-900"
            type="number"
            value={config.refresh}
            onChange={(e)=>update("refresh",e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2">Alert Level</label>
          <select
            className="w-full p-3 rounded bg-slate-900"
            value={config.alert}
            onChange={(e)=>update("alert",e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between bg-slate-900 p-3 rounded">
            Auto Refresh
            <input
              type="checkbox"
              checked={config.autoRefresh}
              onChange={(e)=>update("autoRefresh",e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between bg-slate-900 p-3 rounded">
            Dark Mode
            <input
              type="checkbox"
              checked={config.darkMode}
              onChange={(e)=>update("darkMode",e.target.checked)}
            />
          </label>
        </div>

      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={save}
          className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-bold"
        >
          Save Configuration
        </button>

        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
