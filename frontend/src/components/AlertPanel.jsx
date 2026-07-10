import { useState } from "react";

const alerts = [
  {type:"Critical",msg:"High Sea Surface Temperature detected near Arabian Sea.",time:"10:45 AM",badge:"DANGER",color:"border-red-500"},
  {type:"Critical",msg:"Wave height exceeded 5.2 m near Mumbai coast.",time:"10:41 AM",badge:"DANGER",color:"border-red-500"},
  {type:"Warning",msg:"Strong wind (48 km/h) detected.",time:"10:35 AM",badge:"WARNING",color:"border-yellow-500"},
  {type:"Warning",msg:"Heavy rainfall expected within 6 hours.",time:"10:22 AM",badge:"WARNING",color:"border-yellow-500"},
  {type:"Info",msg:"Satellite data synchronized successfully.",time:"10:15 AM",badge:"INFO",color:"border-green-500"},
  {type:"Info",msg:"AIS ship tracking updated.",time:"10:10 AM",badge:"INFO",color:"border-green-500"},
];

export default function AlertPanel() {
  const [filter, setFilter] = useState("All");
  const data = filter === "All" ? alerts : alerts.filter(a => a.type === filter);

  const buttonClass = (name) =>
    "px-4 py-2 rounded-full border " +
    (filter === name
      ? "bg-[#a4823f] border-[#a4823f]"
      : "border-slate-600 hover:bg-slate-700");

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold">🚨 Marine Alerts</h2>
      <p className="text-slate-400 mb-6">AI detected anomalies and threshold warnings</p>

      <div className="flex gap-3 mb-6 flex-wrap">
        {["All","Critical","Warning","Info"].map(item => (
          <button key={item} onClick={() => setFilter(item)} className={buttonClass(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {data.map((a,index) => (
          <div key={index} className={"bg-slate-900 rounded-xl p-5 border-l-4 flex justify-between items-start " + a.color}>
            <div>
              <h3 className="text-xl font-semibold">{a.msg}</h3>
              <p className="text-slate-400 mt-2">{a.time}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold">
              {a.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
