function ShipTrackingPanel() {
  const ships = [
    {
      name: "MV Ocean Star",
      location: "Mumbai Coast",
      speed: "18 knots",
      status: "Moving",
      color: "text-green-400",
    },
    {
      name: "Cargo Titan",
      location: "Chennai Port",
      speed: "12 knots",
      status: "Docked",
      color: "text-yellow-400",
    },
    {
      name: "INS Vikrant",
      location: "Arabian Sea",
      speed: "24 knots",
      status: "Patrolling",
      color: "text-cyan-400",
    },
    {
      name: "Blue Whale",
      location: "Surat Coast",
      speed: "20 knots",
      status: "Warning",
      color: "text-red-400",
    },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-6">
        🚢 Live Ship Tracking
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400 border-b border-slate-600">
            <th className="pb-3">Ship</th>
            <th className="pb-3">Location</th>
            <th className="pb-3">Speed</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {ships.map((ship, index) => (
            <tr
              key={index}
              className="border-b border-slate-700"
            >
              <td className="py-4">{ship.name}</td>
              <td>{ship.location}</td>
              <td>{ship.speed}</td>
              <td className={ship.color}>{ship.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShipTrackingPanel;