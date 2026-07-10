import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function LanguageSwitcher() {
  const { lang, setLang, languages, DICTIONARY } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
        aria-label="Change language"
        title="Change language"
      >
        <Globe size={18} />
        <span className="hidden sm:inline">{DICTIONARY[lang].nativeName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-[#12222b] border border-[#c9a962]/25 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#c9a962]/80 border-b border-[#c9a962]/15">
              22 Indian Languages + English
            </div>
            <div className="max-h-72 overflow-y-auto">
              {languages.map((code) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setOpen(false); }}
                  className={
                    "w-full flex items-center justify-between text-left px-4 py-2.5 text-sm transition-colors " +
                    (code === lang ? "bg-[#c9a962]/10 text-[#e8d9ae]" : "text-slate-200 hover:bg-white/5")
                  }
                >
                  <span>
                    {DICTIONARY[code].nativeName}
                    <span className="text-slate-500 text-xs ml-1.5">({DICTIONARY[code].langName})</span>
                  </span>
                  {code === lang && <Check size={14} className="text-[#c9a962]" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
