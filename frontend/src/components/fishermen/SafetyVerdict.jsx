import { useState } from "react";
import { ChevronDown, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { getFishingAdvisory } from "../../utils/riskEngine";
import { useLanguage } from "../../context/LanguageContext";

const VERDICT_ICON = {
  Go: <ShieldCheck size={40} className="text-green-400" />,
  Caution: <AlertTriangle size={40} className="text-yellow-400" />,
  "Do Not Go": <XCircle size={40} className="text-red-500" />,
};

const VERDICT_KEY = { Go: "go", Caution: "caution", "Do Not Go": "doNotGo" };

const VERDICT_BG = {
  Go: "from-green-500/10 to-green-500/0 border-green-500/30",
  Caution: "from-yellow-500/10 to-yellow-500/0 border-yellow-500/30",
  "Do Not Go": "from-red-500/10 to-red-500/0 border-red-500/30",
};

function SafetyVerdict({ conditions, title }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const advisory = getFishingAdvisory({
    waveHeight: conditions.waveHeight,
    windSpeed: conditions.windSpeed,
    pressureDrop: conditions.pressureDrop,
    waterTemp: conditions.waterTemp,
    swellPeriod: conditions.swellPeriod,
  });

  return (
    <div className={`bg-gradient-to-br ${VERDICT_BG[advisory.verdict]} border rounded-2xl p-6 sm:p-8`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300 font-medium">{title || t("safeToFish")}</p>
          <div className="flex items-center gap-3 mt-3">
            {VERDICT_ICON[advisory.verdict]}
            <h2 className={`text-3xl sm:text-4xl font-bold ${advisory.verdictColor}`}>
              {t(VERDICT_KEY[advisory.verdict])}
            </h2>
          </div>
          <p className="mt-3 text-sm text-slate-300 max-w-md">{advisory.advice}</p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-slate-400">{t("confidence")}</div>
          <div className="text-2xl font-bold text-[#c9a962]">{advisory.confidence}%</div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
      >
        Why? <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
          {advisory.breakdown.map((f) => (
            <div key={f.key} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 text-slate-400">{f.label}</span>
              <span className="w-20 shrink-0 font-mono text-slate-200">
                {f.value.toFixed(1)} {f.unit}
              </span>
              <div className="flex-1 h-2 bg-slate-900/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c9a962] rounded-full transition-all duration-700"
                  style={{ width: `${f.contribution}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-slate-400">{f.contribution}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SafetyVerdict;
