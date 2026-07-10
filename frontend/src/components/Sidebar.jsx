import { NavLink } from "react-router-dom";
import {
  X, Home, LayoutGrid, Fish, History, Settings, FileText,
  UserCircle, UserPlus, FileEdit, Bot, LifeBuoy, CircuitBoard,
  BookOpen, Info,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "Main",
    items: [
      { to: "/", label: "Home", icon: Home, end: true },
      { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { to: "/fishermen", label: "Fishermen Zone", icon: Fish, highlight: true },
    ],
  },
  {
    title: "Records",
    items: [
      { to: "/history", label: "History", icon: History },
      { to: "/reports", label: "Reports", icon: FileText },
      { to: "/submit-report", label: "Submit Report", icon: FileEdit },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/account", label: "Account", icon: UserCircle },
      { to: "/register", label: "Register", icon: UserPlus },
      { to: "/configuration", label: "Configuration", icon: Settings },
    ],
  },
  {
    title: "Support",
    items: [
      { to: "/ai-assistant", label: "AI Assistant", icon: Bot },
      { to: "/help-desk", label: "Help Desk", icon: LifeBuoy },
      { to: "/circuit-diagram", label: "Circuit Diagram", icon: CircuitBoard },
      { to: "/api-docs", label: "API Docs", icon: BookOpen },
      { to: "/system-about", label: "About", icon: Info },
    ],
  },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={
          "fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 " +
          (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={
          "fixed top-0 left-0 h-full w-[300px] max-w-[85vw] z-[70] " +
          "bg-gradient-to-b from-[#0d1b24] to-[#0a1620] border-r border-[#c9a962]/25 " +
          "shadow-2xl flex flex-col transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#c9a962]/20">
          <div>
            <div className="font-display text-2xl text-[#e8d9ae] tracking-wide">⚓ Marine</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#c9a962]/70 mt-0.5">Intelligence Registry</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-300 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <div className="px-6 mb-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[#8a95a0] font-semibold">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      "flex items-center gap-3 mx-3 px-3.5 py-2.5 rounded-lg text-[14.5px] transition-colors border-l-2 " +
                      (isActive
                        ? "bg-[#c9a962]/12 border-[#c9a962] text-[#e8d9ae] font-semibold"
                        : "border-transparent text-slate-300 hover:bg-white/5 hover:border-[#c9a962]/40")
                    }
                  >
                    <Icon size={17} className={item.highlight ? "text-emerald-400" : ""} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#c9a962]/20 text-[11px] text-slate-500">
          🌊 Marine Risk Intelligence Dashboard
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
