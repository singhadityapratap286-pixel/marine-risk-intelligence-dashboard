import { useState } from "react";

export default function HelpDeskPanel() {
  const [ticket, setTicket] = useState({
    name: "",
    email: "",
    priority: "Medium",
    subject: "",
    message: "",
  });

  const faqs = [
    "How often does the ESP32 send new readings?",
    "What does WATCH status mean vs ALERT?",
    "Why did the MFC voltage drop?",
    "Can I change the safe-range thresholds?",
    "How do I report something I observed at the water site?"
  ];

  function handleChange(e) {
    setTicket({
      ...ticket,
      [e.target.name]: e.target.value,
    });
  }

  function submitTicket(e) {
    e.preventDefault();
    alert("Support Ticket Submitted!");
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">

      <h2 className="text-3xl font-bold">
        🛠 Help Desk
      </h2>

      <p className="text-gray-400 mt-2 mb-8">
        Support tickets and frequently asked questions
      </p>

      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div className="bg-slate-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold">📧 Email</h3>
          <p className="text-[#c9a962] mt-4">
            support@bioshieldaqua.io
          </p>
        </div>

        <div className="bg-slate-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold">📞 Phone</h3>
          <p className="text-[#c9a962] mt-4">
            +91 1800-000-000
          </p>
        </div>

        <div className="bg-slate-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold">⏰ Response</h3>
          <p className="text-green-400 mt-4">
            Less than 24 Hours
          </p>
        </div>

      </div>

      <form onSubmit={submitTicket}>

        <h3 className="text-2xl font-bold mb-6">
          Raise a Support Ticket
        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          <input
            className="bg-slate-700 rounded-lg p-3"
            placeholder="Name"
            name="name"
            value={ticket.name}
            onChange={handleChange}
          />

          <input
            className="bg-slate-700 rounded-lg p-3"
            placeholder="Email"
            name="email"
            value={ticket.email}
            onChange={handleChange}
          />

          <select
            className="bg-slate-700 rounded-lg p-3"
            name="priority"
            value={ticket.priority}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <input
            className="bg-slate-700 rounded-lg p-3"
            placeholder="Subject"
            name="subject"
            value={ticket.subject}
            onChange={handleChange}
          />

        </div>

        <textarea
          rows="5"
          className="w-full mt-6 bg-slate-700 rounded-lg p-3"
          placeholder="Describe your issue..."
          name="message"
          value={ticket.message}
          onChange={handleChange}
        />

        <button className="mt-6 bg-[#a4823f] hover:bg-[#8a6c32] px-8 py-3 rounded-lg font-bold">
          Submit Ticket
        </button>

      </form>

      <div className="mt-10">

        <h3 className="text-2xl font-bold mb-4">
          Your Tickets
        </h3>

        <div className="bg-slate-700 rounded-lg p-5 flex justify-between items-center">

          <div>
            <p className="text-gray-400">
              TK-2291 • Medium Priority
            </p>

            <h4 className="text-lg font-bold mt-2">
              Dashboard not updating on mobile Safari
            </h4>
          </div>

          <span className="bg-green-600 px-4 py-2 rounded-full text-sm">
            RESOLVED
          </span>

        </div>

      </div>

      <div className="mt-10">

        <h3 className="text-2xl font-bold mb-5">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">

          {faqs.map((faq, index) => (

            <details
              key={index}
              className="bg-slate-700 rounded-lg p-4"
            >
              <summary className="cursor-pointer font-semibold">
                {faq}
              </summary>

              <p className="mt-3 text-gray-300">
                This is a demo answer for the Bio-Shield Help Desk.
              </p>

            </details>

          ))}

        </div>

      </div>

    </div>
  );
}