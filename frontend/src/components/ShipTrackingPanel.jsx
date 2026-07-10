import { useState } from "react";

// Real-time global AIS ship traffic, embedded via MarineTraffic's public,
// no-API-key embed endpoint (their documented "Embed Map" feature). This
// replaces a static, made-up ship list with actual live vessel positions
// reported by the worldwide AIS network.
const PRESETS = {
  global: { label: "🌍 Global", lat: 15, lon: 10, zoom: 2 },
  india: { label: "🇮🇳 Indian Coast", lat: 15, lon: 76, zoom: 4 },
  arabianSea: { label: "Arabian Sea", lat: 18, lon: 66, zoom: 5 },
  bayOfBengal: { label: "Bay of Bengal", lat: 15, lon: 88, zoom: 5 },
  atlantic: { label: "Atlantic", lat: 5, lon: -25, zoom: 3 },
  pacific: { label: "Pacific", lat: 10, lon: -170, zoom: 2 },
};

function buildSrc(preset, maptype) {
  return `https://www.marinetraffic.com/en/ais/embed/zoom:${preset.zoom}/centery:${preset.lat}/centerx:${preset.lon}/maptype:${maptype}/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false`;
}

function ShipTrackingPanel() {
  const [presetKey, setPresetKey] = useState("india");
  const [maptype, setMaptype] = useState(0); // 0 = map, 1 = satellite
  const preset = PRESETS[presetKey];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-3xl font-bold">🚢 Live Global Ship Traffic</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time AIS vessel positions worldwide — cargo ships, tankers, fishing vessels, and more, updated live.
          </p>
        </div>
        <button
          onClick={() => setMaptype((v) => (v === 0 ? 1 : 0))}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-900/60 text-slate-300 whitespace-nowrap shrink-0"
        >
          {maptype === 0 ? "Switch to Satellite" : "Switch to Map"}
        </button>
      </div>

      <div className="flex gap-2 bg-slate-900/60 rounded-lg p-1 text-sm flex-wrap mb-4">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setPresetKey(key)}
            className={
              "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap " +
              (presetKey === key ? "bg-[#c9a962] text-[#0a141b] font-semibold" : "text-slate-300 hover:bg-slate-700")
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: "560px" }}>
        <iframe
          key={`${presetKey}-${maptype}`}
          title="Live global ship traffic (MarineTraffic)"
          src={buildSrc(preset, maptype)}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Live map courtesy of MarineTraffic's public embeddable AIS map (no API key required). Coverage depends on
        terrestrial and satellite AIS receiver density — busy shipping lanes and coastlines show the most traffic;
        very remote ocean areas may show fewer vessels between satellite passes.
      </p>
    </div>
  );
}

export default ShipTrackingPanel;
