import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
    bn: "দ্য বেঙ্গলি পিডিয়া",
    en: "The Bengali Pedia",
    hi: "द बंगाली पीडिया"
  },
  tagline: {
    bn: "নির্ভীক • নিরপেক্ষ • তথ্যনিষ্ঠ ভূ-রাজনৈতিক ও জাতীয় সংবাদ পোর্টাল",
    en: "Fearless • Independent • Fact-based Geopolitical & National News",
    hi: "निडर • स्वतंत्र • तथ्य-आधारित भू-राजनीतिक और राष्ट्रीय समाचार"
  },
  searchPlaceholder: {
    bn: "সংবাদ অনুসন্ধান করুন...",
    en: "Search news...",
    hi: "समाचार खोजें..."
  },
  bookmarks: {
    bn: "বুকমার্কস",
    en: "Bookmarks",
    hi: "बुकमार्क"
  },
  admin: {
    bn: "অ্যাডমিন পোর্টাল",
    en: "Admin Portal",
    hi: "एडमिन पोर्टल"
  },
  factCheckLabel: {
    bn: "ফ্যাক্ট চেক",
    en: "Fact Check",
    hi: "तथ्य जाँच"
  },
  allNews: {
    bn: "সব খবর",
    en: "All News",
    hi: "सभी समाचार"
  }
};

