import { Activity, Droplets, Thermometer, Waves, ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLiveMarineData } from "../hooks/useLiveMarineData";

const TREND_ICON = {
  up: <TrendingUp size={13} />,
  down: <TrendingDown size={13} />,
  flat: <Minus size={13} />,
};

function statusFor(key, value) {
  const RANGES = {
    ph: { safe: [7.5, 8.4] },
    turbidity: { safe: [0, 6] },
    tds: { safe: [0, 500] },
    temperature: { safe: [24, 30] },
  };
  const range = RANGES[key];
  if (!range) return "SAFE";
  return value >= range.safe[0] && value <= range.safe[1] ? "SAFE" : "WATCH";
}

const CARD_DEFS = [
  { key: "ph", title: "PH LEVEL", unit: "", icon: <Activity size={22} />, decimals: 2 },
  { key: "turbidity", title: "TURBIDITY", unit: "NTU", icon: <Droplets size={22} />, decimals: 1 },
  { key: "tds", title: "TDS", unit: "ppm", icon: <Waves size={22} />, decimals: 0 },
  { key: "temperature", title: "TEMPERATURE", unit: "°C", icon: <Thermometer size={22} />, decimals: 1 },
];

function DashboardCards() {
  const { data, trend } = useLiveMarineData("dakar", 3500);

  const toxicity = Math.max(0, Math.min(1, (data.turbidity / 20 + Math.abs(data.ph - 8) / 4)));

  const cards = [
    ...CARD_DEFS.map((c) => ({
      ...c,
      value: data[c.key].toFixed(c.decimals),
      status: statusFor(c.key, data[c.key]),
      trend: trend[c.key],
    })),
    {
      key: "toxicity",
      title: "TOXICITY INDEX",
      unit: "",
      icon: <ShieldCheck size={22} />,
      value: toxicity.toFixed(2),
      status: toxicity < 0.3 ? "SAFE" : "WATCH",
      trend: "flat",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.key} className="bg-slate-800 rounded-xl shadow-lg p-5 hover:scale-[1.02] transition">
          <div className="flex justify-between items-center">
            <div className="text-[#c9a962]">{card.icon}</div>
            <span className={`${card.status === "SAFE" ? "bg-green-500" : "bg-yellow-500 text-black"} text-xs px-3 py-1 rounded-full font-bold`}>
              {card.status}
            </span>
          </div>

          <p className="text-gray-400 mt-5 text-sm tracking-wider">{card.title}</p>

          <h2 className="text-4xl font-bold mt-2 flex items-center gap-2">
            {card.value}
            <span className="text-lg text-gray-300">{card.unit}</span>
            <span className={card.trend === "up" ? "text-red-400" : card.trend === "down" ? "text-green-400" : "text-slate-500"}>
              {TREND_ICON[card.trend] || TREND_ICON.flat}
            </span>
          </h2>

          <p className="text-gray-500 mt-2 text-sm">Live Sensor Reading</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
