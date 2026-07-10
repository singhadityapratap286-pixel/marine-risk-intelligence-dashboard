// Comprehensive list of Indian fishing harbors / landing centres, covering
// every coastal state and island union territory — Gujarat around to West
// Bengal, plus the Andaman & Nicobar and Lakshadweep islands. Coordinates are
// the harbor/town centre for each location. Used to give every Indian coastal
// fisherman a feasibility check for the port nearest them.

export const INDIAN_PORTS = [
  // ---- Gujarat (Arabian Sea) ----
  { name: "Okha", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 22.4707, lon: 69.0708 },
  { name: "Dwarka", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 22.2442, lon: 68.9685 },
  { name: "Porbandar", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 21.6417, lon: 69.6293 },
  { name: "Veraval", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 20.9159, lon: 70.3629 },
  { name: "Mangrol", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 21.1167, lon: 70.1167 },
  { name: "Jakhau", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 23.2167, lon: 68.7167 },
  { name: "Kandla", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 23.0333, lon: 70.2167 },
  { name: "Bhavnagar", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 21.7645, lon: 72.1519 },
  { name: "Diu", state: "Gujarat", sea: "Arabian Sea", monsoonCoast: "West", lat: 20.7144, lon: 70.9874 },

  // ---- Maharashtra (Arabian Sea) ----
  { name: "Sassoon Dock, Mumbai", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 18.9202, lon: 72.8262 },
  { name: "Versova", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 19.133, lon: 72.811 },
  { name: "Uran", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 18.8752, lon: 72.9427 },
  { name: "Murud-Janjira", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 18.3333, lon: 72.9667 },
  { name: "Ratnagiri", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 16.9944, lon: 73.3 },
  { name: "Malvan", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 16.0667, lon: 73.4667 },
  { name: "Dahanu", state: "Maharashtra", sea: "Arabian Sea", monsoonCoast: "West", lat: 19.9667, lon: 72.7333 },

  // ---- Goa (Arabian Sea) ----
  { name: "Mormugao (Vasco)", state: "Goa", sea: "Arabian Sea", monsoonCoast: "West", lat: 15.4009, lon: 73.8078 },
  { name: "Malim", state: "Goa", sea: "Arabian Sea", monsoonCoast: "West", lat: 15.51, lon: 73.82 },

  // ---- Karnataka (Arabian Sea) ----
  { name: "Karwar", state: "Karnataka", sea: "Arabian Sea", monsoonCoast: "West", lat: 14.8137, lon: 74.1291 },
  { name: "Bhatkal", state: "Karnataka", sea: "Arabian Sea", monsoonCoast: "West", lat: 13.985, lon: 74.559 },
  { name: "Honnavar", state: "Karnataka", sea: "Arabian Sea", monsoonCoast: "West", lat: 14.28, lon: 74.45 },
  { name: "Mangalore", state: "Karnataka", sea: "Arabian Sea", monsoonCoast: "West", lat: 12.8697, lon: 74.842 },
  { name: "Malpe", state: "Karnataka", sea: "Arabian Sea", monsoonCoast: "West", lat: 13.35, lon: 74.7167 },

  // ---- Kerala (Arabian Sea) ----
  { name: "Kasaragod", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 12.5, lon: 74.99 },
  { name: "Beypore, Kozhikode", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 11.1708, lon: 75.8078 },
  { name: "Ponnani", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 10.7667, lon: 75.9 },
  { name: "Kochi (Cochin)", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 9.9312, lon: 76.2673 },
  { name: "Alappuzha", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 9.49, lon: 76.33 },
  { name: "Neendakara, Kollam", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 8.9333, lon: 76.55 },
  { name: "Vizhinjam", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 8.3833, lon: 76.9667 },
  { name: "Thoothoor", state: "Kerala", sea: "Arabian Sea", monsoonCoast: "West", lat: 8.1167, lon: 77.3167 },

  // ---- Tamil Nadu (mixed — southern tip Arabian/Indian Ocean, east = Bay of Bengal) ----
  { name: "Kanyakumari", state: "Tamil Nadu", sea: "Indian Ocean", monsoonCoast: "South", lat: 8.0883, lon: 77.5385 },
  { name: "Colachel", state: "Tamil Nadu", sea: "Indian Ocean", monsoonCoast: "South", lat: 8.1833, lon: 77.25 },
  { name: "Thoothukudi (Tuticorin)", state: "Tamil Nadu", sea: "Bay of Bengal", monsoonCoast: "East", lat: 8.7642, lon: 78.1348 },
  { name: "Rameswaram", state: "Tamil Nadu", sea: "Bay of Bengal", monsoonCoast: "East", lat: 9.2876, lon: 79.3129 },
  { name: "Nagapattinam", state: "Tamil Nadu", sea: "Bay of Bengal", monsoonCoast: "East", lat: 10.7667, lon: 79.8333 },
  { name: "Cuddalore", state: "Tamil Nadu", sea: "Bay of Bengal", monsoonCoast: "East", lat: 11.748, lon: 79.7714 },
  { name: "Kasimedu, Chennai", state: "Tamil Nadu", sea: "Bay of Bengal", monsoonCoast: "East", lat: 13.1167, lon: 80.3 },
  { name: "Pulicat", state: "Tamil Nadu", sea: "Bay of Bengal", monsoonCoast: "East", lat: 13.4167, lon: 80.3167 },

  // ---- Andhra Pradesh (Bay of Bengal) ----
  { name: "Krishnapatnam", state: "Andhra Pradesh", sea: "Bay of Bengal", monsoonCoast: "East", lat: 14.25, lon: 80.1167 },
  { name: "Nizampatnam", state: "Andhra Pradesh", sea: "Bay of Bengal", monsoonCoast: "East", lat: 15.9, lon: 80.6667 },
  { name: "Machilipatnam", state: "Andhra Pradesh", sea: "Bay of Bengal", monsoonCoast: "East", lat: 16.1875, lon: 81.1389 },
  { name: "Kakinada", state: "Andhra Pradesh", sea: "Bay of Bengal", monsoonCoast: "East", lat: 16.9891, lon: 82.2475 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", sea: "Bay of Bengal", monsoonCoast: "East", lat: 17.6868, lon: 83.2185 },
  { name: "Bhimunipatnam", state: "Andhra Pradesh", sea: "Bay of Bengal", monsoonCoast: "East", lat: 17.89, lon: 83.45 },

  // ---- Odisha (Bay of Bengal) ----
  { name: "Gopalpur", state: "Odisha", sea: "Bay of Bengal", monsoonCoast: "East", lat: 19.2667, lon: 84.9 },
  { name: "Paradip", state: "Odisha", sea: "Bay of Bengal", monsoonCoast: "East", lat: 20.3167, lon: 86.6167 },
  { name: "Puri", state: "Odisha", sea: "Bay of Bengal", monsoonCoast: "East", lat: 19.8, lon: 85.8167 },
  { name: "Chandipur, Balasore", state: "Odisha", sea: "Bay of Bengal", monsoonCoast: "East", lat: 21.4667, lon: 87.0333 },
  { name: "Dhamra", state: "Odisha", sea: "Bay of Bengal", monsoonCoast: "East", lat: 20.7833, lon: 86.9833 },

  // ---- West Bengal (Bay of Bengal) ----
  { name: "Digha", state: "West Bengal", sea: "Bay of Bengal", monsoonCoast: "East", lat: 21.627, lon: 87.5089 },
  { name: "Diamond Harbour", state: "West Bengal", sea: "Bay of Bengal", monsoonCoast: "East", lat: 22.1833, lon: 88.1833 },
  { name: "Sagar Island (Gangasagar)", state: "West Bengal", sea: "Bay of Bengal", monsoonCoast: "East", lat: 21.65, lon: 88.0667 },
  { name: "Namkhana", state: "West Bengal", sea: "Bay of Bengal", monsoonCoast: "East", lat: 21.7667, lon: 88.2333 },
  { name: "Kakdwip", state: "West Bengal", sea: "Bay of Bengal", monsoonCoast: "East", lat: 21.8667, lon: 88.1833 },

  // ---- Island Territories ----
  { name: "Port Blair", state: "Andaman & Nicobar Islands", sea: "Andaman Sea", monsoonCoast: "Islands", lat: 11.6234, lon: 92.7265 },
  { name: "Kavaratti", state: "Lakshadweep", sea: "Laccadive Sea", monsoonCoast: "Islands", lat: 10.5669, lon: 72.642 },
  { name: "Minicoy", state: "Lakshadweep", sea: "Laccadive Sea", monsoonCoast: "Islands", lat: 8.2833, lon: 73.05 },
];

export const INDIAN_STATES = [...new Set(INDIAN_PORTS.map((p) => p.state))];
