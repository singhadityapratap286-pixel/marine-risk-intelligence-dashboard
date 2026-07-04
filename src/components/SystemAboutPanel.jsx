export default function SystemAboutPanel() {
  const stack = [
    "ESP32 + Arduino IDE",
    "Node.js + Express",
    "MongoDB / Firebase",
    "React Dashboard",
    "Chart.js / Recharts",
    "Socket.io Live Updates",
    "JWT Authentication",
    "PDF Report Export",
    "REST API + JSON",
  ];

  const team = [
    {
      no: "01",
      role: "Hardware Lead",
      work: "Sensors, wiring, calibration",
    },
    {
      no: "02",
      role: "Firmware Developer",
      work: "ESP32 code & JSON payloads",
    },
    {
      no: "03",
      role: "Backend Developer",
      work: "API, validation, database",
    },
    {
      no: "04",
      role: "Frontend Developer",
      work: "Dashboard UI",
    },
    {
      no: "05",
      role: "Charts & UX Developer",
      work: "Live graphs, status cards",
    },
    {
      no: "06",
      role: "AI / Anomaly Developer",
      work: "Alerts & threshold logic",
    },
    {
      no: "07",
      role: "Testing & Integration",
      work: "End-to-end checks",
    },
    {
      no: "08",
      role: "Docs & Deployment",
      work: "Report, PPT, GitHub",
    },
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <h2 className="text-3xl font-bold">
        ⚙️ System / About
      </h2>

      <p className="text-gray-400 mt-2 mb-8">
        Architecture, technology stack and project overview
      </p>

      {/* Data Flow */}

      <div className="bg-slate-700 rounded-xl p-6 mb-8">

        <h3 className="text-xl font-semibold mb-6">
          Data Flow Architecture
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-3">

          <div className="bg-slate-900 px-6 py-5 rounded-lg text-center">
            <h4 className="font-bold">Sensors</h4>
            <p className="text-gray-400 text-sm mt-2">
              pH • Turbidity • TDS • Temp • MFC
            </p>
          </div>

          <span className="text-2xl text-cyan-400">→</span>

          <div className="bg-slate-900 px-6 py-5 rounded-lg text-center">
            <h4 className="font-bold">ESP32</h4>
            <p className="text-gray-400 text-sm mt-2">
              Firmware
            </p>
          </div>

          <span className="text-2xl text-cyan-400">→</span>

          <div className="bg-slate-900 px-6 py-5 rounded-lg text-center">
            <h4 className="font-bold">
              Backend API
            </h4>
            <p className="text-gray-400 text-sm mt-2">
              Node.js + Express
            </p>
          </div>

          <span className="text-2xl text-cyan-400">→</span>

          <div className="bg-slate-900 px-6 py-5 rounded-lg text-center">
            <h4 className="font-bold">
              MongoDB
            </h4>
          </div>

          <span className="text-2xl text-cyan-400">→</span>

          <div className="bg-slate-900 px-6 py-5 rounded-lg text-center">
            <h4 className="font-bold">
              React Dashboard
            </h4>
          </div>

        </div>

      </div>

      {/* Tech Stack */}

      <div className="bg-slate-700 rounded-xl p-6 mb-8">

        <h3 className="text-xl font-semibold mb-6">
          Tech Stack
        </h3>

        <div className="grid md:grid-cols-3 gap-4">

          {stack.map((item, index) => (

            <div
              key={index}
              className="bg-slate-900 rounded-lg py-5 text-center font-semibold"
            >
              {item}
            </div>

          ))}

        </div>

      </div>

      {/* Team */}

      <div className="bg-slate-700 rounded-xl p-6">

        <h3 className="text-xl font-semibold mb-6">
          Team of 8
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          {team.map((member) => (

            <div
              key={member.no}
              className="bg-slate-900 rounded-lg p-5 flex gap-5 items-center"
            >

              <div className="w-12 h-12 rounded-lg bg-cyan-600 flex items-center justify-center font-bold">
                {member.no}
              </div>

              <div>

                <h4 className="font-bold text-lg">
                  {member.role}
                </h4>

                <p className="text-gray-400 text-sm">
                  {member.work}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}