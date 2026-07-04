import { useState } from "react";

export default function SubmitReportPanel() {
  const [form, setForm] = useState({
    title: "",
    type: "Discoloration",
    severity: "Medium",
    location: "",
    description: "",
    contact: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Report Submitted Successfully!");
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-2">
        📝 Submit Water Quality Report
      </h2>

      <p className="text-gray-400 mb-8">
        Community observations help verify sensor anomalies.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="text-gray-300">Title</label>

            <input
              className="w-full mt-2 bg-slate-700 rounded-lg p-3"
              placeholder="e.g. Discoloration near intake point"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-gray-300">Report Type</label>

            <select
              className="w-full mt-2 bg-slate-700 rounded-lg p-3"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option>Discoloration</option>
              <option>Bad Smell</option>
              <option>Foam</option>
              <option>Chemical Spill</option>
              <option>Dead Fish</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300">Severity</label>

            <select
              className="w-full mt-2 bg-slate-700 rounded-lg p-3"
              name="severity"
              value={form.severity}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300">Location</label>

            <input
              className="w-full mt-2 bg-slate-700 rounded-lg p-3"
              placeholder="Sector-4 Outflow"
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="mt-6">
          <label>Description</label>

          <textarea
            rows="5"
            className="w-full mt-2 bg-slate-700 rounded-lg p-3"
            placeholder="Describe what you observed..."
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">

          <div>
            <label>Upload Image</label>

            <input
              type="file"
              className="w-full mt-2 bg-slate-700 rounded-lg p-2"
            />
          </div>

          <div>
            <label>Contact (Optional)</label>

            <input
              className="w-full mt-2 bg-slate-700 rounded-lg p-3"
              placeholder="Email or Phone"
              name="contact"
              value={form.contact}
              onChange={handleChange}
            />
          </div>

        </div>

        <button
          className="mt-8 bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg font-bold"
        >
          Submit Report
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">
          Recent Community Reports
        </h3>

        <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-yellow-500">
          <h4 className="font-bold">
            Slight Odor Near Outflow Pipe
          </h4>

          <p className="text-gray-400 text-sm mt-2">
            Odor • Medium Severity • Yesterday 6:14 PM
          </p>

          <p className="mt-3">
            Noticed a faint chemical smell around evening. Report pending verification.
          </p>

          <span className="inline-block mt-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            Pending Review
          </span>
        </div>
      </div>
    </div>
  );
}