import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAtlanticStations } from "../hooks/useAtlanticStations";
import { INDIAN_PORTS } from "../data/indianPorts";
import { GLOBAL_PORTS } from "../data/globalPorts";
import { annotatePorts, VERDICT_STYLE } from "../utils/portAdvisory";

const RISK_STYLE = {
  Warning: { fill: "#ff3b30", stroke: "#7a0d08", radius: 7 },
  Watch: { fill: "#fbf7ee", stroke: "#ff9d0a", radius: 5 },
};

function styleFor(label) {
  return RISK_STYLE[label] || { fill: "#38bdf8", stroke: "#0369a1", radius: 5 };
}

const WORLD_PORTS = [...INDIAN_PORTS, ...GLOBAL_PORTS];

function SatellitePanel() {
  const { latestStations, loading } = useAtlanticStations();
  const [showPorts, setShowPorts] = useState(true);

  const worldPorts = useMemo(() => annotatePorts(WORLD_PORTS, latestStations), [latestStations]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div>
          <h2 className="text-3xl font-bold">🛰️ Satellite View</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real Esri satellite imagery of the whole globe, overlaid with live heatwave monitoring stations and{" "}
            {worldPorts.length} fishing ports worldwide.
          </p>
        </div>
        <button
          onClick={() => setShowPorts((v) => !v)}
          className={
            "text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap shrink-0 " +
            (showPorts ? "bg-[#c9a962] text-[#0a141b]" : "bg-slate-900/60 text-slate-300")
          }
        >
          {showPorts ? "✓ " : ""}Fishing Ports Overlay
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading imagery and station data…</p>
      ) : (
        <MapContainer
          center={[10, 20]}
          zoom={2}
          minZoom={2}
          maxZoom={14}
          style={{ height: "520px", width: "100%", background: "#0a141b" }}
          worldCopyJump
        >
          <TileLayer
            attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {latestStations.map((r, idx) => {
            const style = styleFor(r.Heatwave_Risk);
            return (
              <CircleMarker
                key={`hw-${r.Latitude}-${r.Corrected_Lon}-${idx}`}
                center={[r.Latitude, r.Corrected_Lon]}
                radius={style.radius}
                pathOptions={{ color: style.stroke, fillColor: style.fill, fillOpacity: 0.9, weight: 1.5 }}
              >
                <Popup>
                  <div className="text-sm text-slate-800">
                    <p className="font-bold mb-1">
                      {r.Heatwave_Risk === "Warning" ? "🔴 Heatwave Warning" : "⚪ Heatwave Watch"}
                    </p>
                    <p>SST: {Number(r.Sea_Surface_Temperature).toFixed(2)}°C</p>
                    <p>Anomaly: +{Number(r.SST_Anomaly).toFixed(2)}°C</p>
                    <p>Date: {r.Date}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {showPorts && (
            <LayerGroup>
              {worldPorts.map((p) => {
                const style = VERDICT_STYLE[p.verdict];
                return (
                  <CircleMarker
                    key={`port-${p.name}`}
                    center={[p.lat, p.lon]}
                    radius={4.5}
                    pathOptions={{ color: style.color, fillColor: style.color, fillOpacity: 0.85, weight: 1 }}
                  >
                    <Tooltip direction="top" offset={[0, -4]}>
                      {p.name}
                    </Tooltip>
                    <Popup>
                      <div className="text-sm text-slate-800">
                        <p className="font-bold mb-1">{p.name}</p>
                        <p className="mb-1">{style.label}</p>
                        <p className="text-xs">{p.reason}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </LayerGroup>
          )}
        </MapContainer>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Imagery: Esri World Imagery (Esri, Maxar, Earthstar Geographics) — real satellite photography, not a stylized
        map. Heatwave markers reflect the latest Atlantic monitoring snapshot; the fishing-ports overlay covers every
        continent (toggle it off above for imagery alone).
      </p>
    </div>
  );
}

export default SatellitePanel;
