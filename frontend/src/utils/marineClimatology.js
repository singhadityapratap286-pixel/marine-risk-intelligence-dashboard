// ---------------------------------------------------------------------------
// Global Marine Climatology Model
// ---------------------------------------------------------------------------
// The project's only real observation feed (public/data/atlantic_heatwaves.csv)
// covers a single Atlantic monitoring grid. To give a feasibility verdict for
// every fishing port on Earth — not just the ~38 Atlantic ones — this module
// provides a transparent, physically-motivated ESTIMATE for any lat/lon/date:
//   - a seasonal sea-surface-temperature baseline driven by latitude + the
//     calendar (each hemisphere's summer/winter is inverted, as in reality)
//   - a wind/wave estimate driven by known seasonal wind systems: the
//     Indian Ocean monsoon, Southern Ocean westerlies, North Atlantic/Pacific
//     winter storm tracks, and the equatorial doldrums
//   - a bounded, seeded "day noise" term so numbers move day to day like a
//     live feed, without ever being wildly random or flip-flopping verdicts
//     on every re-render
//
// This is clearly labelled in the UI as a MODELED / ESTIMATED reading and is
// never presented as a satellite measurement. Where a port already has a real
// nearby station in the Atlantic CSV, the app prefers that real reading
// instead (see utils/portAdvisory.js) and only falls back to this model.
// ---------------------------------------------------------------------------

