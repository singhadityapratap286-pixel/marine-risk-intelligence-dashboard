import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLiveMarineData } from "../hooks/useLiveMarineData";
import { computeRisk, labelColor } from "../utils/riskEngine";

const TREND_ICON = { up: <TrendingUp size={14} className="text-red-400" />, down: <TrendingDown size={14} className="text-green-400" />, flat: <Minus size={14} className="text-slate-500" /> };

const ACTION_BY_LABEL = {
  Low: "Routine monitoring — no action needed",
  Moderate: "Advisory issued — monitor closely",
  High: "Deploy Coast Guard Patrol",
  Severe: "Activate emergency response protocol",
};

function PredictionPanel() {
  const { data, trend } = useLiveMarineData("dakar");
  const [expanded, setExpanded] = useState(false);

  const risk = computeRisk({
    waveHeight: data.waveHeight,
    windSpeed: data.windSpeed,
    pressureDrop: data.pressureDrop,
    waterTemp: data.waterTemp,
    swellPeriod: data.swellPeriod,
  });

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">🤖 AI Prediction Panel</h2>

      <div className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">Risk Level</h3>
          <p className={`${labelColor(risk.label)} text-2xl font-bold`}>
            {risk.label} <span className="text-sm text-slate-400 font-normal">({risk.score}/100)</span>
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">AI Confidence</h3>
          <p className="text-[#c9a962] text-2xl font-bold">{risk.confidence}%</p>
          <p className="text-xs text-slate-500 mt-1">Based on {risk.breakdown.length} live factors</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">Suggested Action</h3>
          <p className="text-green-400 font-semibold">{ACTION_BY_LABEL[risk.label]}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
      >
        View contributing factors
        <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
          {risk.breakdown.map((f) => (
            <div key={f.key} className="flex items-center gap-3 text-sm">
              {TREND_ICON[trend[f.key]] || TREND_ICON.flat}
              <span className="w-40 shrink-0 text-slate-400">{f.label}</span>
              <span className="w-20 shrink-0 font-mono text-slate-200">{f.value.toFixed(1)} {f.unit}</span>
              <div className="flex-1 h-2 bg-slate-900/60 rounded-full overflow-hidden">
                <div className="h-full bg-[#c9a962] rounded-full transition-all duration-700" style={{ width: `${f.contribution}%` }} />
              </div>
              <span className="w-10 text-right text-xs text-slate-400">{f.contribution}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PredictionPanel;
