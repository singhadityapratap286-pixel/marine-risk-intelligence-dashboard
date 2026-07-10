import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Compass size={48} className="text-[#c9a962] mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold">Lost at sea — page not found</h1>
      <p className="mt-3 text-slate-400 max-w-sm">
        The page you're looking for drifted off course. Let's get you back to safe waters.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 bg-[#c9a962] text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-[#dcc07f] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
