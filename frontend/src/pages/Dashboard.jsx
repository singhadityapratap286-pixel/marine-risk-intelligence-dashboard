import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, Map as MapIcon, Droplets, Ship } from "lucide-react";

import DashboardCards from "../components/DashboardCards";
import MapSection from "../MapSection";
import PredictionPanel from "../components/PredictionPanel";
import ChartPanel from "../components/ChartPanel";
import WaterQualityPanel from "../components/WaterQualityPanel";
import RiskZonePanel from "../components/RiskZonePanel";
import AlertPanel from "../components/AlertPanel";
import WeatherPanel from "../components/WeatherPanel";
import ShipTrackingPanel from "../components/ShipTrackingPanel";
import LiveWeatherPanel from "../components/LiveWeatherPanel";
import SatellitePanel from "../components/SatellitePanel";
import GlobePanel from "../components/GlobePanel";
import GISResourcesPanel from "../components/GISResourcesPanel";
import Footer from "../components/Footer";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "map", label: "Map, Globe & Satellite", icon: MapIcon },
  { key: "environment", label: "Environment", icon: Droplets },
  { key: "operations", label: "Operations & Alerts", icon: Ship },
];

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [tab, setTab] = useState(TABS.some((t) => t.key === initialTab) ? initialTab : "overview");

  useEffect(() => {
    setSearchParams(tab === "overview" ? {} : { tab }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-6 sm:p-8 flex-1 w-full max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold">🌊 AI Marine Risk Intelligence Dashboard</h1>
        <p className="mt-2 text-gray-400">Live coastal risk overview</p>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors " +
                  (active
                    ? "bg-slate-800 text-[#dcc07f] border-b-2 border-[#c9a962]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50")
                }
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <>
            <div className="mt-8"><DashboardCards /></div>
            <div className="mt-8"><PredictionPanel /></div>
            <div className="mt-8"><ChartPanel /></div>
          </>
        )}

        {tab === "map" && (
          <>
            <div className="mt-8"><MapSection /></div>
            <div className="mt-8"><GlobePanel /></div>
            <div className="mt-8"><SatellitePanel /></div>
            <div className="mt-8"><ShipTrackingPanel /></div>
            <div className="mt-8"><GISResourcesPanel /></div>
          </>
        )}

        {tab === "environment" && (
          <>
            <div className="mt-8"><WaterQualityPanel /></div>
            <div className="mt-8"><WeatherPanel /></div>
            <div className="mt-8"><LiveWeatherPanel /></div>
          </>
        )}

        {tab === "operations" && (
          <>
            <div className="mt-8"><RiskZonePanel /></div>
            <div className="mt-8"><AlertPanel /></div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