// Small, dependency-free seeded PRNG (mulberry32) so "today's" reading is
// stable across re-renders but still changes from day to day.
function mulberry32(seed) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(lat, lon, dayOfYear) {
  const a = Math.round(lat * 100);
  const b = Math.round(lon * 100);
  let h = 2166136261;
  for (const n of [a, b, dayOfYear]) {
    h ^= n;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

// Rough climatological SST (°C) for a given latitude + day-of-year, tuned so
// the equator sits ~28°C, mid-latitudes ~18-22°C, and polar water ~2-6°C,
// with each hemisphere's seasonal cycle running six months out of phase.
function baselineSST(lat, doy) {
  const latAbs = Math.abs(lat);
  const equatorial = 28.5 - (latAbs / 90) * 26; // ~28.5 at equator -> ~2.5 at poles
  const hemisphereSign = lat >= 0 ? 1 : -1;
  const seasonalPhase = ((doy - 15) / 365) * 2 * Math.PI; // peak ~ mid-Feb for N hemisphere winter low
  const seasonalAmplitude = 1.5 + (latAbs / 90) * 7; // bigger swing away from the equator
  const seasonal = -Math.cos(seasonalPhase) * seasonalAmplitude * hemisphereSign;
  return equatorial + seasonal;
}

// Identify a named "wind regime" so the advisory text reads like a real
// forecast discussion instead of a black-box number.
function windRegime(lat, lon, doy) {
  const month = new Date(2024, 0, 1 + doy).getMonth(); // 0=Jan
  const latAbs = Math.abs(lat);

  // Indian Ocean / Arabian Sea / Bay of Bengal monsoon system
  const inIndianOcean = lon >= 40 && lon <= 100 && lat >= -15 && lat <= 25;
  if (inIndianOcean) {
    const isSWMonsoon = month >= 5 && month <= 8; // Jun-Sep
    const isPostMonsoonCyclone = month >= 9 && month <= 11; // Oct-Dec, Bay of Bengal cyclone season
    if (isSWMonsoon) {
      return { name: "Southwest Monsoon", windBase: 34, waveBase: 2.6, volatility: 1.15 };
    }
    if (isPostMonsoonCyclone && lon >= 77) {
      return { name: "Post-Monsoon Cyclone Season (Bay of Bengal)", windBase: 30, waveBase: 2.2, volatility: 1.3 };
    }
    return { name: "Northeast Monsoon / Fair Season", windBase: 16, waveBase: 1.1, volatility: 0.75 };
  }

  // Southern Ocean roaring forties / furious fifties
  if (lat <= -40) {
    return { name: "Southern Ocean Westerlies", windBase: 42, waveBase: 3.6, volatility: 1.3 };
  }

  // North Atlantic / North Pacific winter storm tracks
  if (lat >= 40 && (month <= 1 || month >= 10)) {
    return { name: "Winter Storm Track", windBase: 38, waveBase: 3.2, volatility: 1.25 };
  }
  if (lat >= 40) {
    return { name: "Temperate Fair Season", windBase: 20, waveBase: 1.5, volatility: 0.9 };
  }

  // Equatorial doldrums — generally calmer, but tropical-cyclone belts
  // (roughly 8-20° either side, away from the true equator) get a bump
  // during their local cyclone season.
  const inCycloneBelt = latAbs >= 8 && latAbs <= 20;
  const isCycloneSeason =
    (lat >= 0 && (month >= 5 && month <= 10)) || (lat < 0 && (month <= 3 || month >= 11));
  if (inCycloneBelt && isCycloneSeason) {
    return { name: "Tropical Cyclone Season", windBase: 27, waveBase: 2.0, volatility: 1.2 };
  }

  return { name: "Trade Wind / Fair Season", windBase: 18, waveBase: 1.3, volatility: 0.8 };
}

/**
 * estimatePortConditions(lat, lon, date = new Date())
 * -> {
 *   sst, sstAnomaly, windSpeed, waveHeight, regime, verdict, reason, confidencePct
 * }
 *
 * A deterministic-for-the-day, physically-motivated estimate. Never claims
 * to be a live satellite reading — callers should label it "modeled".
 */
export function estimatePortConditions(lat, lon, date = new Date()) {
  const doy = dayOfYear(date);
  const seed = hashSeed(lat, lon, doy);
  const rand = mulberry32(seed);

  const sstBase = baselineSST(lat, doy);
  const regime = windRegime(lat, lon, doy);

  // Bounded day-to-day noise, not pure randomness — keeps verdicts stable
  // and physically plausible while still feeling "live".
  const noise1 = (rand() - 0.5) * 2; // -1..1
  const noise2 = (rand() - 0.5) * 2;
  const noise3 = (rand() - 0.5) * 2;

  const sstAnomaly = Number((noise1 * 1.1 * regime.volatility).toFixed(2));
  const sst = Number((sstBase + sstAnomaly).toFixed(2));
  const windSpeed = Number(Math.max(4, regime.windBase + noise2 * 10 * regime.volatility).toFixed(1));
  const waveHeight = Number(Math.max(0.3, regime.waveBase + noise3 * 0.9 * regime.volatility).toFixed(2));

  // Pressure drop (24h) and swell period are proxies driven by the same
  // regime: stormier wind systems mean a faster-falling barometer and a
  // shorter, choppier swell period; calm regimes mean a steady barometer
  // and a longer, gentler swell period.
  const noise4 = (rand() - 0.5) * 2;
  const pressureDrop = Number(Math.max(0, regime.volatility * 6 + noise4 * 3).toFixed(1));
  const swellPeriod = Number(Math.max(5, 14 - regime.waveBase * 1.7 + noise1 * 1.2).toFixed(1));

  const { verdict, reason } = classify({ windSpeed, waveHeight, sstAnomaly, regime });

  return {
    sst,
    sstAnomaly,
    windSpeed,
    waveHeight,
    pressureDrop,
    swellPeriod,
    regime: regime.name,
    verdict,
    reason,
    source: "modeled",
  };
}

function classify({ windSpeed, waveHeight, sstAnomaly, regime }) {
  if (waveHeight >= 3.2 || windSpeed >= 45) {
    return {
      verdict: "Not Recommended",
      reason: `${regime.name}: modeled swell around ${waveHeight.toFixed(1)} m and wind near ${Math.round(
        windSpeed
      )} km/h — unsafe for small open boats.`,
    };
  }
  if (waveHeight >= 2.0 || windSpeed >= 28 || Math.abs(sstAnomaly) >= 1.8) {
    return {
      verdict: "Caution",
      reason: `${regime.name}: modeled conditions are marginal (swell ~${waveHeight.toFixed(
        1
      )} m, wind ~${Math.round(windSpeed)} km/h). Experienced crews only, stay close to shore.`,
    };
  }
  return {
    verdict: "Favorable",
    reason: `${regime.name}: modeled swell ~${waveHeight.toFixed(1)} m and wind ~${Math.round(
      windSpeed
    )} km/h — within normal small-boat operating range.`,
  };
}
