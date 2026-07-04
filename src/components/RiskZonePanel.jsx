function RiskZonePanel() {
  const zones = [
    {
      name: "Mumbai Coast",
      level: "High",
      color: "text-red-400",
    },
    {
      name: "Chennai Coast",
      level: "Medium",
      color: "text-yellow-400",
    },
    {
      name: "Surat Coast",
      level: "Low",
      color: "text-green-400",
    },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg mt-8">
      <h2 className="text-2xl font-semibold mb-6">
        🚨 AI Detected Risk Zones
      </h2>

      <div className="space-y-4">
        {zones.map((zone, index) => (
          <div
            key={index}
            className="bg-slate-700 rounded-lg p-4 flex justify-between"
          >
            <span>{zone.name}</span>
            <span className={zone.color}>{zone.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskZonePanel;