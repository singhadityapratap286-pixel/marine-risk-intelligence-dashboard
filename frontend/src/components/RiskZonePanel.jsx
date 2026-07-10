import { useLiveMarineData, BASELINES } from "../hooks/useLiveMarineData";
import { computeRisk, labelColor } from "../utils/riskEngine";

const ZONE_NAMES = { dakar: "Dakar Coast", lagos: "Lagos Coast", fortaleza: "Fortaleza Coast", capetown: "Cape Town Coast" };

function ZoneRow({ zoneKey }) {
  const { data } = useLiveMarineData(zoneKey, 5000);
  const risk = computeRisk(data);

  return (
    <div className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
      <span>{ZONE_NAMES[zoneKey]}</span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-slate-400">{risk.score}/100</span>
        <span className={labelColor(risk.label)}>{risk.label}</span>
      </span>
    </div>
  );
}

function RiskZonePanel() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg mt-8">
      <h2 className="text-2xl font-semibold mb-6">🚨 AI Detected Risk Zones</h2>

      <div className="space-y-4">
        {Object.keys(BASELINES).map((key) => (
          <ZoneRow key={key} zoneKey={key} />
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Scores update live from wave height, wind speed, pressure trend, sea temperature anomaly, and swell period.
      </p>
    </div>
  );
}

export default RiskZonePanel;
