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
import { handleImageLoadError } from "./utils/imageFallback";
import { 
  Article, Language 
} from "./types";
import { 
  TrendingUp, Newspaper, HelpCircle, Mail, Globe, Sparkles, AlertCircle, 
  ChevronRight, Bookmark, ArrowRight, ShieldCheck, Heart 
} from "lucide-react";

const FONT_CLASSES = {
  sm: "text-sm leading-relaxed",
  base: "text-base leading-relaxed md:text-lg",
  lg: "text-lg leading-relaxed md:text-xl",
  xl: "text-xl leading-relaxed md:text-2xl"
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

  // Newsletter enrollment email status
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
    setTimeout(() => setNewsletterSubscribed(false), 5000);
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

                  {/* NEWSLETTER FORM MODULE */}
                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-4">
                    <div className="space-y-2">
                      <Mail className="w-8 h-8 text-red-500" />
                      <h3 className="text-lg font-bold leading-snug">
                        {LOCALIZED_HOMEPAGE.newsletterHeader[currentLanguage]}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {LOCALIZED_HOMEPAGE.newsletterDesc[currentLanguage]}
                      </p>
                    </div>

                    {newsletterSubscribed ? (
                      <div className="bg-emerald-950 text-emerald-400 p-3 rounded-xl text-xs font-bold border border-emerald-900 text-center animate-pulse">
                        {LOCALIZED_HOMEPAGE.subscribeSuccess[currentLanguage]}
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                        <input
                          type="email"
                          required
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full bg-white/5 border border-white/10 rounded-full p-2.5 pl-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          type="submit"
                          className="w-full bg-white hover:bg-red-600 text-slate-900 hover:text-white text-xs font-bold py-2.5 rounded-full shadow transition cursor-pointer"
                        >
                          {LOCALIZED_HOMEPAGE.subscribeBtn[currentLanguage]}
                        </button>
                      </form>
                    )}
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

    </div>
  );
}
