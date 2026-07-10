import { useState } from "react";

export default function ReportsPanel() {
  const [report] = useState({
    ph: "9.30",
    turbidity: "274.7",
    tds: "6960",
    temp: "28.9",
    mfc: "0.41V",
    device: "marine-dashboard-01",
    generated: new Date().toLocaleString(),
  });

  const downloadPDF = () => {
    alert("Demo: PDF download will be connected later.");
  };

  const items = [
    ["Source Code (GitHub)", "Included"],
    ["Circuit Diagram", "Reference Tab"],
    ["API Documentation", "Ready"],
    ["Database Schema", "MongoDB"],
    ["Test Cases", "Completed"],
    ["Final Report + PPT", "Available"],
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">📄 Reports</h2>
          <p className="text-slate-400">Downloadable demo & submission report</p>
        </div>

        <button
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-lg font-semibold">
          Download PDF Report
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Marine Dashboard - System Report</h3>
            <p className="text-slate-400">Generated: {report.generated}</p>
          </div>
          <div className="text-slate-400">Device: {report.device}</div>
        </div>

        <hr className="border-slate-700 my-6"/>

        <div className="grid grid-cols-5 gap-4 text-center">
          <div><div className="text-4xl font-bold text-[#c9a962]">{report.ph}</div><div>PH</div></div>
          <div><div className="text-4xl font-bold text-[#c9a962]">{report.turbidity}</div><div>Turbidity NTU</div></div>
          <div><div className="text-4xl font-bold text-[#c9a962]">{report.tds}</div><div>TDS PPM</div></div>
          <div><div className="text-4xl font-bold text-[#c9a962]">{report.temp}</div><div>Temp °C</div></div>
          <div><div className="text-4xl font-bold text-[#c9a962]">{report.mfc}</div><div>MFC</div></div>
        </div>

        <p className="text-slate-400 mt-8">
          This report summarizes the latest marine monitoring values. Backend PDF generation can be connected later.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Other Deliverables</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((i,index)=>(
            <div key={index} className="bg-slate-900 rounded-lg p-4 flex justify-between border border-slate-700">
              <span>{i[0]}</span>
              <span className="text-slate-400">{i[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
