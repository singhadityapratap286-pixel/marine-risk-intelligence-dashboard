// Global fishing-port catalogue spanning every continent, so a fisherman
// anywhere in the world can check feasibility for the port nearest them.
// The existing Atlantic coastline list (West Africa + South America) is
// merged in here with a "continent" tag; every other continent is added
// below. India is intentionally excluded from this file — see
// data/indianPorts.js for the full, dedicated Indian dataset shown in its
// own tab.
import { ATLANTIC_PORTS } from "./ports";

const ATLANTIC_AS_GLOBAL = ATLANTIC_PORTS.map((p) => ({
  ...p,
  continent: p.coast === "West Africa" ? "Africa" : "South America",
}));

const REST_OF_WORLD = [
  // ---------------- Asia (excluding India — see indianPorts.js) ----------------
  { name: "Karachi", country: "Pakistan", continent: "Asia", lat: 24.8608, lon: 66.9931 },
  { name: "Chattogram", country: "Bangladesh", continent: "Asia", lat: 22.3569, lon: 91.7832 },
  { name: "Cox's Bazar", country: "Bangladesh", continent: "Asia", lat: 21.4272, lon: 92.0058 },
  { name: "Colombo", country: "Sri Lanka", continent: "Asia", lat: 6.9271, lon: 79.8612 },
  { name: "Galle", country: "Sri Lanka", continent: "Asia", lat: 6.0535, lon: 80.221 },
  { name: "Yangon", country: "Myanmar", continent: "Asia", lat: 16.8409, lon: 96.1735 },
  { name: "Samut Sakhon", country: "Thailand", continent: "Asia", lat: 13.5475, lon: 100.2743 },
  { name: "Phuket", country: "Thailand", continent: "Asia", lat: 7.8804, lon: 98.3923 },
  { name: "Vung Tau", country: "Vietnam", continent: "Asia", lat: 10.346, lon: 107.0843 },
  { name: "Da Nang", country: "Vietnam", continent: "Asia", lat: 16.0544, lon: 108.2022 },
  { name: "Manila (Navotas)", country: "Philippines", continent: "Asia", lat: 14.6598, lon: 120.9467 },
  { name: "Cebu", country: "Philippines", continent: "Asia", lat: 10.3157, lon: 123.8854 },
  { name: "Jakarta (Muara Baru)", country: "Indonesia", continent: "Asia", lat: -6.1041, lon: 106.7961 },
  { name: "Bitung", country: "Indonesia", continent: "Asia", lat: 1.4451, lon: 125.1815 },
  { name: "Busan", country: "South Korea", continent: "Asia", lat: 35.1796, lon: 129.0756 },
  { name: "Shimonoseki", country: "Japan", continent: "Asia", lat: 33.95, lon: 130.9333 },
  { name: "Qingdao", country: "China", continent: "Asia", lat: 36.0671, lon: 120.3826 },
  { name: "Zhoushan", country: "China", continent: "Asia", lat: 29.9853, lon: 122.2072 },
  { name: "Kota Kinabalu", country: "Malaysia", continent: "Asia", lat: 5.9804, lon: 116.0735 },
  { name: "Muscat", country: "Oman", continent: "Asia", lat: 23.5859, lon: 58.4059 },
  { name: "Deira, Dubai", country: "UAE", continent: "Asia", lat: 25.2697, lon: 55.2963 },
  { name: "Doha", country: "Qatar", continent: "Asia", lat: 25.2854, lon: 51.531 },

  // ---------------- Africa (East & North — West already covered by Atlantic list) ----------------
  { name: "Alexandria", country: "Egypt", continent: "Africa", lat: 31.2001, lon: 29.9187 },
  { name: "Casablanca", country: "Morocco", continent: "Africa", lat: 33.5731, lon: -7.5898 },
  { name: "Mombasa", country: "Kenya", continent: "Africa", lat: -4.0435, lon: 39.6682 },
  { name: "Dar es Salaam", country: "Tanzania", continent: "Africa", lat: -6.7924, lon: 39.2083 },
  { name: "Maputo", country: "Mozambique", continent: "Africa", lat: -25.9692, lon: 32.5732 },
  { name: "Port Louis", country: "Mauritius", continent: "Africa", lat: -20.1609, lon: 57.5012 },

  // ---------------- Europe ----------------
  { name: "Vigo", country: "Spain", continent: "Europe", lat: 42.2406, lon: -8.7207 },
  { name: "Peniche", country: "Portugal", continent: "Europe", lat: 39.3558, lon: -9.3811 },
  { name: "Lorient", country: "France", continent: "Europe", lat: 47.7482, lon: -3.3702 },
  { name: "Peterhead", country: "United Kingdom", continent: "Europe", lat: 57.505, lon: -1.7936 },
  { name: "Bergen", country: "Norway", continent: "Europe", lat: 60.3913, lon: 5.3221 },
  { name: "Tromsø", country: "Norway", continent: "Europe", lat: 69.6492, lon: 18.9553 },
  { name: "Reykjavik", country: "Iceland", continent: "Europe", lat: 64.1466, lon: -21.9426 },
  { name: "Palermo", country: "Italy", continent: "Europe", lat: 38.1157, lon: 13.3615 },
  { name: "Piraeus", country: "Greece", continent: "Europe", lat: 37.9475, lon: 23.6367 },
  { name: "Gdansk", country: "Poland", continent: "Europe", lat: 54.352, lon: 18.6466 },

  // ---------------- North America ----------------
  { name: "Kodiak, Alaska", country: "United States", continent: "North America", lat: 57.79, lon: -152.4072 },
  { name: "Dutch Harbor, Alaska", country: "United States", continent: "North America", lat: 53.8888, lon: -166.5406 },
  { name: "Gloucester, Massachusetts", country: "United States", continent: "North America", lat: 42.6159, lon: -70.662 },
  { name: "New Bedford, Massachusetts", country: "United States", continent: "North America", lat: 41.6362, lon: -70.9342 },
  { name: "Galveston, Texas", country: "United States", continent: "North America", lat: 29.3013, lon: -94.7977 },
  { name: "St. John's, Newfoundland", country: "Canada", continent: "North America", lat: 47.5615, lon: -52.7126 },
  { name: "Prince Rupert, BC", country: "Canada", continent: "North America", lat: 54.315, lon: -130.3208 },
  { name: "Ensenada", country: "Mexico", continent: "North America", lat: 31.8667, lon: -116.6167 },

  // ---------------- South America (Pacific side — Atlantic side already covered) ----------------
  { name: "Valparaíso", country: "Chile", continent: "South America", lat: -33.0472, lon: -71.6127 },
  { name: "Iquique", country: "Chile", continent: "South America", lat: -20.2208, lon: -70.1431 },
  { name: "Callao", country: "Peru", continent: "South America", lat: -12.0553, lon: -77.1181 },
  { name: "Mar del Plata", country: "Argentina", continent: "South America", lat: -38.0055, lon: -57.5426 },
  { name: "Guayaquil", country: "Ecuador", continent: "South America", lat: -2.1894, lon: -79.8891 },

  // ---------------- Oceania ----------------
  { name: "Fremantle", country: "Australia", continent: "Oceania", lat: -32.0569, lon: 115.7439 },
  { name: "Darwin", country: "Australia", continent: "Oceania", lat: -12.4634, lon: 130.8456 },
  { name: "Cairns", country: "Australia", continent: "Oceania", lat: -16.9186, lon: 145.7781 },
  { name: "Nelson", country: "New Zealand", continent: "Oceania", lat: -41.2706, lon: 173.284 },
  { name: "Auckland", country: "New Zealand", continent: "Oceania", lat: -36.8485, lon: 174.7633 },
  { name: "Port Moresby", country: "Papua New Guinea", continent: "Oceania", lat: -9.4438, lon: 147.1803 },
  { name: "Suva", country: "Fiji", continent: "Oceania", lat: -18.1416, lon: 178.4419 },
];

export const GLOBAL_PORTS = [...ATLANTIC_AS_GLOBAL, ...REST_OF_WORLD];

export const CONTINENTS = [...new Set(GLOBAL_PORTS.map((p) => p.continent))].sort();
