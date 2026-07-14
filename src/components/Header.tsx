import React, { useState, useEffect } from "react";
import { 
  Globe, Search, Menu, X, Clock, Type, ShieldAlert, Award, User, 
  Bookmark, ChevronDown, CheckCircle2, Moon, Sun 
} from "lucide-react";
import { Language } from "../types";

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  fontSize: "sm" | "base" | "lg" | "xl";
  onFontSizeChange: (size: "sm" | "base" | "lg" | "xl") => void;
  onSearch: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAdmin: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  onToggleFactCheck: (isFactCheck: boolean) => void;
  isFactCheckOnly: boolean;
}

const CATEGORIES = [
  "Geopolitics",
  "Indian Politics",
  "West Bengal Politics",
  "Current Affairs",
  "Technology",
  "Economy",
  "Defence",
  "Science",
  "AI",
  "Fact Check",
  "Editorial"
];

const LOCALIZED_LABELS = {
  title: {
    bn: "দ্য বেঙ্গলি পিডিয়া"
  },
  tagline: {
    bn: "নির্ভীক • নিরপেক্ষ • তথ্যনিষ্ঠ ভূ-রাজনৈতিক ও জাতীয় সংবাদ পোর্টাল"
  },
  searchPlaceholder: {
    bn: "সংবাদ অনুসন্ধান করুন..."
  },
  bookmarks: {
    bn: "বুকমার্কস"
  },
  admin: {
    bn: "অ্যাডমিন পোর্টাল"
  },
  factCheckLabel: {
    bn: "ফ্যাক্ট চেক"
  },
  allNews: {
    bn: "সব খবর"
  }
};

const LOCALIZED_CATEGORIES: Record<string, Record<Language, string>> = {
  "Geopolitics": { bn: "ভূ-রাজনীতি" },
  "Indian Politics": { bn: "ভারতীয় রাজনীতি" },
  "West Bengal Politics": { bn: "পশ্চিমবঙ্গ রাজনীতি" },
  "Current Affairs": { bn: "সাম্প্রতিকী" },
  "Technology": { bn: "প্রযুক্তি" },
  "Economy": { bn: "অর্থনীতি" },
  "Defence": { bn: "প্রতিরক্ষা" },
  "Science": { bn: "বিজ্ঞান" },
  "AI": { bn: "কৃত্রিম বুদ্ধিমত্তা (AI)" },
  "Fact Check": { bn: "সত্যতা যাচাই" },
  "Editorial": { bn: "সম্পাদকীয়" }
};

