// ---------------------------------------------------------------------------
// Risk Engine — replaces hardcoded "High / 96%" style labels with an actual
// computed, explainable score.
//
// This is a transparent weighted model (not a black box): every score comes
// with a breakdown of which factors pushed it up or down, and a confidence
// value based on how much of the expected input set was available. It is
// deliberately simple and well-documented so it's easy to swap any factor
// function for a real trained model later without touching call sites.
// ---------------------------------------------------------------------------

// Each factor maps a raw reading to a 0-100 danger contribution and a weight.
// Weights sum to 1 across the whole set that's actually supplied.
const FACTORS = {
  waveHeight: {
    label: "Wave height",
    unit: "m",
    weight: 0.28,
    score: (v) => clamp(((v - 0.5) / (4.5 - 0.5)) * 100, 0, 100), // 0.5m safe -> 4.5m severe
  },
  windSpeed: {
    label: "Wind speed",
    unit: "km/h",
    weight: 0.24,
    score: (v) => clamp(((v - 10) / (70 - 10)) * 100, 0, 100), // 10 calm -> 70 severe
  },
  pressureDrop: {
    label: "Pressure drop (24h)",
    unit: "hPa",
    weight: 0.22,
    score: (v) => clamp((v / 20) * 100, 0, 100), // a fast-falling pressure = storm signal
  },
  waterTemp: {
    label: "Sea surface temp anomaly",
    unit: "°C above avg",
    weight: 0.14,
    score: (v) => clamp((v / 3) * 100, 0, 100), // warmer anomaly -> more cyclone fuel
  },
  swellPeriod: {
    label: "Swell period",
    unit: "s",
    weight: 0.12,
    score: (v) => clamp(((16 - v) / (16 - 6)) * 100, 0, 100), // short, choppy period = rougher
  },
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * computeRisk(inputs) -> {
 *   score: 0-100 composite risk,
 *   label: "Low" | "Moderate" | "High" | "Severe",
 *   confidence: 0-100 (based on how many factors were supplied),
 *   breakdown: [{ key, label, value, unit, contribution, weight }],
 * }
 */
export function computeRisk(inputs) {
  const supplied = Object.keys(inputs).filter((k) => FACTORS[k] && inputs[k] != null);

  if (supplied.length === 0) {
    return { score: 0, label: "Unknown", confidence: 0, breakdown: [] };
  }

  const totalWeight = supplied.reduce((sum, k) => sum + FACTORS[k].weight, 0);

  const breakdown = supplied.map((k) => {
    const factor = FACTORS[k];
    const contribution = factor.score(inputs[k]);
    return {
      key: k,
      label: factor.label,
      unit: factor.unit,
      value: inputs[k],
      contribution: Math.round(contribution),
      weight: factor.weight / totalWeight, // renormalized so it always sums to 1
    };
  });

  const score = breakdown.reduce((sum, f) => sum + f.contribution * f.weight, 0);

  // Confidence reflects data completeness — this is what makes the model
  // honest: fewer live inputs = lower stated confidence, not a fake 96%.
  const maxFactors = Object.keys(FACTORS).length;
  const confidence = Math.round((supplied.length / maxFactors) * 100);

  return {
    score: Math.round(score),
    label: scoreToLabel(score),
    confidence,
    breakdown: breakdown.sort((a, b) => b.contribution * b.weight - a.contribution * a.weight),
  };
}

function scoreToLabel(score) {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 75) return "High";
  return "Severe";
}

export function labelColor(label) {
  switch (label) {
    case "Low": return "text-green-400";
    case "Moderate": return "text-yellow-400";
    case "High": return "text-orange-400";
    case "Severe": return "text-red-500";
    default: return "text-gray-400";
  }
}

export function labelBg(label) {
  switch (label) {
    case "Low": return "bg-green-500";
    case "Moderate": return "bg-yellow-500";
    case "High": return "bg-orange-500";
    case "Severe": return "bg-red-600";
    default: return "bg-gray-500";
  }
}

/**
 * Fishing-specific advisory — reuses the same risk score but applies a
 * fisherman-relevant decision threshold, since a small boat has a much
 * lower safe-wave-height ceiling than a coast guard vessel.
 */
export function getFishingAdvisory(inputs) {
  const risk = computeRisk(inputs);

  let verdict = "Go";
  let verdictColor = "text-green-400";
  let advice = "Conditions are within safe range for small-boat fishing.";

  if (risk.score >= 70) {
    verdict = "Do Not Go";
    verdictColor = "text-red-500";
    advice = "Dangerous swell/wind combination for small boats. Stay ashore today.";
  } else if (risk.score >= 40) {
    verdict = "Caution";
    verdictColor = "text-yellow-400";
    advice = "Marginal conditions — experienced crews only, stay close to shore, avoid early morning departure.";
  }

  return { ...risk, verdict, verdictColor, advice };
}

export { FACTORS };
