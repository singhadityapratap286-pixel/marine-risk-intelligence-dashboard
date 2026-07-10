import { useEffect, useMemo, useState } from "react";
import { Anchor, Navigation, LocateFixed } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { INDIAN_PORTS } from "../../data/indianPorts";
import { GLOBAL_PORTS } from "../../data/globalPorts";
import { useAtlanticStations } from "../../hooks/useAtlanticStations";
import { annotatePorts } from "../../utils/portAdvisory";
import { haversineKm } from "../../utils/geo";

const ALL_PORTS = [...INDIAN_PORTS, ...GLOBAL_PORTS];

function SafeHarbors() {
  const { t } = useLanguage();
  const { latestStations, loading } = useAtlanticStations();
  const [origin, setOrigin] = useState(null); // { lat, lon } from browser geolocation
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | locating | granted | denied

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  };

  // Try silently on mount too (in case permission was already granted earlier).
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeHarbors = useMemo(() => {
    const annotated = annotatePorts(ALL_PORTS, latestStations);
    const open = annotated.filter((p) => p.verdict === "Favorable");

    if (origin) {
      return open
        .map((p) => ({ ...p, distanceFromUser: haversineKm(origin.lat, origin.lon, p.lat, p.lon) }))
        .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
        .slice(0, 5);
    }
    // No location yet — fall back to a representative Indian default list.
    return open.filter((p) => p.state).slice(0, 5);
  }, [latestStations, origin]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold mb-1 flex items-center gap-2">
          <Anchor size={22} className="text-[#c9a962]" /> {t("nearestHarbor")}
        </h2>
        {geoStatus !== "granted" && (
          <button
            onClick={requestLocation}
            className="flex items-center gap-1.5 text-xs font-medium text-[#c9a962] hover:text-[#dcc07f] shrink-0 bg-slate-900/60 px-3 py-1.5 rounded-lg"
          >
            <LocateFixed size={14} /> {geoStatus === "locating" ? "Locating…" : "Use my location"}
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4">
        {origin
          ? "Nearest open ports to your current location, worldwide — closest first."
          : "Share your location for a personalized list, or browse this default selection of currently favorable ports."}
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Checking port conditions…</p>
      ) : (
        <div className="space-y-3">
          {safeHarbors.map((h) => (
            <div key={h.name} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">
                  {h.name}
                  {h.state || h.country ? `, ${h.state || h.country}` : ""}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {origin
                    ? `${Math.round(h.distanceFromUser)} km from you`
                    : h.source === "live"
                    ? `${Math.round(h.distanceKm)} km from nearest live station`
                    : "Modeled estimate"}{" "}
                  · <span className="text-green-400">Open</span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#c9a962] text-sm font-medium hover:text-[#dcc07f] shrink-0"
              >
                <Navigation size={15} /> Directions
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SafeHarbors;
