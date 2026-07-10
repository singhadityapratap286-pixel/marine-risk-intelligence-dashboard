import { useState } from "react";
import { Bell } from "lucide-react";
import { useAlerts } from "../context/AlertContext";

const LEVEL_DOT = { Low: "bg-green-400", Moderate: "bg-yellow-400", High: "bg-orange-400", Severe: "bg-red-500" };

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function AlertBell() {
  const { alerts, unreadCount, markAllRead } = useAlerts();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) markAllRead();
        }}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-[#c9a962]"
        aria-label="Alerts"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#7a3b3b] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[#12222b] border border-[#c9a962]/25 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="px-4 py-3 border-b border-[#c9a962]/15 font-display text-[#e8d9ae] text-base">Live Alerts</div>
            {alerts.map((a) => (
              <div key={a.id} className="px-4 py-3 border-b border-white/5 last:border-b-0 flex gap-3">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${LEVEL_DOT[a.level] || "bg-gray-400"}`} />
                <div>
                  <div className="text-sm font-medium">{a.zone}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.text}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{timeAgo(a.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AlertBell;
