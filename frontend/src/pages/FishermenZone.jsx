import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import SafetyVerdict from "../components/fishermen/SafetyVerdict";
import GlobalPortAdvisoryPanel from "../components/fishermen/GlobalPortAdvisoryPanel";
import SafeHarbors from "../components/fishermen/SafeHarbors";
import CatchAndCostPanel from "../components/fishermen/CatchAndCostPanel";
import EmergencyPanel from "../components/fishermen/EmergencyPanel";
import Footer from "../components/Footer";
import { INDIAN_PORTS } from "../data/indianPorts";
import { GLOBAL_PORTS } from "../data/globalPorts";
import { currencyFor } from "../data/currency";

const PORT_SECTIONS = [
  { key: "india", label: "🇮🇳 Indian Ports" },
  { key: "global", label: "🌍 Global Ports" },
];

function SelectedPortCheck({ port, sectionLabel }) {
  if (!port) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg text-center text-slate-400">
        Tap any port above (on the map or in the list) to see its full safety breakdown and a profit estimate in local
        currency.
      </div>
    );
  }
  const currency = currencyFor(port);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">
          📍 Selected port: {port.name}
          {port.state ? `, ${port.state}` : port.country ? `, ${port.country}` : ""}
        </h2>
        <span className="text-xs text-slate-400 bg-slate-900/60 rounded-lg px-3 py-1.5">{sectionLabel}</span>
      </div>
      <SafetyVerdict conditions={port.conditions} title={`Safe to fish today at ${port.name}?`} />
      <CatchAndCostPanel conditions={port.conditions} currency={currency} portName={port.name} />
    </div>
  );
}

function FishermenZone() {
  const [portSection, setPortSection] = useState("india");
  const [selectedIndia, setSelectedIndia] = useState(null);
  const [selectedGlobal, setSelectedGlobal] = useState(null);
  const { t } = useLanguage();

  const selectedPort = portSection === "india" ? selectedIndia : selectedGlobal;
  const setSelectedPort = portSection === "india" ? setSelectedIndia : setSelectedGlobal;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-6 sm:p-8 max-w-6xl mx-auto flex-1 w-full">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">🎣 {t("fishermenZone")}</h1>
          <p className="mt-2 text-gray-400">
            Pick your port, see today's safe-to-fish verdict, and estimate trip profit in your own currency — built for
            small-boat crews worldwide.
          </p>
        </div>

        {/* India vs Global port advisory */}
        <div className="mt-8">
          <div className="flex gap-2 bg-slate-900/60 rounded-xl p-1.5 mb-4 w-fit">
            {PORT_SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setPortSection(s.key)}
                className={
                  "px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors " +
                  (portSection === s.key ? "bg-[#c9a962] text-[#0a141b]" : "text-slate-300 hover:bg-slate-700")
                }
              >
                {s.label}
              </button>
            ))}
          </div>

          {portSection === "india" ? (
            <GlobalPortAdvisoryPanel
              ports={INDIAN_PORTS}
              groupField="state"
              groupLabel="State"
              subField="sea"
              title="🇮🇳 India Fishing Port Advisory"
              subtitle="Every major Indian fishing harbor, Gujarat to West Bengal plus the island territories — tap one to check it."
              mapCenter={[15, 78]}
              mapZoom={4}
              onSelectPort={setSelectedIndia}
              selectedName={selectedIndia?.name}
            />
          ) : (
            <GlobalPortAdvisoryPanel
              ports={GLOBAL_PORTS}
              groupField="continent"
              groupLabel="Continent"
              subField="country"
              title="🌍 Global Fishing Port Advisory"
              subtitle="Fishing ports across every continent — tap one to check it, in that country's own currency."
              mapCenter={[10, 10]}
              mapZoom={2}
              onSelectPort={setSelectedGlobal}
              selectedName={selectedGlobal?.name}
            />
          )}
        </div>

        {/* Full breakdown + local-currency profit estimate for the selected port */}
        <div className="mt-8">
          <SelectedPortCheck port={selectedPort} sectionLabel={portSection === "india" ? "Indian Ports" : "Global Ports"} />
        </div>

        <div className="mt-8">
          <SafeHarbors />
        </div>

        <div className="mt-8">
          <EmergencyPanel region={portSection === "india" ? "india" : "global"} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default FishermenZone;
