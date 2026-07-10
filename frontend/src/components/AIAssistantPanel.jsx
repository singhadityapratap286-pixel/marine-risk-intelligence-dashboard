import { useState } from "react";

export default function AIAssistantPanel() {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hi — I'm the Bio-Shield Aqua assistant. I can explain live sensor readings, alerts, toxicity behaviour and general water quality questions. What would you like to know?"
    }
  ]);

  function askAI(text) {
    if (!text.trim()) return;

    let reply =
      "I can help explain pH, Turbidity, TDS, Temperature and toxicity values.";

    const q = text.toLowerCase();

    if (q.includes("ph"))
      reply =
        "Safe pH range is 6.5–8.5. Higher values indicate alkaline water.";

    else if (q.includes("tds"))
      reply =
        "TDS measures dissolved solids. High TDS may affect water quality.";

    else if (q.includes("turbidity"))
      reply =
        "High turbidity means more suspended particles in water.";

    else if (q.includes("temperature"))
      reply =
        "Water temperature affects dissolved oxygen and aquatic life.";

    else if (q.includes("safe"))
      reply =
        "Water is considered safe only if all sensor values remain inside their safe ranges.";

    setMessages([
      ...messages,
      { sender: "You", text },
      { sender: "AI", text: reply },
    ]);

    setQuestion("");
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-3xl font-bold">
            🤖 Bio-Shield AI Assistant
          </h2>

          <p className="text-gray-400 mt-2">
            Ask about live readings, alerts or water quality.
          </p>
        </div>

        <span className="bg-green-600 px-4 py-2 rounded-full text-sm font-bold">
          ● Connected
        </span>

      </div>

      <div className="flex flex-wrap gap-3 mb-6">

        {[
          "Is the water safe?",
          "What is TDS?",
          "Explain pH",
          "High Turbidity"
        ].map((item) => (
          <button
            key={item}
            onClick={() => askAI(item)}
            className="bg-slate-700 hover:bg-[#a4823f] px-4 py-2 rounded-full text-sm"
          >
            {item}
          </button>
        ))}

      </div>

      <div className="bg-slate-900 rounded-xl p-5 h-[350px] overflow-y-auto">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`mb-5 ${
              msg.sender === "AI"
                ? "text-[#dcc07f]"
                : "text-white"
            }`}
          >
            <strong>{msg.sender}:</strong>

            <p className="mt-1">
              {msg.text}
            </p>

          </div>

        ))}

      </div>

      <div className="flex gap-4 mt-6">

        <input
          className="flex-1 bg-slate-700 rounded-lg p-3"
          placeholder="Ask anything about water quality..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          onClick={() => askAI(question)}
          className="bg-[#a4823f] hover:bg-[#8a6c32] px-8 rounded-lg font-bold"
        >
          Send
        </button>

      </div>

    </div>
  );
}