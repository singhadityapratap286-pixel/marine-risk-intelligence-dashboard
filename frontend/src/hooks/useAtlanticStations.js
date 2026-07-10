import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

// Shared loader for the one real observation feed in the project
// (public/data/atlantic_heatwaves.csv). Multiple panels can call this hook
// without re-parsing the file redundantly in the same page-render — Papa's
// `download: true` still does one fetch per mount, but the parse cost is the
// only overhead since the file is small (~3k rows).
export function useAtlanticStations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Papa.parse("/atlantic_heatwaves.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (cancelled) return;
        setRows(
          (results.data || []).filter(
            (r) => r.Date && typeof r.lat === "number" && typeof r.Corrected_Lon === "number"
          )
        );
        setLoading(false);
      },
      error: () => !cancelled && setLoading(false),
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const latestStations = useMemo(() => {
    if (!rows.length) return [];
    const latestDate = rows.reduce((max, r) => (r.Date > max ? r.Date : max), rows[0].Date);
    return rows.filter((r) => r.Date === latestDate).map((r) => ({ ...r, lat: r.lat, lon: r.Corrected_Lon }));
  }, [rows]);

  const latestDate = latestStations[0]?.Date || null;

  return { rows, latestStations, latestDate, loading };
}
