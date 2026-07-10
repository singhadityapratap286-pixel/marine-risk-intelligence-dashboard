function Footer() {
  return (
    <footer className="border-t border-[#c9a962]/15 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <span className="font-display">⚓ AI Marine Risk Intelligence Dashboard</span>
        <span>© {new Date().getFullYear()} All rights reserved</span>
      </div>
    </footer>
  );
}

export default Footer;
