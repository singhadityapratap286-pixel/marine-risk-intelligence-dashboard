// ---------------------------------------------------------------------------
// Country -> currency lookup, used so the trip profit calculator shows every
// port's numbers in that country's own currency instead of always in USD.
//
// usdRate = approximate units of local currency per 1 US dollar. These are
// illustrative reference rates for pre-filling sensible default fuel/market
// prices — NOT a live FX feed (this build has no network access to one).
// Every number in the calculator stays fully editable, so a real local price
// always overrides the default.
// ---------------------------------------------------------------------------

const CURRENCIES = {
  India: { code: "INR", symbol: "₹", usdRate: 86 },

  // Africa
  Mauritania: { code: "MRU", symbol: "UM", usdRate: 40 },
  Senegal: { code: "XOF", symbol: "CFA", usdRate: 610 },
  Gambia: { code: "GMD", symbol: "D", usdRate: 72 },
  "Guinea-Bissau": { code: "XOF", symbol: "CFA", usdRate: 610 },
  Guinea: { code: "GNF", symbol: "FG", usdRate: 8600 },
  "Sierra Leone": { code: "SLE", symbol: "Le", usdRate: 23 },
  Liberia: { code: "LRD", symbol: "L$", usdRate: 190 },
  "Côte d'Ivoire": { code: "XOF", symbol: "CFA", usdRate: 610 },
  Ghana: { code: "GHS", symbol: "₵", usdRate: 15 },
  Togo: { code: "XOF", symbol: "CFA", usdRate: 610 },
  Benin: { code: "XOF", symbol: "CFA", usdRate: 610 },
  Nigeria: { code: "NGN", symbol: "₦", usdRate: 1550 },
  Cameroon: { code: "XAF", symbol: "FCFA", usdRate: 610 },
  Gabon: { code: "XAF", symbol: "FCFA", usdRate: 610 },
  Congo: { code: "XAF", symbol: "FCFA", usdRate: 610 },
  Angola: { code: "AOA", symbol: "Kz", usdRate: 920 },
  Namibia: { code: "NAD", symbol: "N$", usdRate: 18 },
  "South Africa": { code: "ZAR", symbol: "R", usdRate: 18 },
  Egypt: { code: "EGP", symbol: "E£", usdRate: 49 },
  Morocco: { code: "MAD", symbol: "DH", usdRate: 9.4 },
  Kenya: { code: "KES", symbol: "KSh", usdRate: 129 },
  Tanzania: { code: "TZS", symbol: "TSh", usdRate: 2600 },
  Mozambique: { code: "MZN", symbol: "MT", usdRate: 64 },
  Mauritius: { code: "MUR", symbol: "₨", usdRate: 46 },

  // South America
  Guyana: { code: "GYD", symbol: "G$", usdRate: 210 },
  Suriname: { code: "SRD", symbol: "Sr$", usdRate: 32 },
  "French Guiana": { code: "EUR", symbol: "€", usdRate: 0.92 },
  Brazil: { code: "BRL", symbol: "R$", usdRate: 5.6 },
  Uruguay: { code: "UYU", symbol: "$U", usdRate: 41 },
  Chile: { code: "CLP", symbol: "CLP$", usdRate: 950 },
  Peru: { code: "PEN", symbol: "S/", usdRate: 3.7 },
  Argentina: { code: "ARS", symbol: "AR$", usdRate: 1200 },
  Ecuador: { code: "USD", symbol: "$", usdRate: 1 },

  // Asia
  Pakistan: { code: "PKR", symbol: "₨", usdRate: 280 },
  Bangladesh: { code: "BDT", symbol: "৳", usdRate: 122 },
  "Sri Lanka": { code: "LKR", symbol: "Rs", usdRate: 300 },
  Myanmar: { code: "MMK", symbol: "K", usdRate: 2100 },
  Thailand: { code: "THB", symbol: "฿", usdRate: 34 },
  Vietnam: { code: "VND", symbol: "₫", usdRate: 25400 },
  Philippines: { code: "PHP", symbol: "₱", usdRate: 58 },
  Indonesia: { code: "IDR", symbol: "Rp", usdRate: 16200 },
  "South Korea": { code: "KRW", symbol: "₩", usdRate: 1400 },
  Japan: { code: "JPY", symbol: "¥", usdRate: 152 },
  China: { code: "CNY", symbol: "¥", usdRate: 7.2 },
  Malaysia: { code: "MYR", symbol: "RM", usdRate: 4.5 },
  Oman: { code: "OMR", symbol: "﷼", usdRate: 0.38 },
  UAE: { code: "AED", symbol: "د.إ", usdRate: 3.67 },
  Qatar: { code: "QAR", symbol: "﷼", usdRate: 3.64 },

  // Europe
  Spain: { code: "EUR", symbol: "€", usdRate: 0.92 },
  Portugal: { code: "EUR", symbol: "€", usdRate: 0.92 },
  France: { code: "EUR", symbol: "€", usdRate: 0.92 },
  "United Kingdom": { code: "GBP", symbol: "£", usdRate: 0.78 },
  Norway: { code: "NOK", symbol: "kr", usdRate: 10.7 },
  Iceland: { code: "ISK", symbol: "kr", usdRate: 138 },
  Italy: { code: "EUR", symbol: "€", usdRate: 0.92 },
  Greece: { code: "EUR", symbol: "€", usdRate: 0.92 },
  Poland: { code: "PLN", symbol: "zł", usdRate: 4.0 },

  // North America
  "United States": { code: "USD", symbol: "$", usdRate: 1 },
  Canada: { code: "CAD", symbol: "C$", usdRate: 1.38 },
  Mexico: { code: "MXN", symbol: "MX$", usdRate: 18 },

  // Oceania
  Australia: { code: "AUD", symbol: "A$", usdRate: 1.53 },
  "New Zealand": { code: "NZD", symbol: "NZ$", usdRate: 1.66 },
  "Papua New Guinea": { code: "PGK", symbol: "K", usdRate: 4.0 },
  Fiji: { code: "FJD", symbol: "FJ$", usdRate: 2.27 },
};

const DEFAULT_CURRENCY = { code: "USD", symbol: "$", usdRate: 1 };

/**
 * currencyFor(countryOrPort) -> { code, symbol, usdRate }
 * Accepts either a country name string, or a port object (uses port.state
 * to infer "India", else port.country).
 */
export function currencyFor(countryOrPort) {
  if (typeof countryOrPort === "object" && countryOrPort !== null) {
    const country = countryOrPort.state ? "India" : countryOrPort.country;
    return CURRENCIES[country] || DEFAULT_CURRENCY;
  }
  return CURRENCIES[countryOrPort] || DEFAULT_CURRENCY;
}

/** Convert a USD amount into the given currency's units. */
export function fromUSD(amountUsd, currency) {
  return amountUsd * currency.usdRate;
}

export { CURRENCIES, DEFAULT_CURRENCY };
