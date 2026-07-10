import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const RISK_COLORS = { Warning: "#ef4444", Watch: "#f59e0b" };

export default function ChartPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse("/data/atlantic_heatwaves.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setRows((results.data || []).filter((r) => r.Date && r.Sea_Surface_Temperature != null));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  // Daily basin-wide average SST, one point per date (no duplication across stations)
  const dailyTrend = useMemo(() => {
    const byDate = {};
    rows.forEach((r) => {
      if (!byDate[r.Date]) byDate[r.Date] = { sum: 0, count: 0, anomalySum: 0 };
      byDate[r.Date].sum += Number(r.Sea_Surface_Temperature);
      byDate[r.Date].anomalySum += Number(r.SST_Anomaly);
      byDate[r.Date].count += 1;
    });
    return Object.entries(byDate)
      .map(([Date, v]) => ({
        Date,
        SST: Number((v.sum / v.count).toFixed(2)),
        Anomaly: Number((v.anomalySum / v.count).toFixed(2)),
      }))
      .sort((a, b) => (a.Date > b.Date ? 1 : -1));
  }, [rows]);

  // Monthly risk-event counts (a genuinely different view of the same dataset)
  const monthlyRisk = useMemo(() => {
    const byMonth = {};
    rows.forEach((r) => {
      const key = r.Month || r.Date?.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { Watch: 0, Warning: 0 };
      if (r.Heatwave_Risk === "Warning") byMonth[key].Warning += 1;
      else if (r.Heatwave_Risk === "Watch") byMonth[key].Watch += 1;
    });
    return Object.entries(byMonth).map(([Month, v]) => ({ Month, ...v }));
  }, [rows]);

  const avgSST = useMemo(() => {
    if (!dailyTrend.length) return "--";
    return (dailyTrend.reduce((s, r) => s + r.SST, 0) / dailyTrend.length).toFixed(2);
  }, [dailyTrend]);

  const warningDays = useMemo(
    () => monthlyRisk.reduce((s, m) => s + m.Warning, 0),
    [monthlyRisk]
  );

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold">📈 Marine SST Analytics</h2>
        <p className="mt-4 text-slate-400">Loading dataset…</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <h2 className="text-3xl font-bold">📈 Marine SST Analytics</h2>
        <div className="flex gap-3">
          <div className="bg-[#a4823f] px-4 py-2 rounded-lg font-bold">Avg SST: {avgSST}°C</div>
          <div className="bg-red-600/80 px-4 py-2 rounded-lg font-bold">Warning events: {warningDays}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-700 rounded-xl p-5">
          <h3 className="text-xl font-semibold mb-4">Basin-wide Sea Surface Temperature (2024)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="Date" stroke="#cbd5e1" tick={false} />
              <YAxis stroke="#cbd5e1" domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="SST" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-700 rounded-xl p-5">
          <h3 className="text-xl font-semibold mb-4">Daily SST Anomaly vs. 30-day Average</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="Date" stroke="#cbd5e1" tick={false} />
              <YAxis stroke="#cbd5e1" domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="Anomaly" stroke="#ef4444" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-700 rounded-xl p-5 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Monthly Heatwave Risk Events (Watch vs Warning)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="Month" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="Watch" fill={RISK_COLORS.Watch} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Warning" fill={RISK_COLORS.Warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
