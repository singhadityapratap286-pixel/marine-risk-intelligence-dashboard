import { createContext, useContext, useEffect, useRef, useState } from "react";

const AlertContext = createContext(null);

const ALERT_POOL = [
  { zone: "Mumbai Coast", text: "Wind speed crossed 45 km/h — small craft advisory active.", level: "High" },
  { zone: "Chennai Coast", text: "Swell period shortening — choppier conditions expected by evening.", level: "Moderate" },
  { zone: "Surat Coast", text: "Conditions stable — safe for coastal fishing.", level: "Low" },
  { zone: "Kochi Coast", text: "Pressure dropping steadily over 6 hours — monitor for storm formation.", level: "Moderate" },
  { zone: "Mumbai Coast", text: "Cyclone probability model updated — risk trending upward.", level: "High" },
];

let idCounter = 1;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([
    { id: idCounter++, ...ALERT_POOL[0], time: new Date(), read: false },
  ]);
  const poolIndex = useRef(1);

  useEffect(() => {
    const id = setInterval(() => {
      const next = ALERT_POOL[poolIndex.current % ALERT_POOL.length];
      poolIndex.current += 1;
      setAlerts((prev) => [
        { id: idCounter++, ...next, time: new Date(), read: false },
        ...prev,
      ].slice(0, 20));
    }, 25000);
    return () => clearInterval(id);
  }, []);

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, markAllRead }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}
