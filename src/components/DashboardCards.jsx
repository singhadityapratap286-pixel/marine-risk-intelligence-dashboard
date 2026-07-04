import {
  Activity,
  Droplets,
  Thermometer,
  Waves,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    title: "PH LEVEL",
    value: "7.22",
    unit: "",
    status: "SAFE",
    color: "bg-green-500",
    icon: <Activity size={22} />,
  },
  {
    title: "TURBIDITY",
    value: "4.1",
    unit: "NTU",
    status: "SAFE",
    color: "bg-green-500",
    icon: <Droplets size={22} />,
  },
  {
    title: "TDS",
    value: "404",
    unit: "ppm",
    status: "SAFE",
    color: "bg-green-500",
    icon: <Waves size={22} />,
  },
  {
    title: "TEMPERATURE",
    value: "26.5",
    unit: "°C",
    status: "SAFE",
    color: "bg-green-500",
    icon: <Thermometer size={22} />,
  },
  {
    title: "TOXICITY INDEX",
    value: "0.13",
    unit: "",
    status: "SAFE",
    color: "bg-green-500",
    icon: <ShieldCheck size={22} />,
  },
];

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-slate-800 rounded-xl shadow-lg p-5 hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center">
            <div className="text-cyan-400">{card.icon}</div>

            <span
              className={`${card.color} text-xs px-3 py-1 rounded-full font-bold`}
            >
              {card.status}
            </span>
          </div>

          <p className="text-gray-400 mt-5 text-sm tracking-wider">
            {card.title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {card.value}
            <span className="text-lg ml-1 text-gray-300">
              {card.unit}
            </span>
          </h2>

          <p className="text-gray-500 mt-2 text-sm">
            Live Sensor Reading
          </p>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;