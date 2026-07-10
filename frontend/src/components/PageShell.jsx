import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "./Footer";

/**
 * Consistent outer shell for every "utility" page (History, Configuration,
 * Reports, Account, etc.) — gives every page the same breathing room, a
 * way back to the dashboard, and the same footer.
 */
function PageShell({ children, backTo = "/dashboard", backLabel = "Back to Dashboard" }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a141b]">
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 pb-4">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-[#c9a962]/80 hover:text-[#e8d9ae] transition-colors mb-6"
        >
          <ArrowLeft size={15} /> {backLabel}
        </Link>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default PageShell;
