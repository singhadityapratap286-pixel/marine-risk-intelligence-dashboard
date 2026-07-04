function SatellitePanel() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-6">
        🛰️ Satellite View
      </h2>

      <img
        src="https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147190/world.topo.bathy.200412.3x5400x2700.jpg"
        alt="Satellite"
        className="rounded-xl w-full h-[500px] object-cover"
      />

      <p className="mt-4 text-gray-400">
        Live satellite imagery of marine regions for environmental monitoring.
      </p>
    </div>
  );
}

export default SatellitePanel;