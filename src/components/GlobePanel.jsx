import Globe from "react-globe.gl";
import { useMemo, useState } from "react";

function GlobePanel() {
  const [selectedCity, setSelectedCity] = useState(null);

  const pointsData = useMemo(
    () => [
      { name: "Mumbai", lat: 19.076, lng: 72.8777, risk: "High", color: "red" },
      { name: "Goa", lat: 15.4909, lng: 73.8278, risk: "Low", color: "lime" },
      { name: "Kochi", lat: 9.9312, lng: 76.2673, risk: "Low", color: "lime" },
      { name: "Chennai", lat: 13.0827, lng: 80.2707, risk: "High", color: "red" },
      { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, risk: "Medium", color: "yellow" },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639, risk: "Low", color: "lime" }
    ],
    []
  );

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-6">
        🌍 Interactive Marine Globe
      </h2>

      <div className="h-[700px] rounded-xl overflow-hidden bg-black">
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"

          pointAltitude={0.02}
          pointRadius={0.4}

          showAtmosphere
          atmosphereColor="lightskyblue"
          atmosphereAltitude={0.15}

          pointLabel={(d) =>
            `
${d.name}
Risk : ${d.risk}
`
          }

          onPointClick={(point) => setSelectedCity(point)}
        />
      </div>

      {selectedCity && (
        <div className="mt-6 bg-slate-700 rounded-lg p-5">
          <h3 className="text-2xl font-bold">{selectedCity.name}</h3>

          <p className="mt-3">
            <b>Risk:</b> {selectedCity.risk}
          </p>

          <p>
            <b>Latitude:</b> {selectedCity.lat}
          </p>

          <p>
            <b>Longitude:</b> {selectedCity.lng}
          </p>
        </div>
      )}
    </div>
  );
}

export default GlobePanel;