import { useEffect, useMemo, useState } from "react";
import { Fish, Fuel } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { DEFAULT_CURRENCY, fromUSD } from "../../data/currency";

// Simple, explainable catch-potential proxy: warmer-but-not-too-warm water
// plus calmer seas historically correlates with better nearshore catch.
// This is a heuristic stand-in for a real chlorophyll/SST fisheries model —
// documented here so it's obvious what to replace later.
function estimateCatchPotential({ waterTemp, waveHeight }) {
  const tempScore = Math.max(0, 100 - Math.abs(waterTemp - 1.2) * 40); // sweet spot around +1.2°C anomaly
  const calmScore = Math.max(0, 100 - waveHeight * 18);
  const score = Math.round(tempScore * 0.55 + calmScore * 0.45);
  let label = "Low";
  if (score > 70) label = "High";
  else if (score > 40) label = "Moderate";
  return { score: Math.min(100, score), label };
}

// USD reference defaults for a small-boat trip — converted into whatever
// currency the selected port's country uses so the numbers look right
// locally (₹/L diesel in India, ¥/kg in Japan, etc.) rather than always
// showing dollars. Every field stays editable; these are just sane starting
// points.
const USD_DEFAULTS = { fuelPricePerL: 1.1, expectedCatchKg: 25, pricePerKg: 4.5 };

function round(n, step) {
  return Math.round(n / step) * step;
}

function CatchAndCostPanel({ conditions, currency = DEFAULT_CURRENCY, portName }) {
  const { t } = useLanguage();
  const [distance, setDistance] = useState(15);
  const [boatEfficiency, setBoatEfficiency] = useState(4); // km per litre
  const [fuelPricePerL, setFuelPricePerL] = useState(() => round(fromUSD(USD_DEFAULTS.fuelPricePerL, currency), currency.usdRate > 50 ? 1 : 0.1));
  const [expectedCatchKg, setExpectedCatchKg] = useState(USD_DEFAULTS.expectedCatchKg);
  const [pricePerKg, setPricePerKg] = useState(() => round(fromUSD(USD_DEFAULTS.pricePerKg, currency), currency.usdRate > 50 ? 1 : 0.1));

  // Re-baseline the price defaults whenever the selected port's currency
  // changes, so switching from an Indian port to a Japanese one shows ₹ / ¥
  // amounts in a realistic range rather than carrying over the old numbers.
  useEffect(() => {
    setFuelPricePerL(round(fromUSD(USD_DEFAULTS.fuelPricePerL, currency), currency.usdRate > 50 ? 1 : 0.1));
    setPricePerKg(round(fromUSD(USD_DEFAULTS.pricePerKg, currency), currency.usdRate > 50 ? 1 : 0.1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency.code]);

  const catchPotential = estimateCatchPotential(conditions);

  const { fuelCost, catchValue, profit } = useMemo(() => {
    const roundTrip = distance * 2;
    const litres = roundTrip / Math.max(boatEfficiency, 0.5);
    const fuelCost = litres * fuelPricePerL;
    const catchValue = expectedCatchKg * pricePerKg;
    return { fuelCost, catchValue, profit: catchValue - fuelCost };
  }, [distance, fuelPricePerL, boatEfficiency, expectedCatchKg, pricePerKg]);

  const fmt = (n) => `${currency.symbol}${n.toLocaleString(undefined, { maximumFractionDigits: n >= 1000 ? 0 : 1 })}`;

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg space-y-6">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Fish size={22} className="text-[#c9a962]" /> {t("catchPotential")}
        </h2>
        {portName && <p className="text-xs text-slate-400 mt-1">For {portName} · prices shown in {currency.code}</p>}
        <div className="mt-4 flex items-center gap-4">
          <div className="text-4xl font-bold text-[#c9a962]">{catchPotential.score}</div>
          <div>
            <div className="font-semibold">{catchPotential.label}</div>
            <div className="text-xs text-slate-400">Based on sea temperature + wave calmness</div>
          </div>
        </div>
        <div className="mt-3 h-2 bg-slate-900/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#c9a962] to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${catchPotential.score}%` }} />
        </div>
      </div>

      <div className="border-t border-white/5 pt-5">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Fuel size={18} className="text-[#c9a962]" /> {t("tripCalculator")}
        </h3>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <label className="text-sm text-slate-300">
            Distance to fishing zone (km)
            <input type="range" min="2" max="60" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full mt-2 accent-[#c9a962]" />
            <span className="text-[#c9a962] font-mono text-sm">{distance} km</span>
          </label>

          <label className="text-sm text-slate-300">
            Boat fuel efficiency (km/litre)
            <input type="range" min="1" max="10" step="0.5" value={boatEfficiency} onChange={(e) => setBoatEfficiency(Number(e.target.value))} className="w-full mt-2 accent-[#c9a962]" />
            <span className="text-[#c9a962] font-mono text-sm">{boatEfficiency} km/L</span>
          </label>

          <label className="text-sm text-slate-300">
            Fuel price ({currency.symbol}/litre)
            <input type="number" value={fuelPricePerL} onChange={(e) => setFuelPricePerL(Number(e.target.value))} className="w-full mt-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          </label>

          <label className="text-sm text-slate-300">
            Expected catch (kg)
            <input type="number" value={expectedCatchKg} onChange={(e) => setExpectedCatchKg(Number(e.target.value))} className="w-full mt-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          </label>

          <label className="text-sm text-slate-300 sm:col-span-2">
            Market price ({currency.symbol}/kg)
            <input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(Number(e.target.value))} className="w-full mt-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-slate-400">Fuel cost</div>
            <div className="text-lg font-bold text-orange-400">{fmt(fuelCost)}</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-slate-400">Catch value</div>
            <div className="text-lg font-bold text-[#c9a962]">{fmt(catchValue)}</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-slate-400">Est. profit</div>
            <div className={`text-lg font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(profit)}</div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          Default fuel/market prices are illustrative starting points converted to {currency.code} — replace them with
          your actual local prices for an accurate profit estimate.
        </p>
      </div>
    </div>
  );
}

export default CatchAndCostPanel;