const LOCALIZED_CATEGORIES: Record<string, Record<Language, string>> = {
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

  // Lock scroll on mobile when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
      {/* 1. Mobile-Specific Compact Header (visible only below lg) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md">
        {/* Left: Compact Brand logo */}
        <button 
          onClick={() => {
            onToggleFactCheck(false);
            onSelectCategory("");
          }}
          className="flex items-center space-x-2 text-left focus:outline-none"
        >
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-black text-sm shadow-sm">
            B
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
              {LOCALIZED_LABELS.title[currentLanguage]}
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              {currentLanguage === "bn" ? "ভূ-রাজনৈতিক নিউজ" : currentLanguage === "hi" ? "भू-राजनीतिक समाचार" : "Geopolitical News"}
            </p>
          </div>
        </button>

        {/* Right: Search & Drawer Menu Toggle */}
        <div className="flex items-center space-x-2.5">
          <form onSubmit={handleSearchSubmit} className="relative w-36 sm:w-48 flex items-center">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder={LOCALIZED_LABELS.searchPlaceholder[currentLanguage]}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-7 pr-6 py-1 text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600/30 focus:border-red-600 transition"
            />
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5" />
            {searchVal && (
              <button 
                type="button" 
                onClick={clearSearch} 
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Drawer Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>

      {/* 2. Desktop-Specific Telemetry & Utility Bar (visible only at lg and above) */}
      <div className="hidden lg:flex bg-slate-50 text-slate-500 text-xs py-2 px-8 justify-between items-center border-b border-slate-200">
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
        <div className="flex items-center space-x-4">
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

          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-slate-200/60 rounded-full p-0.5 border border-slate-200">
            <Globe className="w-3 h-3 text-slate-500 ml-1.5 mr-0.5" />
            {(["bn", "en", "hi"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-0.5 text-[10px] font-black rounded-full transition duration-150 uppercase cursor-pointer ${
                  currentLanguage === lang
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
                }`}
              >
                {lang === "bn" ? "বাং" : lang === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>

          <span className="text-slate-300">|</span>

          {/* Bookmark Button */}
          <button 
            onClick={onOpenBookmarks}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 font-medium cursor-pointer transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-red-600 fill-current" />
            <span>{LOCALIZED_LABELS.bookmarks[currentLanguage]}</span>
            {bookmarksCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ml-0.5">
                {bookmarksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Desktop-Specific Branding and Logo Area (visible only at lg and above) */}
      <div className="hidden lg:flex py-4 px-8 max-w-7xl mx-auto justify-between items-center">
        {/* Branding & Masthead */}
        <div>
          <button 
            onClick={() => {
              onToggleFactCheck(false);
              onSelectCategory("");
            }}
            className="flex items-center space-x-3 cursor-pointer group text-left focus:outline-none"
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
        <div className="flex items-center space-x-4">
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

      {/* 4. Desktop-Specific Category Navigation Bar (visible only at lg and above) */}
      <div className="hidden lg:block bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center h-14">
          {/* Category Tabs (Horizontal on Desktop) */}
          <nav className="flex space-x-1 items-center h-full overflow-x-auto no-scrollbar">
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
        </div>
      </div>

      {/* 5. Mobile Drawer/Sidebar Menu (with AnimatePresence and motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-50 lg:hidden cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col h-full lg:hidden border-l border-slate-100"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center text-white font-black text-sm">
                    B
                  </div>
                  <span className="text-base font-black tracking-tight text-slate-900">
                    {LOCALIZED_LABELS.title[currentLanguage]}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Real-time clocks */}
                <div className="bg-slate-100/70 rounded-xl p-3 flex justify-around items-center text-xs text-slate-600 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    <span className="font-semibold text-slate-800">{clocks.ist}</span>
                  </div>
                  <div className="text-slate-300">|</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500">{clocks.utc}</span>
                  </div>
                </div>

                {/* Bookmark Access section */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    {currentLanguage === "bn" ? "সংরক্ষিত নিবন্ধ" : currentLanguage === "hi" ? "सहेजे गए लेख" : "Saved Articles"}
                  </span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBookmarks();
                    }}
                    className="w-full flex items-center justify-between bg-red-50 hover:bg-red-100/70 border border-red-100 p-3 rounded-xl text-xs font-bold text-red-800 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Bookmark className="w-4 h-4 text-red-600 fill-current" />
                      <span>{LOCALIZED_LABELS.bookmarks[currentLanguage]}</span>
                    </div>
                    {bookmarksCount > 0 ? (
                      <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                        {bookmarksCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">(0)</span>
                    )}
                  </button>
                </div>

                {/* Language Toggle section */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    {currentLanguage === "bn" ? "ভাষা পরিবর্তন করুন" : currentLanguage === "hi" ? "भाषा बदलें" : "Switch Language"}
                  </span>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(["bn", "en", "hi"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => onLanguageChange(lang)}
                        className={`py-2 text-xs font-bold rounded-lg transition uppercase flex flex-col items-center justify-center cursor-pointer ${
                          currentLanguage === lang
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        }`}
                      >
                        <span className="text-xs font-black">
                          {lang === "bn" ? "বাংলা" : lang === "en" ? "English" : "हिन्दी"}
                        </span>
                        <span className="text-[9px] opacity-75 mt-0.5 font-bold uppercase">
                          {lang}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size controls */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    {currentLanguage === "bn" ? "অক্ষরের আকার" : currentLanguage === "hi" ? "पाठ का आकार" : "Text Display Size"}
                  </span>
                  <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onFontSizeChange(sz)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition uppercase ${
                          fontSize === sz
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-200/50"
                        }`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin launcher inside drawer (if applicable) */}
                {(typeof window !== "undefined" && (!!localStorage.getItem("adminToken") || window.location.search.includes("admin=true"))) && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      System Access
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold py-3 rounded-xl shadow transition cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>{LOCALIZED_LABELS.admin[currentLanguage]}</span>
                    </button>
                  </div>
                )}

                {/* Categories links */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    {currentLanguage === "bn" ? "খবর ও কভারেজ বিভাগ" : currentLanguage === "hi" ? "समाचार और श्रेणियां" : "News & Coverage Sections"}
                  </span>
                  <div className="space-y-1.5">
                    {/* All News button */}
                    <button
                      onClick={() => {
                        onToggleFactCheck(false);
                        onSelectCategory("");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-4 text-left text-xs font-bold rounded-xl transition flex items-center justify-between ${
                        !selectedCategory && !isFactCheckOnly
                          ? "bg-red-600 text-white shadow"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span>🏠 {LOCALIZED_LABELS.allNews[currentLanguage]}</span>
                      {!selectedCategory && !isFactCheckOnly && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>

                    {/* Fact Check Specialized Portal Selector */}
                    <button
                      onClick={() => {
                        onToggleFactCheck(true);
                        onSelectCategory("");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full py-2.5 px-4 text-left text-xs font-bold rounded-xl transition flex items-center justify-between ${
                        isFactCheckOnly
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-indigo-50 hover:bg-indigo-100/50 text-indigo-900"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{LOCALIZED_LABELS.factCheckLabel[currentLanguage]}</span>
                      </div>
                      {isFactCheckOnly && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>

                    <div className="h-[1px] bg-slate-100 my-2" />

                    {/* Categorized lists */}
                    {CATEGORIES.filter(c => c !== "Fact Check").map((cat) => {
                      const isSelected = selectedCategory === cat && !isFactCheckOnly;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            onToggleFactCheck(false);
                            onSelectCategory(cat);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full py-2.5 px-4 text-left text-xs font-bold rounded-xl transition flex items-center justify-between ${
                            isSelected
                              ? "bg-red-600 text-white shadow"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span>{LOCALIZED_CATEGORIES[cat]?.[currentLanguage] || cat}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 font-medium">
                © {new Date().getFullYear()} {LOCALIZED_LABELS.title[currentLanguage]}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
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
