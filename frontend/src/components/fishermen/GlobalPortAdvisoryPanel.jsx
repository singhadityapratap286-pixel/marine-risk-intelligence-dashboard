import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, LayersControl } from "react-leaflet";
import { Search } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useAtlanticStations } from "../../hooks/useAtlanticStations";
import { annotatePorts, VERDICT_STYLE } from "../../utils/portAdvisory";

/**
 * Generic, data-driven port feasibility panel. Feed it any list of
 * { name, lat, lon, ...groupFields } and it renders: a filterable map, a
 * "every port checked" grid, and an active-alerts list — identical
 * mechanics whether the list is India's 47 harbors or the world's ~90.
 */
export default function GlobalPortAdvisoryPanel({
  ports,
  groupField, // e.g. "state" or "continent"
  groupLabel = "Region", // e.g. "State" or "Continent"
  subField, // e.g. "sea" or "country" — shown as the card's secondary line
  title,
  subtitle,
  mapCenter = [10, 20],
  mapZoom = 2,
  onSelectPort, // (annotatedPort) => void — called when a fisherman picks a port to check
  selectedName, // name of the currently selected port, for highlighting
}) {
  const { latestStations, latestDate, loading: stationsLoading } = useAtlanticStations();
  const [groupFilter, setGroupFilter] = useState("All");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => ["All", ...new Set(ports.map((p) => p[groupField]))].sort((a, b) => (a === "All" ? -1 : a.localeCompare(b))), [ports, groupField]);

  const annotated = useMemo(() => annotatePorts(ports, latestStations), [ports, latestStations]);

  const filtered = useMemo(() => {
    let list = groupFilter === "All" ? annotated : annotated.filter((p) => p[groupField] === groupFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p[subField] || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [annotated, groupFilter, groupField, query, subField]);

  const alerts = useMemo(
    () => annotated.filter((p) => p.verdict === "Not Recommended" || p.verdict === "Caution"),
    [annotated]
  );

  const liveCount = annotated.filter((p) => p.source === "live").length;

  // Auto-select a starting port so the detail check below never sits empty.
  useEffect(() => {
    if (onSelectPort && !selectedName && annotated.length) {
      onSelectPort(annotated[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotated.length]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900/60 rounded-lg px-3 py-2 whitespace-nowrap">
          {ports.length} ports · {liveCount} on live monitoring · {ports.length - liveCount} modeled
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs my-4">
        {Object.entries(VERDICT_STYLE).map(([key, s]) => (
          <span key={key} className={"px-2.5 py-1 rounded-full border " + s.badge}>
            {s.label}
          </span>
        ))}
        <span className="px-2.5 py-1 rounded-full border bg-sky-500/20 text-sky-300 border-sky-500/40">
          🛰️ Live station
        </span>
        <span className="px-2.5 py-1 rounded-full border bg-slate-500/20 text-slate-300 border-slate-500/40">
          📈 Modeled estimate
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2 bg-slate-900/60 rounded-lg p-1 text-sm flex-wrap">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={
                "px-3 py-1.5 rounded-md transition-colors " +
                (groupFilter === g ? "bg-[#c9a962] text-[#0a141b] font-semibold" : "text-slate-300 hover:bg-slate-700")
              }
            >
              {g === "All" ? `All ${groupLabel}s` : g}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search port name…"
            className="w-full bg-slate-900/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#c9a962]"
          />
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={2}
        maxZoom={12}
        style={{ height: "460px", width: "100%", background: "#eef2f5", borderRadius: "12px" }}
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
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {filtered.map((p) => {
          const style = VERDICT_STYLE[p.verdict];
          const flagged = p.verdict === "Not Recommended" || p.verdict === "Caution";
          return (
            <CircleMarker
              key={p.name}
              center={[p.lat, p.lon]}
              radius={flagged ? 9 : 6}
              pathOptions={{
                color: style.color,
                fillColor: style.color,
                fillOpacity: flagged ? 0.9 : 0.75,
                weight: flagged ? 2.5 : 1.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {p.name}
              </Tooltip>
              <Popup>
                <div className="text-sm text-slate-800 min-w-[180px]">
                  <p className="font-bold mb-1">
                    {p.name}
                    {p[subField] ? `, ${p[subField]}` : ""}
                  </p>
                  <p className="mb-1">{style.label}</p>
                  <p className="text-xs">{p.reason}</p>
                  <p className="text-xs mt-2 text-slate-500">
                    {p.source === "live"
                      ? `🛰️ Live station ${Math.round(p.distanceKm)} km away · SST ${Number(
                          p.station?.Sea_Surface_Temperature
                        ).toFixed(1)}°C · ${p.station?.Date}`
                      : `📈 Modeled (${p.regime}) · SST ~${p.sst}°C · wind ~${Math.round(
                          p.windSpeed
                        )} km/h · swell ~${p.waveHeight} m`}
                  </p>
                  {onSelectPort && (
                    <button
                      onClick={() => onSelectPort(p)}
                      className="mt-2 w-full text-xs font-semibold bg-[#0a141b] text-[#c9a962] rounded-md py-1.5 hover:bg-slate-900"
                    >
                      Check this port ↓
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Every port, checked */}
      <h3 className="text-lg font-semibold mt-6 mb-3">
        Every port, checked ({filtered.length})
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((p) => {
          const style = VERDICT_STYLE[p.verdict];
          const isSelected = p.name === selectedName;
          return (
            <button
              key={p.name}
              onClick={() => onSelectPort && onSelectPort(p)}
              className={
                "text-left bg-slate-700 rounded-lg p-4 transition-all " +
                (onSelectPort ? "cursor-pointer hover:bg-slate-600 " : "") +
                (isSelected ? "ring-2 ring-[#c9a962]" : "")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p[subField]} · {p[groupField]}
                  </p>
                </div>
                <span className={"text-xs px-2 py-1 rounded-full border whitespace-nowrap " + style.badge}>
                  {style.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{p.reason}</p>
              <p className="text-[11px] text-slate-500 mt-2">
                {p.source === "live" ? "🛰️ Live monitoring station" : "📈 Modeled climatology estimate"}
              </p>
              {onSelectPort && (
                <p className="text-[11px] font-semibold text-[#c9a962] mt-2">
                  {isSelected ? "✓ Selected — see full check below" : "Tap to check this port →"}
                </p>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 col-span-full">No ports match that search/filter.</p>
        )}
      </div>

      {/* Active alerts */}
      <h3 className="text-lg font-semibold mt-8 mb-3">🚨 Active Port Alerts ({alerts.length})</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-400">No ports are currently flagged — all monitored/modeled coastlines look favorable.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {alerts.map((p) => (
            <div
              key={p.name}
              className={
                "bg-slate-900 rounded-xl p-4 border-l-4 flex justify-between items-start gap-4 " +
                (p.verdict === "Not Recommended" ? "border-red-500" : "border-amber-500")
              }
            >
              <div>
                <h4 className="font-semibold">
                  {p.name}
                  {p[subField] ? `, ${p[subField]}` : ""}
                </h4>
                <p className="text-sm text-slate-400 mt-1">{p.reason}</p>
              </div>
              <span className={"text-xs px-2.5 py-1 rounded-full border whitespace-nowrap " + VERDICT_STYLE[p.verdict].badge}>
                {VERDICT_STYLE[p.verdict].label}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 mt-6">
        {liveCount > 0
          ? `Ports near the Atlantic monitoring grid use the live NOAA-derived feed (snapshot: ${latestDate || "loading…"}). `
          : ""}
        All other ports use a physically-modeled climatology estimate (seasonal wind system + sea-surface-temperature
        baseline for that latitude/date) since no live satellite feed covers them in this build — clearly marked 📈 above.
        {stationsLoading ? " Loading live station data…" : ""}
      </p>
    </div>
  );
}
