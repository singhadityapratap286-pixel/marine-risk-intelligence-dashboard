import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import AlertBell from "./AlertBell";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0d1b24]/95 backdrop-blur border-b border-[#c9a962]/25 text-white px-3 sm:px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#c9a962]"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-lg sm:text-xl text-[#e8d9ae] tracking-wide">⚓ Marine Intelligence</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <AlertBell />
        </div>
      </nav>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;
