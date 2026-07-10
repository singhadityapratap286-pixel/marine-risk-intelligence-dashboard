export default function CircuitDiagramPanel() {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <h2 className="text-3xl font-bold">
        🔌 Circuit Diagram
      </h2>

      <p className="text-gray-400 mt-2 mb-8">
        ESP32 hardware wiring overview
      </p>

      <div className="grid grid-cols-3 gap-8 items-center">

        {/* Left Side */}

        <div className="space-y-6">

          {[
            ["pH Sensor", "ADC → A0"],
            ["Turbidity", "ADC → A1"],
            ["TDS Sensor", "ADC → A2"],
            ["Temperature Probe", "1-Wire → D4"],
            ["MFC Cell", "Analog → A3"],
          ].map(([title, pin]) => (

            <div
              key={title}
              className="bg-slate-700 border border-[#b8934a] rounded-xl p-5 text-center"
            >
              <h3 className="text-xl font-bold">
                {title}
              </h3>

              <p className="text-gray-400 mt-2">
                {pin}
              </p>
            </div>

          ))}

        </div>

        {/* ESP32 */}

        <div className="flex justify-center">

          <div className="bg-slate-900 border border-[#8a6c32] rounded-2xl w-64 h-64 flex flex-col justify-center items-center">

            <h2 className="text-4xl font-bold">
              ESP32
            </h2>

            <p className="text-gray-400 mt-4">
              Wi-Fi + ADC
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="space-y-8">

          <div className="bg-slate-700 border border-[#b8934a] rounded-xl p-5 text-center">
            <h3 className="text-xl font-bold">
              Wi-Fi Router
            </h3>

            <p className="text-gray-400 mt-2">
              Local Network
            </p>
          </div>

          <div className="bg-slate-700 border border-[#b8934a] rounded-xl p-5 text-center">
            <h3 className="text-xl font-bold">
              Backend API
            </h3>

            <p className="text-gray-400 mt-2">
              Node.js / Express
            </p>
          </div>

          <div className="bg-slate-700 border border-[#b8934a] rounded-xl p-5 text-center">
            <h3 className="text-xl font-bold">
              Power Supply
            </h3>

            <p className="text-gray-400 mt-2">
              5V USB / Battery
            </p>
          </div>

        </div>

      </div>

      <div className="flex gap-8 mt-10 text-sm text-gray-300">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#c9a962]"></div>
          Analog / Digital Sensor
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400"></div>
          MFC Signal
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          Power Line
        </div>

      </div>

    </div>
  );
}