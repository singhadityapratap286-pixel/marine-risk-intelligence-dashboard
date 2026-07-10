import { useState } from "react";
import { Phone, MapPin, Radio, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// VHF Channel 16 is the internationally recognised maritime distress,
// safety, and calling frequency, monitored by coast guards worldwide.
const DISTRESS_CHANNEL = "VHF Channel 16";

const REGIONS = {
  india: {
    heading: "🇮🇳 Indian Coast Guard — Marine Emergency",
    intro:
      "In distress along the Indian coast? Call the Indian Coast Guard's toll-free maritime emergency helpline, then share your exact location below.",
    primary: { label: "Call Indian Coast Guard", number: "1554", href: "tel:1554" },
    secondary: [
      { label: "Maritime SAR / MRCC (toll-free)", number: "1718", href: "tel:1718" },
      { label: "Coastal Police Support", number: "1093", href: "tel:1093" },
      { label: "National Emergency Number", number: "112", href: "tel:112" },
    ],
    footnote:
      "1554 is the Indian Coast Guard's dedicated toll-free helpline for fishermen and vessels in distress at sea. Keep a Distress Alert Transmitter (DAT) aboard where possible and always fish in groups.",
  },
  global: {
    heading: "🌍 Coast Guard / Maritime Rescue Coordination Centre",
    intro:
      "In distress at sea? Hail your national Coast Guard or Maritime Rescue Coordination Centre (MRCC) on " +
      DISTRESS_CHANNEL +
      ", then share your exact location below.",
    primary: { label: "Call Emergency Services", number: "112", href: "tel:112" },
    secondary: [
      { label: "Maritime distress radio", number: DISTRESS_CHANNEL, href: null },
      { label: "Satellite distress beacon", number: "406 MHz EPIRB", href: null },
    ],
    footnote:
      "112 is widely recognised internationally, but always look up and save your own country's Coast Guard / MRCC number before heading out — it varies by nation and responds fastest for local waters.",
  },
};

function EmergencyPanel({ region = "global" }) {
  const { t } = useLanguage();
  const [locationText, setLocationText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | locating | done | error
  const r = REGIONS[region] || REGIONS.global;

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setLocationText("Geolocation isn't available on this device — read your GPS coordinates to the coast guard directly.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setStatus("done");
      },
      () => {
        setStatus("error");
        setLocationText("Location permission denied — read your GPS coordinates to the coast guard directly.");
      }
    );
  };

  return (
    <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold flex items-center gap-2 text-red-300">
        <Radio size={22} /> {r.heading}
      </h2>
      <p className="text-sm text-slate-300 mt-2">{r.intro}</p>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <a
          href={r.primary.href}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 transition-colors font-semibold rounded-xl px-5 py-3.5"
        >
          <Phone size={18} /> {r.primary.label} ({r.primary.number})
        </a>
        <button
          onClick={shareLocation}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors font-semibold rounded-xl px-5 py-3.5"
        >
          <MapPin size={18} /> {t("shareLocation")}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {r.secondary.map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-slate-900/60 rounded-lg px-3 py-2 text-xs">
            <ShieldAlert size={13} className="text-red-300 shrink-0" />
            <span className="text-slate-300">{s.label}:</span>
            {s.href ? (
              <a href={s.href} className="font-semibold text-[#c9a962]">
                {s.number}
              </a>
            ) : (
              <span className="font-semibold text-[#c9a962]">{s.number}</span>
            )}
          </div>
        ))}
      </div>

      {status !== "idle" && (
        <div className="mt-4 bg-slate-900/60 rounded-lg p-3 text-sm">
          {status === "locating" && <span className="text-slate-400">Getting your location…</span>}
          {status === "done" && (
            <span>
              📍 Your coordinates: <span className="font-mono text-[#c9a962]">{locationText}</span> — read these out on your radio/call.
            </span>
          )}
          {status === "error" && <span className="text-yellow-400">{locationText}</span>}
        </div>
      )}

      <p className="text-xs text-slate-500 mt-4">{r.footnote}</p>
    </div>
  );
}

export default EmergencyPanel;
