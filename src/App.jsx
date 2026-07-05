import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Configuration from "./pages/Configuration";
import Reports from "./pages/Reports";
import Account from "./pages/Account";
import Register from "./pages/Register";
import SubmitReport from "./pages/SubmitReport";
import AIAssistant from "./pages/AIAssistant";
import HelpDesk from "./pages/HelpDesk";
import CircuitDiagram from "./pages/CircuitDiagram";
import ApiDocs from "./pages/ApiDocs";
import SystemAbout from "./pages/SystemAbout";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/history" element={<History />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/reports" element={<Reports />} />

        <Route path="/account" element={<Account />} />
        <Route path="/register" element={<Register />} />

        <Route path="/submit-report" element={<SubmitReport />} />

        <Route path="/ai-assistant" element={<AIAssistant />} />

        <Route path="/help-desk" element={<HelpDesk />} />

        <Route path="/circuit-diagram" element={<CircuitDiagram />} />

        <Route path="/api-docs" element={<ApiDocs />} />

        <Route path="/system-about" element={<SystemAbout />} />
      </Routes>
    </div>
  );
}

export default App;