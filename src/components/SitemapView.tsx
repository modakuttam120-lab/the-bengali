import React, { useState } from "react";
import { 
  ArrowLeft, 
  Map, 
  Folder, 
  BookOpen, 
  FileText, 
  Search, 
  Bookmark, 
  ShieldAlert, 
  Globe, 
  FileCode2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Article, Language } from "../types";

interface SitemapViewProps {
  allArticles: Article[];
  language: Language;
  onBack: () => void;
  onSelectArticle: (id: string) => void;
  onSelectCategory: (category: string) => void;
}

const LOCALIZED_SITEMAP = {
  title: {
    bn: "ওয়েবসাইট সাইটম্যাপ (Visual Index)",
    en: "Visual Sitemap & Site Index",
    hi: "वेबसाइट साइटमैप (Visual Index)"
  },
  subtitle: {
    bn: "দ্য বেঙ্গলি পিডিয়া-র সমস্ত সংবাদ, বিভাগ, আইনি নির্দেশিকা এবং প্রযুক্তিগত নথির একটি সামগ্রিক তালিকা।",
    en: "A complete visual index of all coverages, categories, legal guidelines, and technical indices on The Bengali Pedia.",
    hi: "द बंगाली पीडिया के सभी समाचार, श्रेणियों, कानूनी दिशानिर्देशों और तकनीकी दस्तावेजों की एक व्यापक सूची।"
  },
  backBtn: {
    bn: "হোম পেজে ফিরে যান",
    en: "Back to Home",
    hi: "होम पेज पर वापस जाएं"
  },
  searchPlaceholder: {
    bn: "নিবন্ধ সূচী অনুসন্ধান করুন...",
    en: "Search the article directory...",
    hi: "लेख निर्देशिका खोजें..."
  },
  totalArticles: {
    bn: "মোট প্রকাশিত নিবন্ধ",
    en: "Total Published Articles",
    hi: "कुल प्रकाशित लेख"
  },
  sections: {
    directory: {
      bn: "১. পোর্টাল নেভিগেশন",
      en: "1. Portal Navigation",
      hi: "1. पोर्टल नेविगेशन"
    },
    categories: {
      bn: "২. সংবাদ কভারেজ বিভাগসমূহ",
      en: "2. News Categories Index",
      hi: "2. समाचार श्रेणियां"
    },
    compliance: {
      bn: "৩. আইনি ও সম্পাদকীয় নীতি নির্দেশিকা",
      en: "3. Legal & Editorial Guidelines",
      hi: "3. कानूनी और संपादकीय दिशानिर्देश"
    },
    articles: {
      bn: "৪. সমস্ত প্রকাশিত নিবন্ধের তালিকা",
      en: "4. Published Articles Catalogue",
      hi: "4. प्रकाशित लेखों की सूची"
    },
    xml: {
      bn: "৫. সার্চ ইঞ্জিন ক্রলার ইনডেক্স (XML/TXT)",
      en: "5. Search Engine Crawler Indices",
      hi: "5. सर्च इंजन क्रॉलर इंडेक्स"
    }
  }
};

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

