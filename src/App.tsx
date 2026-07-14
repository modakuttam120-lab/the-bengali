import React, { useState, useEffect } from "react";
import { 
  Header 
} from "./components/Header";
import { 
  BreakingTicker 
} from "./components/BreakingTicker";
import { 
  ArticleCard 
} from "./components/ArticleCard";
import { 
  ArticleView 
} from "./components/ArticleView";
import { 
  AdminPanel 
} from "./components/AdminPanel";
import { 
  SkeletonCard 
} from "./components/SkeletonLoader";
import SitemapView from "./components/SitemapView";
import { 
  AnimatePresence, motion 
} from "motion/react";
import { handleImageLoadError } from "./utils/imageFallback";
import { 
  Article, Language 
} from "./types";
import { 
  TrendingUp, Newspaper, HelpCircle, Mail, Globe, Sparkles, AlertCircle, 
  ChevronRight, Bookmark, ArrowRight, ShieldCheck, Heart, ArrowUp, X 
} from "lucide-react";

const FONT_CLASSES = {
  sm: "text-sm leading-relaxed",
  base: "text-base leading-relaxed md:text-lg",
  lg: "text-lg leading-relaxed md:text-xl",
  xl: "text-xl leading-relaxed md:text-2xl"
};

const LOCALIZED_BACK_TO_TOP = {
  bn: "উপরে যান",
  en: "Back to Top",
  hi: "ऊपर जाएं"
};

