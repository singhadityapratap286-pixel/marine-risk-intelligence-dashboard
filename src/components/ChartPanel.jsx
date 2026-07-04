import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function MarineChart({ title, color, data }) {
  return (
    <div className="bg-slate-700 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="Date" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip />
          <Line type="monotone" dataKey="SST" stroke={color} strokeWidth={3} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ChartPanel() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse("/data/global_sst_2024.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const rows = (results.data || [])
          .filter(r => r.Date && r.Sea_Surface_Temperature !== undefined)
          .slice(0, 80)
          .map(r => ({ Date: r.Date, SST: Number(r.Sea_Surface_Temperature) }));
        setChartData(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  const avg = useMemo(() => {
    if (!chartData.length) return "--";
    return (chartData.reduce((s,r)=>s+r.SST,0)/chartData.length).toFixed(2);
  }, [chartData]);

  if (loading) {
    return <div className="bg-slate-800 rounded-xl p-6 shadow-lg"><h2 className="text-3xl font-bold">📈 Marine SST Analytics</h2><p className="mt-4">Loading CSV...</p></div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">📈 Marine SST Analytics</h2>
        <div className="bg-cyan-600 px-4 py-2 rounded-lg font-bold">Avg SST: {avg}°C</div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <MarineChart title="Sea Surface Temperature" color="#06b6d4" data={chartData}/>
        <MarineChart title="Temperature Trend" color="#ef4444" data={chartData}/>
        <MarineChart title="Ocean Monitoring" color="#22c55e" data={chartData}/>
        <MarineChart title="Marine Climate" color="#f59e0b" data={chartData}/>
      </div>
    </div>
  );
}