/*
  "Geopolitics": { bn: "ভূ-রাজনীতি", en: "Geopolitics", hi: "भू-राजनीति" },
  "Indian Politics": { bn: "ভারতীয় রাজনীতি", en: "Indian Politics", hi: "भारतीय राजनीति" },
  "West Bengal Politics": { bn: "পশ্চিমবঙ্গ রাজনীতি", en: "West Bengal Politics", hi: "पश्चिम बंगाल राजनीति" },
  "Current Affairs": { bn: "সাম্প্রতিকী", en: "Current Affairs", hi: "सामयिकी" },
  "Technology": { bn: "প্রযুক্তি", en: "Technology", hi: "प्रौद्योगिकी" },
  "Economy": { bn: "অর্থনীতি", en: "Economy", hi: "अर्थव्यवस्था" },
  "Defence": { bn: "প্রতিরক্ষা", en: "Defence", hi: "रक्षा" },
  "Science": { bn: "বিজ্ঞান", en: "Science", hi: "विज्ञान" },
  "AI": { bn: "কৃত্রিম বুদ্ধিমত্তা (AI)", en: "AI", hi: "कृत्रिम बुद्धिमत्ता" },
  "Fact Check": { bn: "সত্যতা যাচাই", en: "Fact Check", hi: "तथ्य जाँच" },
  "Editorial": { bn: "সম্পাদকীয়", en: "Editorial", hi: "संपादकीय" }
};

*/
export function Header({
  currentLanguage,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  onSearch,
  selectedCategory,
  onSelectCategory,
  onOpenAdmin,
  onOpenBookmarks,
  bookmarksCount,
  onToggleFactCheck,
  isFactCheckOnly
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [clocks, setClocks] = useState({ ist: "", utc: "" });
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  // Dynamic real-time ticking clock (IST & UTC) for global geopolitical layout
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // IST is UTC+5:30
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      const format = (d: Date, useUTC: boolean) => {
        const h = String(useUTC ? d.getUTCHours() : d.getUTCHours()).padStart(2, "0");
        const m = String(useUTC ? d.getUTCMinutes() : d.getUTCMinutes()).padStart(2, "0");
        const s = String(useUTC ? d.getUTCSeconds() : d.getUTCSeconds()).padStart(2, "0");
        return `${h}:${m}:${s}`;
      };

      setClocks({
        utc: format(now, true) + " UTC",
        ist: format(istTime, false) + " IST"
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const clearSearch = () => {
    setSearchVal("");
    onSearch("");
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 font-sans" id="app-header">
      {/* Top Telemetry & Utility Bar */}
      <div className="bg-slate-50 text-slate-500 text-xs py-2 px-4 sm:px-8 flex flex-wrap justify-between items-center border-b border-slate-200">
        {/* Dynamic Clocks */}
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-red-600" />
            <span>{clocks.ist}</span>
          </span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:flex items-center space-x-1 font-mono text-slate-400">
            <span>{clocks.utc}</span>
          </span>
        </div>

        {/* Accessibility Tools, Language Switching, and Bookmarks */}
        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          {/* Font Resizer */}
          <div className="relative">
            <button 
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition duration-200 py-0.5 px-1.5 rounded hover:bg-slate-100 focus:outline-none"
              title="Text Size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px] font-bold">{fontSize}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFontDropdown && (
              <div className="absolute right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-28 z-50 text-xs text-slate-700">
                {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      onFontSizeChange(sz);
                      setShowFontDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition ${fontSize === sz ? "text-red-600 font-bold" : "text-slate-600"}`}
                  >
                    Size {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>



          <span className="text-slate-300">|</span>

          {/* Bookmark Button */}
          <button 
            onClick={onOpenBookmarks}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 font-medium cursor-pointer transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-red-600 fill-current" />
            <span className="hidden sm:inline">{LOCALIZED_LABELS.bookmarks[currentLanguage]}</span>
            {bookmarksCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ml-0.5">
                {bookmarksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Branding and Logo Area */}
      <div className="py-4 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Branding & Masthead */}
        <div className="text-center md:text-left">
          <button 
            onClick={() => {
              onToggleFactCheck(false);
              onSelectCategory("");
            }}
            className="flex items-center justify-center md:justify-start space-x-3 cursor-pointer group text-left focus:outline-none"
          >
            <div className="w-8 h-8 bg-red-600 group-hover:bg-red-700 transition rounded flex items-center justify-center text-white font-black text-lg shadow-sm">
              B
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-none group-hover:text-red-600 transition">
                {LOCALIZED_LABELS.title[currentLanguage]}
              </h1>
              <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1.5">
                {LOCALIZED_LABELS.tagline[currentLanguage]}
              </p>
            </div>
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center space-x-4 w-full md:w-auto justify-center md:justify-end">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm flex items-center">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={LOCALIZED_LABELS.searchPlaceholder[currentLanguage]}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-8 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            {searchVal && (
              <button 
                type="button" 
                onClick={clearSearch} 
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Admin Launcher */}
          {(typeof window !== "undefined" && (!!localStorage.getItem("adminToken") || window.location.search.includes("admin=true"))) && (
            <button
              id="nav-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center space-x-1 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow transition cursor-pointer flex-shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>{LOCALIZED_LABELS.admin[currentLanguage]}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Category Navigation Bar */}
      <div className="bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center h-14">
          {/* Category Tabs (Horizontal on Desktop) */}
          <nav className="hidden lg:flex space-x-1 items-center h-full overflow-x-auto no-scrollbar">
            {/* "All News" Link */}
            <button
              onClick={() => {
                onToggleFactCheck(false);
                onSelectCategory("");
              }}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition ${
                !selectedCategory && !isFactCheckOnly
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {LOCALIZED_LABELS.allNews[currentLanguage]}
            </button>

            {/* Fact Check Specialized Portal Selector */}
            <button
              onClick={() => {
                onToggleFactCheck(true);
                onSelectCategory("");
              }}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition flex items-center space-x-1.5 ${
                isFactCheckOnly
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100/70"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{LOCALIZED_LABELS.factCheckLabel[currentLanguage]}</span>
            </button>

            <span className="text-slate-200 h-4 w-[1px] bg-slate-200 mx-2" />

            {/* Loop categories */}
            {CATEGORIES.filter(c => c !== "Fact Check").map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onToggleFactCheck(false);
                  onSelectCategory(cat);
                }}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition whitespace-nowrap ${
                  selectedCategory === cat && !isFactCheckOnly
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {LOCALIZED_CATEGORIES[cat]?.[currentLanguage] || cat}
              </button>
            ))}
          </nav>

          {/* Fact Check Toggle for Smaller Screens */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => {
                onToggleFactCheck(!isFactCheckOnly);
                onSelectCategory("");
              }}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition flex items-center space-x-1.5 ${
                isFactCheckOnly ? "bg-indigo-600 text-white" : "text-indigo-600 bg-indigo-50"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{LOCALIZED_LABELS.factCheckLabel[currentLanguage]}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer/Sidebar Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-md animate-[slideDown_0.2s_ease-out]">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onToggleFactCheck(false);
                onSelectCategory("");
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-3 text-left text-xs font-bold rounded-full transition uppercase ${
                !selectedCategory && !isFactCheckOnly ? "bg-red-600 text-white" : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              🏠 {LOCALIZED_LABELS.allNews[currentLanguage]}
            </button>

            <button
              onClick={() => {
                onToggleFactCheck(true);
                onSelectCategory("");
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-3 text-left text-xs font-bold rounded-full transition uppercase flex items-center space-x-1.5 ${
                isFactCheckOnly ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-800"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{LOCALIZED_LABELS.factCheckLabel[currentLanguage]}</span>
            </button>
          </div>

          <div className="border-t border-slate-100 my-2" />

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Categories
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {CATEGORIES.filter(c => c !== "Fact Check").map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onToggleFactCheck(false);
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2 px-3 text-left text-xs font-bold rounded-full transition whitespace-nowrap overflow-hidden text-ellipsis ${
                  selectedCategory === cat && !isFactCheckOnly
                    ? "bg-red-600 text-white"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {LOCALIZED_CATEGORIES[cat]?.[currentLanguage] || cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}
