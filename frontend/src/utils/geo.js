// Great-circle distance between two lat/lon points, in kilometers.
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Find the nearest item (must have {lat, lon}) to a given point.
export function nearest(lat, lon, items, latKey = "lat", lonKey = "lon") {
  let best = null;
  let bestDist = Infinity;
  for (const item of items) {
    const d = haversineKm(lat, lon, item[latKey], item[lonKey]);
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  }
  return { item: best, distanceKm: bestDist };
}
