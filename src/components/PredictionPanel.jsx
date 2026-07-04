function PredictionPanel() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">
        🤖 AI Prediction Panel
      </h2>

      <div className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-gray-400">Risk Level</h3>
          <p className="text-red-400 text-2xl font-bold">
            High
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-gray-400">AI Confidence</h3>
          <p className="text-cyan-400 text-2xl font-bold">
            96%
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-gray-400">Suggested Action</h3>
          <p className="text-green-400 font-semibold">
            Deploy Coast Guard Patrol
          </p>
        </div>
      </div>
    </div>
  );
}

export default PredictionPanel;