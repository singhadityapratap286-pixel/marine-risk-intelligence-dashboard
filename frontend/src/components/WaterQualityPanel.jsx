import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const liveData = [
  { time: "10:00", value: 0.12 },
  { time: "10:05", value: 0.15 },
  { time: "10:10", value: 0.18 },
  { time: "10:15", value: 0.16 },
  { time: "10:20", value: 0.39 },
];

const historyData = [
  { time: "10:00", value: 0.10 },
  { time: "10:05", value: 0.11 },
  { time: "10:10", value: 0.14 },
  { time: "10:15", value: 0.15 },
  { time: "10:20", value: 0.16 },
  { time: "10:25", value: 0.13 },
  { time: "10:30", value: 0.18 },
  { time: "10:35", value: 0.22 },
  { time: "10:40", value: 0.20 },
  { time: "10:45", value: 0.28 },
  { time: "10:50", value: 0.35 },
  { time: "10:55", value: 0.39 },
];

function WaterQualityPanel() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg mt-8">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-3xl font-bold">
            🌊 Marine Water Quality
          </h2>

          <p className="text-gray-400 mt-1">
            Live marine water quality monitoring
          </p>

        </div>

        <span className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold">
          WATCH
        </span>

      </div>

      <div className="bg-slate-900 rounded-xl p-5">

        <h3 className="text-xl font-bold">
          Live Water Quality Sensor
        </h3>

        <p className="text-gray-400 mb-4">
          Real-time ocean monitoring
        </p>

        <ResponsiveContainer width="100%" height={250}>

          <AreaChart data={liveData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              fill="#0891b2"
              fillOpacity={0.35}
            />

          </AreaChart>

        </ResponsiveContainer>
                <div className="grid md:grid-cols-2 gap-6 mt-6">

          <div>

            <h1 className="text-6xl font-bold text-yellow-400">
              0.39
            </h1>

            <p className="text-gray-400 mt-2">
              Marine Water Quality Index
            </p>

          </div>

          <div className="text-right text-gray-300">

            <p>
              This score represents the current
              marine water quality based on
              temperature, salinity, dissolved
              oxygen and pollution indicators.
            </p>

          </div>

        </div>

      </div>

      <div className="bg-slate-900 rounded-xl p-5 mt-8">

        <h3 className="text-2xl font-bold mb-2">
          Water Quality History
        </h3>

        <p className="text-gray-400 mb-4">
          Historical monitoring values
        </p>

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={historyData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#facc15"
              strokeWidth={3}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default WaterQualityPanel;