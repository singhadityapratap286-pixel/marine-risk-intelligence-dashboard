export default function ApiDocsPanel() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/readings",
      desc: "Ingests a new sensor reading from the ESP32 firmware.",
      body: `{
  "deviceId":"bio-shield-01",
  "ph":7.2,
  "turbidity":3.8,
  "temperature":26.4,
  "tds":412,
  "mfcVoltage":0.51,
  "toxicityScore":0.18,
  "timestamp":"2026-07-01T10:42:00"
}`
    },

    {
      method: "GET",
      path: "/api/readings/latest",
      desc: "Returns latest sensor reading.",
      body: "GET /api/readings/latest?deviceId=bio-shield-01"
    },

    {
      method: "GET",
      path: "/api/readings/history",
      desc: "Returns historical readings.",
      body: "GET /api/readings/history?deviceId=bio-shield-01&from=2026-06-25&to=2026-07-01"
    },

    {
      method: "GET",
      path: "/api/alerts",
      desc: "Returns active alerts."
    },

    {
      method: "POST",
      path: "/api/config",
      desc: "Update threshold configuration.",
      body: `{
  "ph":{"min":6.5,"max":8.5},
  "turbidity":{"min":0,"max":5}
}`
    },

    {
      method: "GET",
      path: "/api/config",
      desc: "Returns current threshold configuration."
    },

    {
      method: "GET",
      path: "/api/health",
      desc: "Backend health status."
    }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <h2 className="text-3xl font-bold">
        📘 REST API Documentation
      </h2>

      <p className="text-gray-400 mt-2 mb-8">
        Backend REST endpoints
      </p>

      {endpoints.map((api, i) => (

        <div
          key={i}
          className="bg-slate-700 rounded-xl p-5 mb-6"
        >

          <div className="flex items-center gap-4 mb-3">

            <span
              className={`px-3 py-1 rounded text-xs font-bold ${
                api.method === "GET"
                  ? "bg-green-700"
                  : "bg-yellow-700"
              }`}
            >
              {api.method}
            </span>

            <code className="text-xl">
              {api.path}
            </code>

          </div>

          <p className="text-gray-400 mb-4">
            {api.desc}
          </p>

          {api.body && (
            <pre className="bg-slate-900 rounded-lg p-4 overflow-auto text-[#dcc07f] text-sm">
              {api.body}
            </pre>
          )}

        </div>

      ))}

    </div>
  );
}