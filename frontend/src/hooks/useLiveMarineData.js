import { useEffect, useRef, useState } from "react";

// Base readings per named zone — these stand in for a real sensor/API feed.
// Each field drifts slightly on every tick via a bounded random walk, so the
// whole dashboard visibly "breathes" instead of showing static numbers.
const BASELINES = {
  dakar: { waveHeight: 1.8, windSpeed: 28, pressureDrop: 4, waterTemp: 0.8, swellPeriod: 10.5, ph: 8.05, turbidity: 3.4, tds: 380, temperature: 27.5 },
  lagos: { waveHeight: 1.4, windSpeed: 21, pressureDrop: 2, waterTemp: 0.5, swellPeriod: 11, ph: 8.1, turbidity: 2.8, tds: 360, temperature: 28.6 },
  fortaleza: { waveHeight: 0.9, windSpeed: 16, pressureDrop: 1, waterTemp: 0.3, swellPeriod: 12.5, ph: 8.15, turbidity: 2.1, tds: 340, temperature: 27.9 },
  capetown: { waveHeight: 3.1, windSpeed: 46, pressureDrop: 9, waterTemp: 1.6, swellPeriod: 7.5, ph: 7.9, turbidity: 5.2, tds: 420, temperature: 18.4 },
};

const DRIFT = {
  waveHeight: 0.06, windSpeed: 1.2, pressureDrop: 0.3, waterTemp: 0.05,
  swellPeriod: 0.15, ph: 0.015, turbidity: 0.12, tds: 3, temperature: 0.08,
};

function randomWalk(value, drift, min, max) {
  const next = value + (Math.random() - 0.5) * 2 * drift;
  return Math.max(min, Math.min(max, next));
}

const BOUNDS = {
  waveHeight: [0.2, 6], windSpeed: [5, 90], pressureDrop: [0, 22], waterTemp: [0, 3.5],
  swellPeriod: [5, 16], ph: [7.4, 8.6], turbidity: [0.5, 12], tds: [150, 650], temperature: [22, 32],
};

/**
 * Simulates a live marine-data feed for a given zone. Ticks every
 * `intervalMs` and drifts each value a small, bounded amount — designed to
 * feel "live" without ever jumping to an unrealistic reading.
 *
 * Swap the body of the interval callback for a real fetch() to a sensor/API
 * endpoint later; the returned shape stays identical for every consumer.
 */
export function useLiveMarineData(zone = "dakar", intervalMs = 4000) {
  const [data, setData] = useState({ ...BASELINES[zone] });
  const prevRef = useRef({ ...BASELINES[zone] });

  useEffect(() => {
    setData({ ...BASELINES[zone] });
    prevRef.current = { ...BASELINES[zone] };

    const id = setInterval(() => {
      setData((current) => {
        const next = {};
        for (const key of Object.keys(current)) {
          const [min, max] = BOUNDS[key] || [0, Infinity];
          next[key] = randomWalk(current[key], DRIFT[key] || 0, min, max);
        }
        prevRef.current = current;
        return next;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [zone, intervalMs]);

  const trend = {};
  for (const key of Object.keys(data)) {
    const diff = data[key] - (prevRef.current[key] ?? data[key]);
    trend[key] = diff > 0.01 ? "up" : diff < -0.01 ? "down" : "flat";
  }

  return { data, trend, zones: Object.keys(BASELINES) };
}

export { BASELINES };
