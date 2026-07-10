import { FileText, Map, Download } from "lucide-react";

const RESOURCES = [
  {
    title: "Atlantic Heatwave Report (PDF)",
    description: "Full technical write-up of the Atlantic SST heatwave analysis.",
    href: "/resources/atlantic_heatwave_report.pdf",
    icon: FileText,
  },
  {
    title: "Global SST Export (PDF)",
    description: "Full-resolution global monitoring grid export from QGIS.",
    href: "/resources/atlantic_heatwave_global_export.pdf",
    icon: FileText,
  },
  {
    title: "QGIS Project File (.qgz)",
    description: "Source GIS project used to build and validate the risk map.",
    href: "/resources/atlantic_heatwave_project.qgz",
    icon: Map,
  },
];

export default function GISResourcesPanel() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-1">📂 GIS Data & Reports</h2>
      <p className="text-sm text-slate-400 mb-6">
        Source datasets and analysis files behind the Atlantic heatwave map.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        {RESOURCES.map((res) => {
          const Icon = res.icon;
          return (
            <a
              key={res.href}
              href={res.href}
              download
              className="bg-slate-700 hover:bg-slate-600 transition-colors rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Icon className="text-[#c9a962]" size={22} />
                <Download size={16} className="text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{res.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{res.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