// High-quality policies to display in expandable containers
const POLICIES = [
  {
    id: "about",
    title: {
      bn: "আমাদের সম্পর্কে (About Us)",
      en: "About The Bengali Pedia",
      hi: "हमारे बारे में"
    },
    content: {
      en: "The Bengali Pedia is a premier multilingual, state-of-the-art geopolitical, regional political, and technology news directory focused on West Bengal, India, and global affairs. We strive to provide real-time updates and deep AI-driven summaries, ensuring clean, unbiased, and verified journalistic coverage for readers worldwide.",
      bn: "দ্য বেঙ্গলি পিডিয়া হল পশ্চিমবঙ্গ, ভারত এবং বিশ্বব্যাপী ঘটনাগুলির উপর দৃষ্টি নিবদ্ধ করে একটি প্রধান বহুভাষিক ভূ-রাজনৈতিক, আঞ্চলিক রাজনৈতিক এবং প্রযুক্তিগত সংবাদ নির্দেশিকা। আমরা বিশ্বব্যাপী পাঠকদের জন্য পরিচ্ছন্ন, নিরপেক্ষ এবং যাচাইকৃত সাংবাদিকতার কভারেজ নিশ্চিত করে রিয়েল-টাইম আপডেট এবং এআই-চালিত বিশদ সারাংশ সরবরাহ করতে সচেষ্ট।",
      hi: "द बंगाली पीडिया एक प्रमुख बहुभाषी भू-राजनीतिक, क्षेत्रीय राजनीतिक और तकनीकी समाचार निर्देशिका है जो पश्चिम बंगाल, भारत और वैश्विक मामलों पर केंद्रित है। हम दुनिया भर के पाठकों के लिए स्वच्छ, निष्पक्ष और सत्यापित पत्रकारिता कवरेज सुनिश्चित करते हुए वास्तविक समय के अपडेट और एआई-संचालित सारांश प्रदान करने का प्रयास करते हैं।"
    }
  },
  {
    id: "fact-check",
    title: {
      bn: "ফ্যাক্ট চেক পলিসি (Fact Check Policy)",
      en: "Fact-Checking & Verification Policy",
      hi: "तथ्य जाँच नीति"
    },
    content: {
      en: "Our editorial team follows a rigorous triple-tier verification workflow to detect misinformation, regional fake news, and deepfakes. Every article marked with 'Fact Check Verified' has been analyzed against authentic institutional records, state announcements, and trusted primary documents. We use AI models strictly to assist in categorization and translation verification, never for raw journalism creation.",
      bn: "আমাদের সম্পাদকীয় দল ভুল তথ্য, আঞ্চলিক ভুয়ো খবর এবং ডিপফেক সনাক্ত করতে একটি কঠোর ত্রি-স্তরীয় যাচাইকরণ কর্মপ্রবাহ অনুসরণ করে। 'ফ্যাক্ট চেক ভেরিফাইড' চিহ্নিত প্রতিটি নিবন্ধ খাঁটি প্রাতিষ্ঠানিক রেকর্ড, সরকারি ঘোষণা এবং বিশ্বস্ত প্রাথমিক নথির বিপরীতে পুঙ্খানুপুঙ্খভাবে বিশ্লেষণ করা হয়েছে। আমরা এআই মডেলগুলিকে কঠোরভাবে শ্রেণিবিন্যাস এবং অনুবাদ যাচাইকরণে সহায়তা করার জন্য ব্যবহার করি, মৌলিক সাংবাদিকতা সৃষ্টির জন্য নয়।",
      hi: "हमारी संपादकीय टीम गलत सूचना, क्षेत्रीय फर्जी खबरों और डीपफेक का पता लगाने के लिए एक कड़े तीन-स्तरीय सत्यापन कार्यप्रवाह का पालन करती है। 'तथ्य जांच सत्यापित' के रूप में चिह्नित प्रत्येक लेख का विश्लेषण प्रामाणिक संस्थागत रिकॉर्ड, सरकारी घोषणाओं और विश्वसनीय प्राथमिक दस्तावेजों के आधार पर किया गया है।"
    }
  },
  {
    id: "privacy",
    title: {
      bn: "গোপনীয়তা নীতি (Privacy Policy)",
      en: "Privacy & Data Protection Policy",
      hi: "गोपनीयता नीति"
    },
    content: {
      en: "The Bengali Pedia respects your privacy. We store bookmarks locally in your browser storage (localStorage) to provide customized saved lists without tracking. No personal telemetry or usage behaviors are ever transmitted to third-party databases, conforming to European GDPR and Indian Digital Personal Data Protection (DPDP) standards.",
      bn: "দ্য বেঙ্গলি পিডিয়া আপনার গোপনীয়তাকে সম্মান করে। আমরা কোনো ট্র্যাকিং ছাড়াই ব্যক্তিগতকৃত সংরক্ষিত তালিকা প্রদানের জন্য আপনার ব্রাউজার স্টোরেজে (localStorage) বুকমার্কগুলি স্থানীয়ভাবে সংরক্ষণ করি। ইউরোপীয় জিডিপিআর এবং ভারতীয় ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা (ডিপিডিপি) মান মেনে কোনো ব্যক্তিগত টেলিমেট্রি বা ব্যবহারের আচরণ কখনই তৃতীয় পক্ষের ডেটাবেসে স্থানান্তরিত হয় না।",
      hi: "द बंगाली पीडिया आपकी गोपनीयता का सम्मान करता है। हम बिना किसी ट्रैकिंग के व्यक्तिगत रूप से सहेजी गई सूचियां प्रदान करने के लिए आपके ब्राउज़र स्टोरेज (localStorage) में स्थानीय रूप से बुकमार्क सहेजते हैं। यूरोपीय जीडीपीआर और भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण मानकों के अनुरूप कोई भी व्यक्तिगत डेटा कभी साझा नहीं किया जाता।"
    }
  },
  {
    id: "terms",
    title: {
      bn: "শর্তাবলী ও নিয়মাবলী (Terms & Conditions)",
      en: "Terms of Service & Usage Guidelines",
      hi: "नियम और शर्तें"
    },
    content: {
      en: "By accessing The Bengali Pedia, you agree to utilize our service for informative, research-oriented, and ethical personal purposes. Content replication, automated scraping, or reverse engineering of the database models without explicit editorial consensus is strictly prohibited under intellectual property rules.",
      bn: "দ্য বেঙ্গলি পিডিয়া ব্যবহার করার মাধ্যমে, আপনি তথ্যপূর্ণ, গবেষণা-ভিত্তিক এবং নৈতিক ব্যক্তিগত উদ্দেশ্যে আমাদের পরিষেবা ব্যবহার করতে সম্মত হন। স্পষ্ট সম্পাদকীয় সম্মতি ছাড়া বিষয়বস্তু অনুলিপি, স্বয়ংক্রিয় ক্রলিং বা ডেটাবেস কাঠামোর রিভার্স ইঞ্জিনিয়ারিং মেধা সম্পত্তি আইনের অধীনে কঠোরভাবে নিষিদ্ধ।",
      hi: "द बंगाली पीडिया का उपयोग करके, आप हमारे समाचारों को जानकारीपूर्ण, अनुसंधान-उन्मुख और व्यक्तिगत उद्देश्यों के लिए उपयोग करने के लिए सहमत हैं। बिना किसी लिखित अनुमति के सामग्री की नकल या डेटाबेस मॉडल का अनुचित उपयोग बौद्धिक संपदा नियमों के तहत सख्त वर्जित है।"
    }
  }
];
export default function SitemapView({ 
  allArticles, 
  language, 
  onBack, 
  onSelectArticle, 
  onSelectCategory 
}: SitemapViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  // Filter published articles matching query
  const publishedArticles = allArticles.filter(a => a.status === "published");
  const filteredArticles = publishedArticles.filter(art => {
    const query = searchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(query) ||
      art.description.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query)
    );
  });

  const togglePolicy = (id: string) => {
    setActivePolicy(activePolicy === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 font-sans animate-[fadeIn_0.3s_ease-out]" id="sitemap-page">
      
      {/* Header breadcrumb & controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <span>The Bengali Pedia</span>
            <span>/</span>
            <span className="text-red-600 font-bold">Sitemap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Map className="w-7 h-7 text-red-600" />
            <span>{LOCALIZED_SITEMAP.title[language]}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {LOCALIZED_SITEMAP.subtitle[language]}
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-red-600 font-bold text-xs sm:text-sm bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-full border border-slate-200 transition cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{LOCALIZED_SITEMAP.backBtn[language]}</span>
        </button>
      </div>

      {/* Grid containing Sitemap Index components */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: General Nav, Categories, and Legal Compliance policies (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* SECTION 1: Portal Navigation Directory */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <Folder className="w-4 h-4 text-red-600" />
              <span>{LOCALIZED_SITEMAP.sections.directory[language]}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <button
                onClick={onBack}
                className="p-4 text-left border border-slate-100 hover:border-red-600 rounded-xl hover:bg-slate-50 transition cursor-pointer group space-y-1"
              >
                <div className="font-bold text-sm text-slate-800 group-hover:text-red-600 flex items-center space-x-2">
                  <span>🏠 Homepage</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  The primary workspace with hero analysis, breaking ticker, and feed.
                </p>
              </button>

              <button
                onClick={() => {
                  onBack();
                  // A small delay to let state transitions settle or rely on the parent page
                  setTimeout(() => {
                    const bookmarksBtn = document.getElementById("nav-bookmarks-btn");
                    if (bookmarksBtn) bookmarksBtn.click();
                  }, 100);
                }}
                className="p-4 text-left border border-slate-100 hover:border-red-600 rounded-xl hover:bg-slate-50 transition cursor-pointer group space-y-1"
              >
                <div className="font-bold text-sm text-slate-800 group-hover:text-red-600 flex items-center space-x-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmarks Directory</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  View and manage articles saved offline on your current browser profile.
                </p>
              </button>

              {(typeof window !== "undefined" && (!!localStorage.getItem("adminToken") || window.location.search.includes("admin=true"))) && (
                <button
                  onClick={() => {
                    onBack();
                    setTimeout(() => {
                      const adminBtn = document.getElementById("nav-admin-btn");
                      if (adminBtn) adminBtn.click();
                    }, 100);
                  }}
                  className="p-4 text-left border border-slate-100 hover:border-red-600 rounded-xl hover:bg-slate-50 transition cursor-pointer group space-y-1"
                >
                  <div className="font-bold text-sm text-slate-800 group-hover:text-red-600 flex items-center space-x-2">
                    <span>⚙️ Editorial Desk (Admin)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Manage database content, translate with Gemini AI, and schedule fetches.
                  </p>
                </button>
              )}

              <div className="p-4 text-left border border-slate-50 rounded-xl bg-slate-50/50 space-y-1 select-none">
                <div className="font-bold text-sm text-slate-700 flex items-center space-x-2">
                  <span>🗺️ Sitemap (Current)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal">
                  Comprehensive map index for human readers and machine indexers.
                </p>
              </div>

            </div>
          </section>

          {/* SECTION 2: Categories Directory */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-red-600" />
              <span>{LOCALIZED_SITEMAP.sections.categories[language]}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className="px-3.5 py-2.5 text-left text-xs font-bold rounded-xl border border-slate-100 hover:border-red-600 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition uppercase cursor-pointer"
                >
                  📁 {cat}
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 3: Legal, Guidelines & Compliance expandable docs */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{LOCALIZED_SITEMAP.sections.compliance[language]}</span>
            </h2>
            <div className="space-y-3">
              {POLICIES.map((policy) => {
                const isOpen = activePolicy === policy.id;
                return (
                  <div key={policy.id} className="border border-slate-100 rounded-xl overflow-hidden transition">
                    <button
                      onClick={() => togglePolicy(policy.id)}
                      data-policy-id={policy.id}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 text-left font-bold text-xs sm:text-sm text-slate-800 transition focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{policy.title[language]}</span>
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed font-normal">
                        {policy.content[language]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Side: Searchable Published Article Index (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* SECTION 4: Catalogue of All Articles */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col h-[525px]">
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>{LOCALIZED_SITEMAP.sections.articles[language]}</span>
              </h2>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 font-mono uppercase">
                <span>{LOCALIZED_SITEMAP.totalArticles[language]}</span>
                <span className="text-red-600 font-bold">{publishedArticles.length}</span>
              </div>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={LOCALIZED_SITEMAP.searchPlaceholder[language]}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600 transition"
              />
            </div>

            {/* Scrollable list container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No matching archived publications found.
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    className="w-full text-left p-3 border border-slate-50 hover:border-slate-200 rounded-xl bg-slate-50/20 hover:bg-slate-50 transition flex flex-col space-y-1.5 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-red-600 font-mono">
                        {art.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(art.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                      {art.title}
                    </h4>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* SECTION 5: XML Crawler Indices (robots, sitemap.xml, feed.xml) */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-red-600" />
              <span>{LOCALIZED_SITEMAP.sections.xml[language]}</span>
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-red-600 hover:bg-slate-50 transition text-slate-600 hover:text-slate-900"
              >
                <span>📄 /sitemap.xml</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-red-600 hover:bg-slate-50 transition text-slate-600 hover:text-slate-900"
              >
                <span>⚙️ /robots.txt</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="/feed.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-red-600 hover:bg-slate-50 transition text-slate-600 hover:text-slate-900"
              >
                <span>📡 /feed.xml (RSS Feed)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
