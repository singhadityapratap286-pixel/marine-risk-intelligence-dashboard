import { Link } from "react-router-dom";
import {
  Waves,
  Radar,
  Satellite,
  ShieldAlert,
  Ship,
  Fish,
  ArrowRight,
} from "lucide-react";
import heroImg from "../assets/hero.png";
import MetricCard from "../components/MetricCard";
import { useLanguage } from "../context/LanguageContext";

const stats = [
  { label: "Coastal cities monitored", value: 24, suffix: "+" },
  { label: "Live data points / day", value: 1.2, suffix: "M", decimals: 1 },
  { label: "AI prediction confidence", value: 96, suffix: "%" },
  { label: "Avg. alert lead time", value: 18, suffix: " min" },
];

const features = [
  { icon: <Radar size={22} />, title: "AI Risk Prediction", desc: "Cyclone, flood and surge probability from a transparent, weighted scoring model — every score comes with its own explanation." },
  { icon: <Fish size={22} />, title: "Fishermen Zone", desc: "A live go/no-go fishing advisory, safe-harbor finder, and trip-cost calculator built specifically for small-boat crews." },
  { icon: <Waves size={22} />, title: "Water Quality Tracking", desc: "pH, turbidity, TDS and temperature monitored across every coastal station." },
  { icon: <Ship size={22} />, title: "Ship Tracking", desc: "Real-time vessel positions layered over risk zones for safer routing." },
  { icon: <Satellite size={22} />, title: "Satellite + GIS Map", desc: "Bathymetry imagery and an interactive globe for a full ocean-wide view." },
  { icon: <ShieldAlert size={22} />, title: "Instant Alerts", desc: "Live-updating warnings the moment a monitored zone crosses a risk threshold." },
];

function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0a141b] text-white">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-[#c9a962]/15">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a141b]/40 via-[#0a141b]/85 to-[#0a141b]" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#e8d9ae] bg-[#c9a962]/10 border border-[#c9a962]/30 rounded-full px-4 py-1.5 animate-fade-in">
            ⚓ {t("forFishermen")}
          </span>

          <h1 className="font-display mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            {t("heroTitle").split(" ").slice(0, 3).join(" ")}
            <br className="hidden sm:block" />
            <span className="text-[#c9a962]">
              {" "}{t("heroTitle").split(" ").slice(3).join(" ")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-slate-300 text-base sm:text-lg">
            One system for two audiences: port authorities tracking coast-wide risk,
            and fishermen deciding whether it's safe to take the boat out today —
            fused from satellite imagery, live weather, water quality, and ship tracking.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 bg-[#c9a962] text-[#0a141b] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#dcc07f] transition-colors"
            >
              Enter Dashboard
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/fishermen"
              className="group inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-medium px-7 py-3.5 rounded-xl hover:bg-emerald-400/20 transition-colors"
            >
              <Fish size={18} /> {t("fishermenZone")}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="border-b border-[#c9a962]/15 bg-[#0a141b]/60">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-display text-3xl font-bold text-[#c9a962]">
                <MetricCard value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div className="mt-1 text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Feature grid ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">One dashboard, every ocean signal</h2>
          <p className="mt-3 text-slate-400">
            Everything that used to live in five different tools — now in a single console
            built for fast decisions, whether you're patrolling a coastline or heading out at dawn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#12222b] border border-[#c9a962]/15 rounded-2xl p-6 hover:border-[#c9a962]/40 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-[#c9a962]/10 text-[#c9a962] flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-display mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Fishermen callout ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <Link
          to="/fishermen"
          className="block bg-gradient-to-br from-[#c9a962]/10 to-emerald-500/10 border border-[#c9a962]/25 rounded-2xl p-8 sm:p-10 hover:border-[#c9a962]/45 transition-colors"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">For fishing crews</span>
              <h3 className="font-display mt-2 text-xl sm:text-2xl font-bold">{t("safeToFish")}</h3>
              <p className="mt-2 text-sm text-slate-300 max-w-lg">
                Check the live go / caution / do-not-go advisory, nearest safe harbor,
                and today's catch potential — available in English and 22 Indian languages.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 bg-[#c9a962] text-[#0a141b] font-semibold px-6 py-3 rounded-xl shrink-0">
              Open Fishermen Zone <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-[#c9a962]/15">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span className="font-display">⚓ AI Marine Risk Intelligence Dashboard</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
