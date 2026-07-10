import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import { INDIAN_PORTS } from "./data/indianPorts";
import { GLOBAL_PORTS } from "./data/globalPorts";
import { annotatePorts, VERDICT_STYLE } from "./utils/portAdvisory";

// Styling matched to the reference QGIS export: light basemap, hollow
// off-white "Watch" markers with a dark red outline, solid red "Warning" dots.
const RISK_STYLE = {
  Warning: { fill: "#e0332a", stroke: "#7a0d08", radius: 7 },
  Watch: { fill: "#fbf7ee", stroke: "#c0392b", radius: 5 },
};

function styleFor(label) {
  return RISK_STYLE[label] || { fill: "#38bdf8", stroke: "#0369a1", radius: 5 };
}

const WORLD_PORTS = [...INDIAN_PORTS, ...GLOBAL_PORTS];

function MapSection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Papa.parse("/data/atlantic_heatwaves.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const clean = (results.data || []).filter(
          (r) =>
            r.Date &&
            typeof r.Latitude === "number" &&
            typeof r.Corrected_Lon === "number"
        );
        if (!clean.length) {
          setError("No valid rows were found in the dataset.");
        }
        setRows(clean);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
  }, []);

  const dates = useMemo(
    () => [...new Set(rows.map((r) => r.Date))].sort(),
    [rows]
  );
  const latestDate = dates[dates.length - 1];

  const latestStations = useMemo(
    () => rows.filter((r) => r.Date === latestDate),
    [rows, latestDate]
  );

  const warningCount = latestStations.filter((r) => r.Heatwave_Risk === "Warning").length;
  const watchCount = latestStations.filter((r) => r.Heatwave_Risk === "Watch").length;

  const worldPorts = useMemo(() => annotatePorts(WORLD_PORTS, latestStations), [latestStations]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🌍 Global GIS Risk Map</h2>
        <p className="text-slate-400">Loading marine heatwave dataset…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🌍 Global GIS Risk Map</h2>
        <p className="text-red-400">Failed to load map data: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold">🌍 Global GIS Risk Map</h2>
          <p className="text-sm text-slate-400 mt-1">
            {latestStations.length} Atlantic monitoring stations · {worldPorts.length} fishing ports worldwide · Snapshot: {latestDate}
          </p>
        </div>

        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg">
            <span
              className="w-3 h-3 rounded-full inline-block border"
              style={{ background: RISK_STYLE.Warning.fill, borderColor: RISK_STYLE.Warning.stroke }}
            />
            Warning ({warningCount})
          </span>
          <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg">
            <span
              className="w-3 h-3 rounded-full inline-block border"
              style={{ background: RISK_STYLE.Watch.fill, borderColor: RISK_STYLE.Watch.stroke }}
            />
            Watch ({watchCount})
          </span>
        </div>
      </div>

      <MapContainer
        center={[5, -15]}
        zoom={3}
        minZoom={2}
        maxZoom={12}
        style={{ height: "480px", width: "100%", background: "#eef2f5" }}
        worldCopyJump
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Light (GIS style)">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Streets">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name={`Global Fishing Ports (${worldPorts.length})`}>
            <LayerGroup>
              {worldPorts.map((p) => {
                const style = VERDICT_STYLE[p.verdict];
                return (
                  <CircleMarker
                    key={`port-${p.name}`}
                    center={[p.lat, p.lon]}
                    radius={5}
                    pathOptions={{ color: style.color, fillColor: style.color, fillOpacity: 0.8, weight: 1.2 }}
                  >
                    <Tooltip direction="top" offset={[0, -5]}>
                      {p.name}
                    </Tooltip>
                    <Popup>
                      <div className="text-sm text-slate-800">
                        <p className="font-bold mb-1">{p.name}</p>
                        <p className="mb-1">{style.label}</p>
                        <p className="text-xs">{p.reason}</p>
                        <p className="text-xs mt-2 text-slate-500">
                          {p.source === "live" ? "🛰️ Live monitoring station" : "📈 Modeled climatology estimate"}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {latestStations.map((r, idx) => {
          const style = styleFor(r.Heatwave_Risk);
          return (
            <CircleMarker
              key={`${r.Latitude}-${r.Corrected_Lon}-${idx}`}
              center={[r.Latitude, r.Corrected_Lon]}
              radius={style.radius}
              pathOptions={{
                color: style.stroke,
                fillColor: style.fill,
                fillOpacity: 0.9,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="text-sm text-slate-800">
                  <p className="font-bold mb-1">
                    {r.Heatwave_Risk === "Warning" ? "🔴 Heatwave Warning" : "⚪ Heatwave Watch"}
                  </p>
                  <p>Lat: {r.Latitude.toFixed(2)}, Lon: {r.Corrected_Lon.toFixed(2)}</p>
                  <p>Date: {r.Date}</p>
                  <p>SST: {Number(r.Sea_Surface_Temperature).toFixed(2)}°C</p>
                  <p>30-day Avg SST: {Number(r.Average_SST).toFixed(2)}°C</p>
                  <p>Anomaly: +{Number(r.SST_Anomaly).toFixed(2)}°C</p>
                  <p>Season: {r.Season} ({r.Hemisphere} Hemisphere)</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <p className="text-xs text-slate-500 mt-3">
        Heatwave stations: Atlantic Ocean sea-surface-temperature monitoring grid (NOAA-derived), corrected for
        antimeridian longitude wrap · {rows.length.toLocaleString()} total daily observations across{" "}
        {dates.length} days in 2024. The "Global Fishing Ports" overlay (top-right) plots {worldPorts.length} ports
        across every continent — toggle it off to see the heatwave grid alone, or switch to the Satellite layer for
        real imagery.
      </p>
    </div>
  );
}

export default MapSection;