const LOCALIZED_HOMEPAGE = {
  trendingTitle: {
    bn: "চলতি হাওয়া (Trending)",
    en: "Trending Stories",
    hi: "ट्रेंडिंग कहानियां"
  },
  latestTitle: {
    bn: "সর্বশেষ আপডেট",
    en: "Latest Updates",
    hi: "नवीनतम अपडेट"
  },
  featuredTitle: {
    bn: "বিশেষ প্রতিবেদন",
    en: "Featured Analysis",
    hi: "विशेष रिपोर्ट"
  },
  newsletterHeader: {
    bn: "সরাসরি ইনবক্সে খবরের আপডেট পান",
    en: "Get verified news directly in your inbox",
    hi: "सीधे अपने इनबॉक्स में सत्यापित समाचार प्राप्त करें"
  },
  newsletterDesc: {
    bn: "আমাদের নিয়মিত বুলেটিনে সাবস্ক্রাইব করুন এবং ভূ-রাজনীতি ও প্রযুক্তির গভীর বিশ্লেষণগুলো মিস করবেন না।",
    en: "Subscribe to our daily bulletin and never miss high-impact analyses of world affairs and AI.",
    hi: "हमारे दैनिक बुलेटिन की सदस्यता लें और भू-राजनीति और एआई के विश्लेषणों को कभी न छोड़ें।"
  },
  subscribeBtn: {
    bn: "যুক্ত হোন",
    en: "Subscribe Now",
    hi: "सदस्यता लें"
  },
  subscribeSuccess: {
    bn: "আপনাকে ধন্যবাদ! সাবস্ক্রিপশন সফল হয়েছে।",
    en: "Thank you! You are successfully subscribed.",
    hi: "धन्यवाद! आपका नामांकन सफल रहा।"
  },
  footerAbout: {
    bn: "দ্য বেঙ্গলি পিডিয়া হলো একটি সর্বাধুনিক এআই-চালিত বহুভাষিক সংবাদ প্ল্যাটফর্ম, যা বিশ্ব রাজনীতি, জাতীয় ইস্যু এবং বিজ্ঞান-প্রযুক্তির চুলচেরা বিশ্লেষণ নির্ভীকভাবে পরিবেশন করে।",
    en: "The Bengali Pedia is a cutting-edge AI-powered multilingual news portal delivering fearless coverage of geopolitics, national governance, and technology.",
    hi: "द बंगाली पीडिया एक अत्याधुनिक एआई-संचालित बहुभाषी समाचार पोर्टल है जो भू-राजनीति, राष्ट्रीय शासन और प्रौद्योगिकी का निडरता से विश्लेषण प्रदान करता है।"
  },
  noResults: {
    bn: "কোনো খবর পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন।",
    en: "No news stories found matching your criteria. Try adjusting filters or searches.",
    hi: "कोई समाचार नहीं मिला। कृपया अन्य कीवर्ड के साथ प्रयास करें।"
  },
  aboutPlatformTitle: {
    bn: "আমাদের সম্পর্কে",
    en: "About The Bengali Pedia",
    hi: "हमारे बारे में"
  }
};
export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("bn");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFactCheckOnly, setIsFactCheckOnly] = useState<boolean>(false);

  const [viewState, setViewState] = useState<"home" | "article-view" | "admin" | "bookmarks" | "sitemap">("home");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Local Storage Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bengaliPediaBookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Newsletter enrollment email status & modal triggers
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [hasSeenNewsletter, setHasSeenNewsletter] = useState(false);

  // Monitor article reading time to pop the newsletter modal (after 30 seconds)
  useEffect(() => {
    if (viewState !== "article-view" || !selectedArticleId || hasSeenNewsletter || newsletterSubscribed) {
      return;
    }

    const timer = setTimeout(() => {
      setIsNewsletterModalOpen(true);
      setHasSeenNewsletter(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [viewState, selectedArticleId, hasSeenNewsletter, newsletterSubscribed]);

  // Floating Back to Top Button state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  // Monitor page scroll to show/hide the button and compute reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Back to top button visibility check
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Reading progress calculation
      if (viewState === "article-view") {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const progress = (window.scrollY / totalHeight) * 100;
          setReadProgress(Math.min(100, Math.max(0, progress)));
        } else {
          setReadProgress(0);
        }
      } else {
        setReadProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on layout change to sync scroll position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewState, selectedArticleId]);

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    localStorage.setItem("bengaliPediaBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Fetch Published Articles
  const fetchArticles = () => {
    setLoading(true);
    let url = `/api/articles?lang=${currentLanguage}`;
    if (selectedCategory) {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    if (isFactCheckOnly) {
      url += `&isFactCheck=true`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) {
          setArticles(data.articles);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch articles:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, [currentLanguage, selectedCategory, searchQuery, isFactCheckOnly]);

  const handleToggleBookmark = (e: React.MouseEvent | any, id: string) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setBookmarks((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setViewState("article-view");
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenSitemapWithPolicy = (policyId: string) => {
    setViewState("sitemap");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const btn = document.querySelector(`button[data-policy-id="${policyId}"]`) as HTMLButtonElement | null;
      if (btn) btn.click();
    }, 150);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
    
    // Auto-close modal after 4 seconds of displaying the success message
    setTimeout(() => {
      setIsNewsletterModalOpen(false);
      setNewsletterSubscribed(false);
    }, 4000);
  };

  // Filter Bookmarks articles locally
  const bookmarkedArticles = articles.filter(a => bookmarks.includes(a.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans antialiased selection:bg-red-200">
      
      {/* Dynamic Main Header Module */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onSearch={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setViewState("home");
        }}
        onOpenAdmin={() => {
          const isAuthorized = !!localStorage.getItem("adminToken") || window.location.search.includes("admin=true");
          if (isAuthorized) {
            setViewState(viewState === "admin" ? "home" : "admin");
          }
        }}
        onOpenBookmarks={() => setViewState(viewState === "bookmarks" ? "home" : "bookmarks")}
        bookmarksCount={bookmarks.length}
        onToggleFactCheck={(bool) => {
          setIsFactCheckOnly(bool);
          setViewState("home");
        }}
        isFactCheckOnly={isFactCheckOnly}
      />

      {/* Breaking News Marquee Indicator */}
      <BreakingTicker
        articles={articles}
        language={currentLanguage}
        onSelectArticle={handleSelectArticle}
      />

      {/* MAIN LAYOUT BODY */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* VIEW 1: ADMIN PANEL */}
        {viewState === "admin" && (
          <AdminPanel
            onBack={() => setViewState("home")}
            allArticles={articles}
            onRefreshArticles={fetchArticles}
          />
        )}

        {/* VIEW 2: DETAILED ARTICLE READ-MODE */}
        {viewState === "article-view" && selectedArticleId && (
          <ArticleView
            articleId={selectedArticleId}
            language={currentLanguage}
            onBack={() => setViewState("home")}
            onSelectArticle={handleSelectArticle}
            allArticles={articles}
            isBookmarked={bookmarks.includes(selectedArticleId)}
            onToggleBookmark={() => setBookmarks(prev => prev.includes(selectedArticleId) ? prev.filter(i => i !== selectedArticleId) : [...prev, selectedArticleId])}
            fontSizeClass={FONT_CLASSES[fontSize]}
          />
        )}

        {/* VIEW 5: VISUAL SITEMAP */}
        {viewState === "sitemap" && (
          <SitemapView
            allArticles={articles}
            language={currentLanguage}
            onBack={() => setViewState("home")}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setIsFactCheckOnly(false);
              setViewState("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* VIEW 3: SAVED BOOKMARKS LISTING */}
        {viewState === "bookmarks" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-wider flex items-center space-x-2 text-slate-950">
                <Bookmark className="w-5 h-5 text-red-600 fill-current" />
                <span>My Saved Articles ({bookmarks.length})</span>
              </h2>
              <button 
                onClick={() => setViewState("home")} 
                className="text-xs font-bold text-slate-400 hover:text-red-600 transition"
              >
                Back to Home
              </button>
            </div>

            {bookmarkedArticles.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-400 font-medium text-sm">No saved articles found. Browse the home feed to save analyses.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bookmarkedArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    language={currentLanguage}
                    onSelect={handleSelectArticle}
                    isBookmarked={true}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: HOME PORTAL AND NEWS FEED (DEFAULT) */}
        {viewState === "home" && (
          <div className="space-y-10 animate-[fadeIn_0.25s_ease-out]">
            {loading ? (
              /* Skeletal Loading Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : articles.length === 0 ? (
              /* Empty Search / Filters Results State */
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto shadow-sm space-y-4">
                <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">
                  {searchQuery ? "No Matching Results" : "Repository Empty"}
                </h3>
                <p className="text-sm text-slate-500">
                  {LOCALIZED_HOMEPAGE.noResults[currentLanguage]}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setIsFactCheckOnly(false);
                  }}
                  className="bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-red-750 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* High-Quality Balanced Layout Grid */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Columns (8/12) - Primary News Feed */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* HERO BANNER SECTION (First Item, only when no active filter searches exist) */}
                  {!selectedCategory && !searchQuery && !isFactCheckOnly && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
                        <span>{LOCALIZED_HOMEPAGE.featuredTitle[currentLanguage]}</span>
                      </div>
                      
                      {(() => {
                        const heroArt = articles.find(a => a.isFeatured) || articles[0];
                        return (
                          <div 
                            onClick={() => handleSelectArticle(heroArt.id)}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-300 cursor-pointer group flex flex-col md:flex-row"
                          >
                            <div className="h-56 md:h-auto md:w-1/2 overflow-hidden bg-slate-50 relative">
                              <img
                                src={heroArt.image}
                                alt={heroArt.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-500"
                                onError={(e) => handleImageLoadError(e, heroArt.category)}
                              />
                            </div>
                            <div className="p-6 md:w-1/2 flex flex-col justify-between space-y-4">
                              <div className="space-y-2.5">
                                <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-sm inline-block">
                                  {heroArt.category}
                                </span>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-red-650 transition duration-200 leading-tight line-clamp-3">
                                  {heroArt.title}
                                </h3>
                                <p className="text-xs md:text-sm text-slate-500 line-clamp-3 leading-relaxed font-normal">
                                  {heroArt.description}
                                </p>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono pt-3 border-t border-slate-100">
                                <span>{heroArt.sourceName}</span>
                                <span>{new Date(heroArt.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* CORE NEWS GRID */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
                      {selectedCategory ? `${selectedCategory} coverage` : "Indexed Articles Feed"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {articles
                        // Exclude hero item from standard loop only when no filters are active
                        .filter((_, idx) => (selectedCategory || searchQuery || isFactCheckOnly) ? true : idx !== 0)
                        .map((art) => (
                          <ArticleCard
                            key={art.id}
                            article={art}
                            language={currentLanguage}
                            onSelect={handleSelectArticle}
                            isBookmarked={bookmarks.includes(art.id)}
                            onToggleBookmark={handleToggleBookmark}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right Columns (4/12) - Side columns (Trending, newsletter and about details) */}
                <aside className="lg:col-span-4 space-y-8">
                  
                  {/* TRENDING BAR MODULE */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center space-x-2 text-slate-900 border-b border-slate-200 pb-2">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <span>{LOCALIZED_HOMEPAGE.trendingTitle[currentLanguage]}</span>
                    </h3>

                    <div className="space-y-4">
                      {articles
                        .filter(a => a.isTrending)
                        .slice(0, 5)
                        .map((art, idx) => (
                          <div 
                            key={art.id}
                            onClick={() => handleSelectArticle(art.id)}
                            className="flex items-start space-x-3 cursor-pointer group pb-3.5 border-b border-slate-100 last:border-0 last:pb-0"
                          >
                            <span className="text-2xl font-black text-slate-200 font-serif leading-none">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 font-mono">
                                {art.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-600 transition duration-150">
                                {art.title}
                              </h4>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* NEWSLETTER FORM MODULE (Converted to compact promo trigger) */}
                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 font-mono">Newsletter</span>
                      </div>
                      <h3 className="text-base font-bold leading-snug">
                        {LOCALIZED_HOMEPAGE.newsletterHeader[currentLanguage]}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {LOCALIZED_HOMEPAGE.newsletterDesc[currentLanguage]}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsNewsletterModalOpen(true)}
                      className="w-full bg-white hover:bg-red-600 text-slate-900 hover:text-white text-xs font-black py-2.5 rounded-full shadow-lg transition duration-300 cursor-pointer text-center uppercase tracking-wider"
                      id="newsletter-promo-btn"
                    >
                      {newsletterSubscribed 
                        ? LOCALIZED_HOMEPAGE.subscribeSuccess[currentLanguage] 
                        : LOCALIZED_HOMEPAGE.subscribeBtn[currentLanguage]}
                    </button>
                  </div>

                  {/* ABOUT THE PLATFORM DETAIL CARD */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {LOCALIZED_HOMEPAGE.aboutPlatformTitle[currentLanguage]}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {LOCALIZED_HOMEPAGE.footerAbout[currentLanguage]}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-red-600 font-mono uppercase">
                      <span>✓ AI Verified Source</span>
                      <span>•</span>
                      <span>✓ Fact Check Portal</span>
                    </div>
                  </div>
                </aside>

              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER AREA */}
      <footer className="bg-white text-slate-500 py-12 px-4 sm:px-6 mt-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1 - Masthead */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              The Bengali Pedia
            </h3>
            <p className="text-xs leading-relaxed text-slate-500 font-normal">
              {LOCALIZED_HOMEPAGE.footerAbout[currentLanguage]}
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              © {new Date().getFullYear()} The Bengali Pedia. All Rights Reserved.
            </p>
          </div>

          {/* Col 2 - Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Editorial Guidelines</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => handleOpenSitemapWithPolicy("about")} className="text-slate-500 hover:text-red-600 transition text-left">About Us</button></li>
              <li><button onClick={() => handleOpenSitemapWithPolicy("fact-check")} className="text-slate-500 hover:text-red-600 transition text-left">Fact Check Policy</button></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-red-600 transition">Editorial Board</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-red-600 transition">Careers</a></li>
            </ul>
          </div>

          {/* Col 3 - Legal Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => handleOpenSitemapWithPolicy("privacy")} className="text-slate-500 hover:text-red-600 transition text-left">Privacy Policy</button></li>
              <li><button onClick={() => handleOpenSitemapWithPolicy("terms")} className="text-slate-500 hover:text-red-600 transition text-left">Terms & Conditions</button></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-red-600 transition">Disclaimer</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-red-600 transition">DMCA Takedown</a></li>
            </ul>
          </div>

        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 p-3.5 bg-red-600 hover:bg-red-750 text-white rounded-full shadow-2xl transition duration-300 cursor-pointer flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={LOCALIZED_BACK_TO_TOP[currentLanguage]}
            id="back-to-top-btn"
          >
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-28 group-hover:ml-2 transition-all duration-300 ease-out text-xs font-black whitespace-nowrap uppercase tracking-wider font-sans">
              {LOCALIZED_BACK_TO_TOP[currentLanguage]}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Thin Reading Progress Bar at the top of the screen */}
      <AnimatePresence>
        {viewState === "article-view" && (
          <motion.div
            key="reading-progress-bar"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 h-1 bg-slate-100/60 backdrop-blur-sm z-50 pointer-events-none"
            id="reading-progress-container"
          >
            <div
              className="h-full bg-red-600 transition-all duration-75 ease-out shadow-[0_1px_4px_rgba(220,38,38,0.4)]"
              style={{ width: `${readProgress}%` }}
              id="reading-progress-fill"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter non-intrusive Modal */}
      <AnimatePresence>
        {isNewsletterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsNewsletterModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
              id="newsletter-modal-backdrop"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 z-10 overflow-hidden"
              id="newsletter-modal-card"
            >
              {/* Top Decorative Color Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />

              {/* Close Button */}
              <button
                onClick={() => setIsNewsletterModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
                aria-label="Close newsletter modal"
                id="close-newsletter-modal"
              >
                <X className="w-5 h-5" />
              </button>

              {newsletterSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center space-y-4"
                  id="newsletter-modal-success"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-10 h-10 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900">
                      {currentLanguage === "bn" ? "নিবন্ধন সফল!" : currentLanguage === "hi" ? "पंजीकरण सफल!" : "Subscription Confirmed!"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {LOCALIZED_HOMEPAGE.subscribeSuccess[currentLanguage]}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6" id="newsletter-modal-content">
                  {/* Header/Icon */}
                  <div className="space-y-3 text-center">
                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <Mail className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 font-mono">
                        {currentLanguage === "bn" ? "নিউজ বুলেটিন" : currentLanguage === "hi" ? "समाचार बुलेटिन" : "Weekly Bulletin"}
                      </span>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                        {LOCALIZED_HOMEPAGE.newsletterHeader[currentLanguage]}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">
                        {LOCALIZED_HOMEPAGE.newsletterDesc[currentLanguage]}
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black py-3 rounded-xl shadow-lg shadow-red-600/20 transition duration-300 cursor-pointer uppercase tracking-wider text-center"
                    >
                      {LOCALIZED_HOMEPAGE.subscribeBtn[currentLanguage]}
                    </button>
                  </form>

                  {/* Footnote */}
                  <p className="text-[10px] text-slate-400 text-center font-normal">
                    {currentLanguage === "bn" 
                      ? "আমরা আপনার তথ্যের সুরক্ষা নিশ্চিত করি। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।" 
                      : currentLanguage === "hi" 
                      ? "हम आपकी गोपनीयता का सम्मान करते हैं। आप किसी भी समय सदस्यता समाप्त कर सकते हैं।" 
                      : "We value your privacy. You can unsubscribe at any time."}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
