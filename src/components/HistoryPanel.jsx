import { useEffect, useState } from "react";

export default function HistoryPanel() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const time = now.toLocaleTimeString("en-US", {
        hour12: true,
      });

      const ph = (8.9 + Math.random() * 0.5).toFixed(2);
      const turbidity = (55 + Math.random() * 3).toFixed(1);
      const tds = Math.floor(2400 + Math.random() * 50);
      const temp = (28.5 + Math.random() * 0.4).toFixed(1);
      const mfc = (0.50 + Math.random() * 0.03).toFixed(2);

      const status =
        ph > 8.5 || turbidity > 30 || tds > 500
          ? "DANGER"
          : "SAFE";

      const newRow = {
        time,
        ph,
        turbidity,
        tds,
        temp,
        mfc,
        status,
      };

      setRows((prev) => [newRow, ...prev].slice(0, 50));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const header =
      "Time,pH,Turbidity,TDS,Temperature,MFC,Status\n";

    const csv =
      header +
      rows
        .map(
          (r) =>
            `${r.time},${r.ph},${r.turbidity},${r.tds},${r.temp},${r.mfc},${r.status}`
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "history.csv";

    link.click();
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-3xl font-bold">
            📜 History
          </h2>

          <p className="text-slate-400">
            Historical sensor readings
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-lg font-semibold"
        >
          Export CSV
        </button>

      </div>

      <div className="overflow-x-auto">

        <div className="max-h-[500px] overflow-y-auto">

          <table className="w-full text-left">

            <thead className="sticky top-0 bg-slate-900">

              <tr className="text-slate-300 border-b border-slate-700">

                <th className="py-3 px-3">TIME</th>

                <th className="py-3 px-3">PH</th>

                <th className="py-3 px-3">TURBIDITY</th>

                <th className="py-3 px-3">TDS</th>

                <th className="py-3 px-3">TEMP</th>

                <th className="py-3 px-3">MFC (V)</th>

                <th className="py-3 px-3">STATUS</th>

              </tr>

            </thead>

            <tbody>

              {rows.map((row, index) => (

                <tr
                  key={index}
                  className="border-b border-slate-700 hover:bg-slate-700"
                >

                  <td className="py-3 px-3">{row.time}</td>

                  <td className="py-3 px-3">{row.ph}</td>

                  <td className="py-3 px-3">{row.turbidity}</td>

                  <td className="py-3 px-3">{row.tds}</td>

                  <td className="py-3 px-3">{row.temp}</td>

                  <td className="py-3 px-3">{row.mfc}</td>

                  <td className="py-3 px-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.status === "DANGER"
                          ? "bg-red-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {row.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}