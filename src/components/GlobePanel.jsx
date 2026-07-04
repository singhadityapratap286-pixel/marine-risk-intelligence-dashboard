import Globe from "react-globe.gl";
import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";

function GlobePanel() {

  const [selectedCity, setSelectedCity] = useState(null);

  const pointsData = useMemo(
  () => [

    { name: "Mumbai", lat: 19.0760, lng: 72.8777, risk: "High", color: "red" },
    { name: "Navi Mumbai", lat: 19.0330, lng: 73.0297, risk: "Medium", color: "yellow" },
    { name: "Surat", lat: 21.1702, lng: 72.8311, risk: "Medium", color: "yellow" },
    { name: "Kandla", lat: 23.0333, lng: 70.2167, risk: "Low", color: "lime" },
    { name: "Mundra", lat: 22.8390, lng: 69.7210, risk: "Low", color: "lime" },
    { name: "Porbandar", lat: 21.6417, lng: 69.6293, risk: "Low", color: "lime" },
    { name: "Veraval", lat: 20.9077, lng: 70.3679, risk: "Low", color: "lime" },
    { name: "Goa", lat: 15.4909, lng: 73.8278, risk: "Low", color: "lime" },
    { name: "Karwar", lat: 14.8136, lng: 74.1297, risk: "Low", color: "lime" },
    { name: "Mangalore", lat: 12.9141, lng: 74.8560, risk: "Low", color: "lime" },
    { name: "Kochi", lat: 9.9312, lng: 76.2673, risk: "Low", color: "lime" },
    { name: "Kollam", lat: 8.8932, lng: 76.6141, risk: "Medium", color: "yellow" },
    { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, risk: "Medium", color: "yellow" },
    { name: "Kanyakumari", lat: 8.0883, lng: 77.5385, risk: "Low", color: "lime" },
    { name: "Tuticorin", lat: 8.7642, lng: 78.1348, risk: "Medium", color: "yellow" },
    { name: "Nagapattinam", lat: 10.7672, lng: 79.8449, risk: "Medium", color: "yellow" },
    { name: "Puducherry", lat: 11.9416, lng: 79.8083, risk: "Low", color: "lime" },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, risk: "High", color: "red" },
    { name: "Nellore", lat: 14.4426, lng: 79.9865, risk: "Medium", color: "yellow" },
    { name: "Kakinada", lat: 16.9891, lng: 82.2475, risk: "Medium", color: "yellow" },
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, risk: "High", color: "red" },
    { name: "Paradip", lat: 20.3167, lng: 86.6167, risk: "Medium", color: "yellow" },
    { name: "Puri", lat: 19.8135, lng: 85.8312, risk: "Low", color: "lime" },
    { name: "Haldia", lat: 22.0667, lng: 88.0698, risk: "Medium", color: "yellow" },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, risk: "Low", color: "lime" },
    { name: "Port Blair", lat: 11.6234, lng: 92.7265, risk: "Low", color: "lime" }
  ],
  []
);
const shipsData = useMemo(
  () => [
    {
      lat: 19.076,
      lng: 72.8777,
      name: "MV Ocean Star",
      color: "cyan"
    },
    {
      lat: 13.0827,
      lng: 80.2707,
      name: "Cargo Titan",
      color: "orange"
    },
    {
      lat: 17.6868,
      lng: 83.2185,
      name: "INS Vikrant",
      color: "red"
    },
    {
      lat: 11.6234,
      lng: 92.7265,
      name: "Blue Whale",
      color: "lime"
    }
  ],
  []
);
const arcsData = useMemo(
  () => [
    {
      startLat: 19.0760,
      startLng: 72.8777,
      endLat: 13.0827,
      endLng: 80.2707,
      color: ["#00ffff", "#00ffff"],
    },
    {
      startLat: 13.0827,
      startLng: 80.2707,
      endLat: 17.6868,
      endLng: 83.2185,
      color: ["#00ff00", "#00ff00"],
    },
    {
      startLat: 17.6868,
      startLng: 83.2185,
      endLat: 11.6234,
      endLng: 92.7265,
      color: ["#ff0000", "#ff0000"],
    },
    {
      startLat: 19.0760,
      startLng: 72.8777,
      endLat: 9.9312,
      endLng: 76.2673,
      color: ["#ffff00", "#ffff00"],
    },
  ],
  []
);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">

      <h2 className="text-3xl font-bold mb-6">
        🌍 Interactive Marine Globe
      </h2>

      <div className="h-[700px] bg-black rounded-xl overflow-hidden">

        <Globe

          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"

          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          initialViewAltitude={1.8}
          onGlobeReady={(globe) => {
  globe.pointOfView(
    {
      lat: 20,
      lng: 78,
      altitude: 1.8,
    },
    1000
  );
}}

          pointsData={pointsData}

          pointLat="lat"

          pointLng="lng"
          showAtmosphere={true}

atmosphereColor="lightskyblue"

atmosphereAltitude={0.2}


          pointRadius={0.45}
pointAltitude={0.06}
pointResolution={24}

          pointColor="color"
          pointLabel={(point) =>
  `${point.name}
Risk: ${point.risk}
Wave: 3.2 m
Wind: 42 km/h`
}

          onPointClick={(point) => setSelectedCity(point)}
          arcsData={arcsData}
          labelsData={shipsData}

labelLat="lat"

labelLng="lng"

labelText={(d) => `🚢 ${d.name}`}

labelSize={1.2}

labelDotRadius={0.3}

labelColor={(d) => d.color}
arcColor="color"
arcStroke={1.2}
arcDashLength={0.4}
arcDashGap={0.2}
arcDashAnimateTime={2500}
arcsTransitionDuration={1000}

arcAltitude={0.22}

arcAltitudeAutoScale={0.5}
arcLabel={(arc) => `
Ship Route
`}
arcDashInitialGap={() => Math.random()}

arcLabel={(d) =>
  `🚢 Route: ${d.startLat.toFixed(2)}, ${d.startLng.toFixed(2)}
to
${d.endLat.toFixed(2)}, ${d.endLng.toFixed(2)}`
}

        />

      </div>

      {selectedCity && (

        <div className="mt-6 bg-slate-700 rounded-lg p-5">

          <h3 className="text-2xl font-bold">
            {selectedCity.name}
          </h3>

          <p className="mt-2">
            Risk Level :
            <span className="font-bold ml-2">
              {selectedCity.risk}
            </span>
          </p>

          <p>Latitude : {selectedCity.lat}</p>

          <p>Longitude : {selectedCity.lng}</p>
          <p>🌊 Wave Height : 3.2 m</p>

<p>💨 Wind Speed : 42 km/h</p>

<p>🌡 Temperature : 29.8°C</p>

<p>🛰 Status : Active Monitoring</p>

        </div>

      )}

    </div>
  );
}

export default GlobePanel;
