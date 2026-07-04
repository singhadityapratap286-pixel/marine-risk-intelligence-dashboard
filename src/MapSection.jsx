import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapSection() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">
        🌍 GIS Marine Map
      </h2>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "450px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[19.076, 72.8777]}>
          <Popup>Mumbai Port</Popup>
        </Marker>

        <Marker position={[13.0827, 80.2707]}>
          <Popup>Chennai Port</Popup>
        </Marker>

        <Marker position={[21.1702, 72.8311]}>
          <Popup>Surat Coast</Popup>
        </Marker>

        <Circle
          center={[19.076, 72.8777]}
          radius={50000}
          pathOptions={{
            color: "red",
            fillColor: "red",
            fillOpacity: 0.4,
          }}
        />
      </MapContainer>
    </div>
  );
}

export default MapSection;