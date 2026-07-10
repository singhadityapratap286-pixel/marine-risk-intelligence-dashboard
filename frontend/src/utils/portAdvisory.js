// ---------------------------------------------------------------------------
// Unified Port Advisory Engine
// ---------------------------------------------------------------------------
// Every port in the app (India, Global, or the legacy Atlantic list) gets run
// through this single function. It prefers a REAL nearby observation from
// the Atlantic heatwave monitoring CSV when the port is close enough to a
// station; otherwise it falls back to the global climatology model so that
// ports in the Indian Ocean, Pacific, Mediterranean, etc. still get an
// honest, physically-motivated estimate instead of being left blank.
// ---------------------------------------------------------------------------
import { nearest } from "./geo";
import { estimatePortConditions } from "./marineClimatology";

export const COVERAGE_LIMIT_KM = 1600;
const ANOMALY_CAUTION_THRESHOLD = 2.0;

export const VERDICT_STYLE = {
  Favorable: {
    color: "#22c55e",
    badge: "bg-green-500/20 text-green-400 border-green-500/40",
    label: "✅ Favorable",
  },
  Caution: {
    color: "#f59e0b",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    label: "⚠️ Caution",
  },
  "Not Recommended": {
    color: "#ef4444",
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
    label: "🚫 Not Recommended",
  },
  "Limited Data": {
    color: "#94a3b8",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    label: "❔ Limited Data",
  },
};

function verdictFromStation(station, distanceKm) {
  if (station.Heatwave_Risk === "Warning") {
    return {
      verdict: "Not Recommended",
      reason: `Active heatwave warning at the nearest live station (+${Number(station.SST_Anomaly).toFixed(
        1
      )}°C anomaly). Expect stressed fish stocks and unstable conditions.`,
    };
  }
  if (station.Heatwave_Risk === "Watch" && Number(station.SST_Anomaly) > ANOMALY_CAUTION_THRESHOLD) {
    return {
      verdict: "Caution",
      reason: `Heatwave watch in effect nearby, anomaly is elevated (+${Number(station.SST_Anomaly).toFixed(
        1
      )}°C). Fish with care and watch for advisory upgrades.`,
    };
  }
  return {
    verdict: "Favorable",
    reason: `Nearest live station shows only a routine watch-level anomaly (+${Number(
      station.SST_Anomaly
    ).toFixed(1)}°C). Conditions currently support normal fishing activity.`,
  };
}

/**
 * getPortAdvisory(port, csvStations)
 * -> { verdict, reason, source: "live" | "modeled", distanceKm?, station?, conditions, ...modelFields }
 *
 * csvStations: array of { lat, lon, Heatwave_Risk, SST_Anomaly, ... } from the
 * Atlantic monitoring CSV for the latest date, or [] if not loaded yet.
 *
 * `conditions` is always populated — { waveHeight, windSpeed, pressureDrop,
 * waterTemp, swellPeriod } — suitable for utils/riskEngine.getFishingAdvisory.
 * The CSV only ever reports sea-surface-temperature, never wind/wave/pressure,
 * so those four always come from the climatology model; only the temperature
 * anomaly (waterTemp) is swapped for a real reading when a live station is
 * close enough.
 */
export function getPortAdvisory(port, csvStations = []) {
  const model = estimatePortConditions(port.lat, port.lon);

  if (csvStations.length) {
    const { item: station, distanceKm } = nearest(port.lat, port.lon, csvStations);
    if (station && distanceKm <= COVERAGE_LIMIT_KM) {
      const { verdict, reason } = verdictFromStation(station, distanceKm);
      const liveAnomaly = Number(station.SST_Anomaly);
      return {
        ...model,
        verdict,
        reason,
        source: "live",
        distanceKm,
        station,
        sstAnomaly: liveAnomaly,
        conditions: {
          waveHeight: model.waveHeight,
          windSpeed: model.windSpeed,
          pressureDrop: model.pressureDrop,
          waterTemp: liveAnomaly,
          swellPeriod: model.swellPeriod,
        },
      };
    }
  }

  return {
    ...model,
    distanceKm: null,
    station: null,
    conditions: {
      waveHeight: model.waveHeight,
      windSpeed: model.windSpeed,
      pressureDrop: model.pressureDrop,
      waterTemp: model.sstAnomaly,
      swellPeriod: model.swellPeriod,
    },
  };
}

/**
 * annotatePorts(ports, csvStations) -> ports with advisory fields merged in.
 */
export function annotatePorts(ports, csvStations = []) {
  return ports.map((port) => ({ ...port, ...getPortAdvisory(port, csvStations) }));
}
