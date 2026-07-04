import Navbar from "./components/Navbar";
import MapSection from "./MapSection";
import DashboardCards from "./components/DashboardCards";
import PredictionPanel from "./components/PredictionPanel";
import ChartPanel from "./components/ChartPanel";
import RiskZonePanel from "./components/RiskZonePanel";
import AlertPanel from "./components/AlertPanel";
import WeatherPanel from "./components/WeatherPanel";
import ShipTrackingPanel from "./components/ShipTrackingPanel";
import LiveWeatherPanel from "./components/LiveWeatherPanel";
import SatellitePanel from "./components/SatellitePanel";
import GlobePanel from "./components/GlobePanel";
import WaterQualityPanel from "./components/WaterQualityPanel";
import HistoryPanel from "./components/HistoryPanel";
import ConfigurationPanel from "./components/ConfigurationPanel";
import ReportsPanel from "./components/ReportsPanel";
import AccountPanel from "./components/AccountPanel";
import SubmitReportPanel from "./components/SubmitReportPanel";
import AIAssistantPanel from "./components/AIAssistantPanel";
import HelpDeskPanel from "./components/HelpDeskPanel";
import CircuitDiagramPanel from "./components/CircuitDiagramPanel";
import ApiDocsPanel from "./components/ApiDocsPanel";
import SystemAboutPanel from "./components/SystemAboutPanel";
function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <div className="p-8">

        {/* Heading */}
        <h1 className="text-4xl font-bold">
          🌊 AI Marine Risk Intelligence Dashboard
        </h1>

        <p className="mt-2 text-gray-300">
          Frontend by Aditya
        </p>

        {/* Dashboard Cards */}
        <div className="mt-10">
          <DashboardCards />
        </div>

        {/* GIS Map */}
        <div className="mt-10">
          <MapSection />
        </div>

        {/* Prediction + Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          <PredictionPanel />

          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">

            <h2 className="text-2xl font-semibold">
              📊 Live Marine Analytics
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between">
                <span>Wave Height</span>
                <span>3.2 m</span>
              </div>

              <div className="flex justify-between">
                <span>Wind Speed</span>
                <span>42 km/h</span>
              </div>

              <div className="flex justify-between">
                <span>Water Temperature</span>
                <span>29.8°C</span>
              </div>

              <div className="flex justify-between">
                <span>Cyclone Probability</span>
                <span className="text-red-400 font-bold">
                  67%
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Marine Charts */}
        <div className="mt-8">
          <ChartPanel />
        </div>

        {/* Water Quality */}
        <div className="mt-8">
          <WaterQualityPanel />
        </div>

        {/* History */}
        <div className="mt-8">
          <HistoryPanel />
        </div>
        <div className="mt-8">
  <ConfigurationPanel />
</div>
{/* Reports */}
<div className="mt-8">
  <ReportsPanel />
</div>
{/* Account */}
<div className="mt-8">
  <AccountPanel />
</div>
<div className="mt-8">
  <SubmitReportPanel />
</div>
<div className="mt-8">
  <AIAssistantPanel />
</div>
<div className="mt-8">
  <HelpDeskPanel />
</div>
<div className="mt-8">
  <CircuitDiagramPanel />
</div>
<div className="mt-8">
  <ApiDocsPanel />
</div>

        {/* AI Risk Zones */}
        <div className="mt-8">
          <RiskZonePanel />
        </div>

        {/* Alerts */}
        <div className="mt-8">
          <AlertPanel />
        </div>

        {/* Weather */}
        <div className="mt-8">
          <WeatherPanel />
        </div>

        {/* Ship Tracking */}
        <div className="mt-8">
          <ShipTrackingPanel />
        </div>

        {/* Live Weather */}
        <div className="mt-8">
          <LiveWeatherPanel />
        </div>

        {/* Satellite */}
        <div className="mt-8">
          <SatellitePanel />
        </div>

        {/* Globe */}
        <div className="mt-8">
          <GlobePanel />
          {/* Interactive 3D Globe */}
<div className="mt-8">
  <GlobePanel />
</div>

{/* System / About */}
<div className="mt-8">
  <SystemAboutPanel />
</div>
        </div>

      </div>
    </div>
  );
}

export default App;