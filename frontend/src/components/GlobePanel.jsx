import Globe from "react-globe.gl";
import { useMemo, useState } from "react";
import { useAtlanticStations } from "../hooks/useAtlanticStations";
import { INDIAN_PORTS } from "../data/indianPorts";
import { GLOBAL_PORTS } from "../data/globalPorts";
import { annotatePorts, VERDICT_STYLE } from "../utils/portAdvisory";

const RISK_COLOR = { Warning: "#e0332a", Watch: "#fbf7ee" };
const ALL_PORTS = [...INDIAN_PORTS, ...GLOBAL_PORTS];

const VIEWS = [
  { key: "ports", label: "🎣 Global Fishing Ports" },
  { key: "stations", label: "🌡️ Heatwave Stations (Atlantic)" },
];

function GlobePanel() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [view, setView] = useState("ports");
  const { latestStations, latestDate, loading } = useAtlanticStations();

  const stationPoints = useMemo(() => {
    return latestStations.map((r) => ({
      kind: "station",
      name: `${r.lat.toFixed(1)}°, ${r.lon.toFixed(1)}°`,
      lat: r.lat,
      lng: r.lon,
      risk: r.Heatwave_Risk,
      sst: Number(r.Sea_Surface_Temperature).toFixed(2),
      anomaly: Number(r.SST_Anomaly).toFixed(2),
      date: r.Date,
      color: RISK_COLOR[r.Heatwave_Risk] || "#38bdf8",
    }));
  }, [latestStations]);

  const portPoints = useMemo(() => {
    const annotated = annotatePorts(ALL_PORTS, latestStations);
    return annotated.map((p) => ({
      kind: "port",
      name: p.name,
      lat: p.lat,
      lng: p.lon,
      verdict: p.verdict,
      reason: p.reason,
      source: p.source,
      color: VERDICT_STYLE[p.verdict]?.color || "#38bdf8",
    }));
  }, [latestStations]);

  const pointsData = view === "ports" ? portPoints : stationPoints;

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <h2 className="text-3xl font-bold">🌍 Interactive Marine Globe</h2>
          <p className="text-sm text-slate-400 mt-1">
            {view === "ports"
              ? `${portPoints.length} fishing ports across every continent — rotate and click a point for its feasibility verdict.`
              : "Atlantic heatwave monitoring stations. Red = Warning, white = Watch."}
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900/60 rounded-lg p-1 text-sm shrink-0">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => {
                setView(v.key);
                setSelectedPoint(null);
              }}
              className={
                "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap " +
                (view === v.key ? "bg-[#c9a962] text-[#0a141b] font-semibold" : "text-slate-300 hover:bg-slate-700")
              }
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[700px] rounded-xl overflow-hidden bg-black mt-4">
        {loading && view === "stations" ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            Loading globe data…
          </div>
        ) : (
          <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.02}
            pointRadius={view === "ports" ? 0.35 : 0.4}
            showAtmosphere
            atmosphereColor="lightskyblue"
            atmosphereAltitude={0.15}
            pointLabel={(d) =>
              d.kind === "port"
                ? `<div style="background:#0f172a;color:#fff;padding:8px 10px;border-radius:8px;font-size:12px;line-height:1.5;max-width:220px">
                     <b>${d.name}</b><br/>
                     ${d.verdict}<br/>
                     <span style="opacity:.8">${d.source === "live" ? "🛰️ Live station" : "📈 Modeled"}</span>
                   </div>`
                : `<div style="background:#0f172a;color:#fff;padding:8px 10px;border-radius:8px;font-size:12px;line-height:1.5">
                     <b>${d.name}</b><br/>
                     Risk: ${d.risk}<br/>
                     SST: ${d.sst}°C · Anomaly: +${d.anomaly}°C
                   </div>`
            }
            onPointClick={(point) => setSelectedPoint(point)}
          />
        )}
      </div>

      {selectedPoint && (
        <div className="mt-6 bg-slate-700 rounded-lg p-5">
          <h3 className="text-2xl font-bold">{selectedPoint.name}</h3>

          {selectedPoint.kind === "port" ? (
            <>
              <p className="mt-3">
                <b>Verdict:</b> {selectedPoint.verdict}
              </p>
              <p className="text-sm text-slate-300 mt-1">{selectedPoint.reason}</p>
              <p className="mt-2 text-xs text-slate-400">
                {selectedPoint.source === "live" ? "🛰️ Backed by a live monitoring station" : "📈 Modeled climatology estimate"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3">
                <b>Risk:</b> {selectedPoint.risk}
              </p>
              <p>
                <b>Sea Surface Temp:</b> {selectedPoint.sst}°C
              </p>
              <p>
                <b>Anomaly:</b> +{selectedPoint.anomaly}°C
              </p>
              <p>
                <b>Date:</b> {selectedPoint.date}
              </p>
            </>
          )}
          <p className="mt-1">
            <b>Latitude:</b> {selectedPoint.lat.toFixed(2)} · <b>Longitude:</b> {selectedPoint.lng.toFixed(2)}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-4">
        {view === "ports"
          ? "Ports near the Atlantic monitoring grid show a live reading; every other port worldwide shows a modeled seasonal estimate."
          : `Source: Atlantic Ocean sea-surface-temperature monitoring grid (NOAA-derived) · snapshot ${latestDate || "loading…"}.`}
      </p>
    </div>
  );
}

export default GlobePanel;
