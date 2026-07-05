import { NavLink } from "react-router-dom";

function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-cyan-400 font-bold"
      : "text-white hover:text-cyan-400 transition duration-200";

  return (
    <nav className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">

      <h2 className="text-2xl font-bold">
        🌊 Marine Intelligence
      </h2>

      <div className="flex gap-6 text-sm">

        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/history" className={linkClass}>
          History
        </NavLink>

        <NavLink to="/configuration" className={linkClass}>
          Configuration
        </NavLink>

        <NavLink to="/reports" className={linkClass}>
          Reports
        </NavLink>

        <NavLink to="/account" className={linkClass}>
          Account
        </NavLink>

        <NavLink to="/submit-report" className={linkClass}>
          Submit Report
        </NavLink>

        <NavLink to="/ai-assistant" className={linkClass}>
          AI Assistant
        </NavLink>

        <NavLink to="/help-desk" className={linkClass}>
          Help Desk
        </NavLink>

        <NavLink to="/circuit-diagram" className={linkClass}>
          Circuit
        </NavLink>

        <NavLink to="/api-docs" className={linkClass}>
          API Docs
        </NavLink>

        <NavLink to="/system-about" className={linkClass}>
          About
        </NavLink>

      </div>

    </nav>
  );
}

export default Navbar;