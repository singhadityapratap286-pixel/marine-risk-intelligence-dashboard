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

function Dashboard() {
  return (
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
      <div className="mt-8">
        <MapSection />
      </div>

      {/* Prediction */}
      <div className="mt-8">
        <PredictionPanel />
      </div>

      {/* Charts */}
      <div className="mt-8">
        <ChartPanel />
      </div>

      {/* Water Quality */}
      <div className="mt-8">
        <WaterQualityPanel />
      </div>

      {/* Risk Zones */}
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
      </div>

    </div>
  );
}

export default Dashboard;