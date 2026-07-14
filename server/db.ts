import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Article, Comment, AppSettings, LogEntry, Language, DashboardStats } from "../src/types";

const DB_FILE = path.join(process.cwd(), "db.json");

export interface DatabaseSchema {
  articles: Article[];
  comments: Comment[];
  settings: AppSettings;
  logs: LogEntry[];
  adminHash: string;
}

// Default Admin password is "admin123"
const DEFAULT_ADMIN_HASH = bcrypt.hashSync("admin123", 10);

const DEFAULT_SETTINGS: AppSettings = {
  gnewsApiKey: process.env.GNEWS_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  autoFetchIntervalMinutes: 15,
  isAutoFetchEnabled: true,
  enableAiSummary: true,
  enableAiTranslation: true,
  seoMetaTitleTemplate: "%title% | The Bengali Pedia",
  seoMetaDescriptionTemplate: "%description% - The Bengali Pedia"
};

// Seed high-quality initial articles in Bengali only
const SEED_ARTICLES: Article[] = [
  {
    id: "seed-1",
    title: "ভূ-রাজনীতিতে নতুন মোড়: কোয়াড বৈঠকের পর ভারত ও প্রশান্ত মহাসাগরীয় অঞ্চলে নিরাপত্তা জোরদার",
    description: "কোয়াড নেতাদের সাম্প্রতিক বৈঠকের পর ভারত-প্রশান্ত মহাসাগরীয় অঞ্চলে কৌশলগত নিরাপত্তা জোরদার করার জন্য বিশেষ সিদ্ধান্ত নেওয়া হয়েছে।",
    content: "ভারত, মার্কিন যুক্তরাষ্ট্র, জাপান ও অস্ট্রেলিয়ার জোট কোয়াড (Quad) এর সাম্প্রতিক শীর্ষ বৈঠকে ভারত-প্রশান্ত মহাসাগরীয় (Indo-Pacific) অঞ্চলে সামুদ্রিক নিরাপত্তা ও প্রযুক্তিগত সহযোগিতা বৃদ্ধির জন্য একটি নতুন রোডম্যাপ ঘোষণা করা হয়েছে। ভূ-রাজনৈতিক বিশ্লেষকদের মতে, এই অঞ্চলে শান্তি ও স্থায়িত্ব বজায় রাখতে ভারতের ভূমিকা অত্যন্ত গুরুত্বপূর্ণ। বৈঠকে কৃত্রিম বুদ্ধিমত্তা (AI) এবং সাইবার নিরাপত্তার ক্ষেত্রে সহযোগিতা আরও প্রসারিত করার সিদ্ধান্ত নেওয়া হয়েছে। এছাড়া, জলবায়ু পরিবর্তন মোকাবিলা এবং প্রাকৃতিক দুর্যোগে দ্রুত সাড়া দেওয়ার জন্য যৌথ টাস্কফোর্স গঠনের ঘোষণা দেওয়া হয়েছে। ভারতের প্রধানমন্ত্রী নরেন্দ্র মোদী এই জোটকে একটি ইতিবাচক শক্তি হিসেবে বর্ণনা করেছেন যা বিশ্ব কল্যাণে কাজ করছে।",
    category: "Geopolitics",
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    author: "ড. অনির্বাণ সেনগুপ্ত",
    url: "https://thebengalipedia.com/geopolitics-quad-2026",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    sourceName: "The Bengali Pedia Editorial",
    language: "bn",
    translations: {
      bn: {
        title: "ভূ-রাজনীতিতে নতুন মোড়: কোয়াড বৈঠকের পর ভারত ও প্রশান্ত মহাসাগরীয় অঞ্চলে নিরাপত্তা জোরদার",
        description: "কোয়াড নেতাদের সাম্প্রতিক বৈঠকের পর ভারত-প্রশান্ত মহাসাগরীয় অঞ্চলে কৌশলগত নিরাপত্তা জোরদার করার জন্য বিশেষ সিদ্ধান্ত নেওয়া হয়েছে।",
        content: "ভারত, মার্কিন যুক্তরাষ্ট্র, জাপান ও অস্ট্রেলিয়ার জোট কোয়াড (Quad) এর সাম্প্রতিক শীর্ষ বৈঠকে ভারত-প্রশান্ত মহাসাগরীয় (Indo-Pacific) অঞ্চলে সামুদ্রিক নিরাপত্তা ও প্রযুক্তিগত সহযোগিতা বৃদ্ধির জন্য একটি নতুন রোডম্যাপ ঘোষণা করা হয়েছে। ভূ-রাজনৈতিক বিশ্লেষকদের মতে, এই অঞ্চলে শান্তি ও স্থায়িত্ব বজায় রাখতে ভারতের ভূমিকা অত্যন্ত গুরুত্বপূর্ণ। বৈঠকে কৃত্রিম বুদ্ধিমত্তা (AI) এবং সাইবার নিরাপত্তার ক্ষেত্রে সহযোগিতা আরও প্রসারিত করার সিদ্ধান্ত নেওয়া হয়েছে। এছাড়া, জলবায়ু পরিবর্তন মোকাবিলা এবং প্রাকৃতিক দুর্যোগে দ্রুত সাড়া দেওয়ার জন্য যৌথ টাস্কফোর্স গঠনের ঘোষণা দেওয়া হয়েছে। ভারতের প্রধানমন্ত্রী নরেন্দ্র মোদী এই জোটকে একটি ইতিবাচক শক্তি হিসেবে বর্ণনা করেছেন যা বিশ্ব কল্যাণে কাজ করছে।",
        aiSummary: "সাম্প্রতিক কোয়াড শীর্ষ বৈঠকে ভারত-প্রশান্ত মহাসাগরীয় অঞ্চলে সামুদ্রিক নিরাপত্তা, সাইবার ও কৃত্রিম বুদ্ধিমত্তা সহযোগিতা জোরদার করার নতুন রোডম্যাপ ঘোষণা করা হয়েছে।",
        tags: ["ভূ-রাজনীতি", "কোয়াড", "নিরাপত্তা", "ভারত-প্রশান্ত"],
        keyPoints: [
          "ভারত-প্রশান্ত মহাসাগরীয় অঞ্চলের নিরাপত্তা বৃদ্ধির জন্য নতুন সিদ্ধান্ত গৃহীত।",
          "কৃত্রিম বুদ্ধিমত্তা ও সাইবার নিরাপত্তা ক্ষেত্রে সহযোগিতার বিস্তার।",
          "কোয়াডকে বিশ্ব কল্যাণে নিয়োজিত একটি ইতিবাচক শক্তি বললেন নরেন্দ্র মোদী।"
        ]
      }
    },
    isFeatured: true,
    isTrending: false,
    isBreaking: false,
    views: 1450,
    likes: 312,
    readingTime: 3,
    status: "published",
    tags: ["Geopolitics", "Quad", "India"],
    isFactCheck: false
  },
  {
    id: "seed-2",
    title: "পশ্চিমবঙ্গে শিল্পায়নে নতুন জোয়ার: আইটি এবং ম্যানুফ্যাকচারিং খাতে ব্যাপক বিনিয়োগের সম্ভাবনা",
    description: "রাজ্য সরকারের সাম্প্রতিক উদ্যোগের পর পশ্চিমবঙ্গের আইটি এবং ম্যানুফ্যাকচারিং শিল্পে নতুন বিনিয়োগ আসার প্রক্রিয়া শুরু হয়েছে।",
    content: "পশ্চিমবঙ্গ সরকারের শিল্প ও বাণিজ্য বিভাগ জানিয়েছে যে আগামী অর্থবর্ষে আইটি এবং টেকসই ম্যানুফ্যাকচারিং খাতে প্রায় ১০,০০০ কোটি টাকার বিনিয়োগের প্রস্তাব পাওয়া গিয়েছে। রাজারহাট-নিউটাউন অঞ্চলকে ভারতের অন্যতম প্রধান প্রযুক্তি হাবে রূপান্তর করার জন্য বিশেষ অর্থনৈতিক নীতি ঘোষণা করা হয়েছে। বিশ্লেষকদের মতে, সিঙ্গল-উইন্ডো ক্লিয়ারেন্স সিস্টেম ব্যবসার পরিকাঠামো তৈরি করা সহজ করবে। এই তরঙ্গের ফলে প্রায় ৫০,০০০ কর্মসংস্থানের সুযোগ তৈরি হতে পারে বলে আশা করা হচ্ছে।",
    category: "West Bengal Politics",
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
    author: "সৌমেন মুখোপাধ্যায়",
    url: "https://thebengalipedia.com/west-bengal-industry-2026",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    sourceName: "The Bengali Pedia Business Desk",
    language: "bn",
    translations: {
      bn: {
        title: "পশ্চিমবঙ্গে শিল্পায়নে নতুন জোয়ার: আইটি এবং ম্যানুফ্যাকচারিং খাতে ব্যাপক বিনিয়োগের সম্ভাবনা",
        description: "রাজ্য সরকারের সাম্প্রতিক উদ্যোগের পর পশ্চিমবঙ্গের আইটি এবং ম্যানুফ্যাকচারিং শিল্পে নতুন বিনিয়োগ আসার প্রক্রিয়া শুরু হয়েছে।",
        content: "পশ্চিমবঙ্গ সরকারের শিল্প ও বাণিজ্য বিভাগ জানিয়েছে যে আগামী অর্থবর্ষে আইটি এবং টেকসই ম্যানুফ্যাকচারিং খাতে প্রায় ১০,০০০ কোটি টাকার বিনিয়োগের প্রস্তাব পাওয়া গিয়েছে। রাজারহাট-নিউটাউন অঞ্চলকে ভারতের অন্যতম প্রধান প্রযুক্তি হাবে রূপান্তর করার জন্য বিশেষ অর্থনৈতিক নীতি ঘোষণা করা হয়েছে। বিশ্লেষকদের মতে, সিঙ্গল-উইন্ডো ক্লিয়ারেন্স সিস্টেম ব্যবসার পরিকাঠামো তৈরি করা সহজ করবে। এই তরঙ্গের ফলে প্রায় ৫০,০০০ কর্মসংস্থানের সুযোগ তৈরি হতে পারে বলে আশা করা হচ্ছে।",
        aiSummary: "পশ্চিমবঙ্গ সরকারের নতুন নীতির অধীনে রাজ্যে আইটি এবং ম্যানুফ্যাকচারিং খাতে প্রায় ১০,০০০ কোটি টাকার নতুন বিনিয়োগের সম্ভাবনা তৈরি হয়েছে, যার ফলে ব্যাপক কর্মসংস্থান হবে।",
        tags: ["পশ্চিমবঙ্গ", "শিল্পায়ন", "আইটি খাত", "কর্মসংস্থান"],
        keyPoints: [
          "আইটি এবং ম্যানুফ্যাকচারিং খাতে ১০ হাজার কোটি টাকার নতুন বিনিয়োগের প্রস্তাব।",
          "রাজারহাট-নিউটাউন অঞ্চলকে বিশেষ প্রযুক্তি হাবে রূপান্তরের বড় পরিকল্পনা।",
          "নতুন সিঙ্গল-উইন্ডো সিস্টেমের ফলে শিল্পস্থাপন আগের চেয়ে অনেক সহজ হবে।"
        ]
      }
    },
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
    views: 920,
    likes: 215,
    readingTime: 3,
    status: "published",
    tags: ["West Bengal", "Industry", "IT", "Jobs"],
    isFactCheck: false
  },
  {
    id: "seed-3",
    title: "ফ্যাক্ট চেক: এআই দ্বারা তৈরি ভাইরাল ছবি নিয়ে বিভ্রান্তি, সত্যতা প্রকাশ পেল",
    description: "সামাজিক মাধ্যমে দাবানলের মতো ছড়িয়ে পড়া চাঁদের পিঠে ভারতীয় স্পেসস্যুট পরিহিত মানুষের ছবিটির সত্যতা বিশ্লেষণ।",
    content: "সম্প্রতি সামাজিক যোগাযোগ মাধ্যমগুলোতে একটি ছবি ভাইরাল হয়েছে যেখানে দাবি করা হচ্ছে যে ভারতীয় মহাকাশচারীরা চাঁদে নেমে জাতীয় পতাকা নিয়ে দাঁড়িয়ে আছেন। ছবিটি প্রায় লক্ষাধিক মানুষ শেয়ার করেছেন। আমাদের দ্য বেঙ্গলি পিডিয়া (The Bengali Pedia) ফ্যাক্ট চেক টিম এই ছবিটির ওপর গভীর বিশ্লেষণ চালিয়েছে। ফরেনসিক ইমেজ বিশ্লেষণ এবং মেটাডেটা পরীক্ষার মাধ্যমে জানা গিয়েছে যে এই ছবিটি সম্পূর্ণ কৃত্রিম বুদ্ধিমত্তা বা জেনারেティブ এআই (Generative AI) দ্বারা তৈরি। ছবিতে মানুষের হাতের আঙুল এবং ছায়ার অমিল লক্ষ্য করা গেছে, যা এআই তৈরির অন্যতম প্রধান ত্রুটি। এছাড়া ইসরো (ISRO) অফিসিয়ালভাবে জানিয়েছে যে বর্তমানে চাঁদে কোনো ভারতীয় মহাকাশচারী পাঠানো হয়নি। অতএব ভাইরাল এই দাবিটি সম্পূর্ণ মিথ্যে এবং বিভ্রান্তিকর।",
    category: "Fact Check",
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    author: "ফ্যাক্ট চেক সেল",
    url: "https://thebengalipedia.com/fact-check-ai-moon-hoax",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    sourceName: "The Bengali Pedia Fact Check Desk",
    language: "bn",
    translations: {
      bn: {
        title: "ফ্যাক্ট চেক: এআই দ্বারা তৈরি ভাইরাল ছবি নিয়ে বিভ্রান্তি, সত্যতা প্রকাশ পেল",
        description: "সামাজিক মাধ্যমে দাবানলের মতো ছড়িয়ে পড়া চাঁদের পিঠে ভারতীয় স্পেসস্যুট পরিহিত মানুষের ছবিটির সত্যতা বিশ্লেষণ।",
        content: "সম্প্রতি সামাজিক যোগাযোগ মাধ্যমগুলোতে একটি ছবি ভাইরাল হয়েছে যেখানে দাবি করা হচ্ছে যে ভারতীয় মহাকাশচারীরা চাঁদে নেমে জাতীয় পতাকা নিয়ে দাঁড়িয়ে আছেন। ছবিটি প্রায় লক্ষাধিক মানুষ শেয়ার করেছেন। আমাদের দ্য বেঙ্গলি পিডিয়া (The Bengali Pedia) ফ্যাক্ট চেক টিম এই ছবিটির ওপর গভীর বিশ্লেষণ চালিয়েছে। ফরেনসিক ইমেজ বিশ্লেষণ এবং মেটাডেটা পরীক্ষার মাধ্যমে জানা গিয়েছে যে এই ছবিটি সম্পূর্ণ কৃত্রিম বুদ্ধিমত্তা বা জেনারেティブ এআই (Generative AI) দ্বারা তৈরি। ছবিতে মানুষের হাতের আঙুল এবং ছায়ার অমিল লক্ষ্য করা গেছে, যা এআই তৈরির অন্যতম প্রধান ত্রুটি। এছাড়া ইসরো (ISRO) অফিসিয়ালভাবে জানিয়েছে যে বর্তমানে চাঁদে কোনো ভারতীয় মহাকাশচারী পাঠানো হয়নি। অতএব ভাইরাল এই দাবিটি সম্পূর্ণ মিথ্যে এবং বিভ্রান্তিকর।",
        aiSummary: "সামাজিক মাধ্যমে চাঁদে মানুষের ভাইরাল ছবিটি আসলে কৃত্রিম বুদ্ধিমত্তা (AI) দিয়ে তৈরি। ইসরো নিশ্চিত করেছে যে চাঁদে কোনো মানব মিশন এখনও পাঠানো হয়নি।",
        tags: ["ফ্যাক্ট চেক", "বিভ্রান্তি", "কৃত্রিম বুদ্ধিমত্তা", "ইসরো", "চাঁদ মিশন"],
        keyPoints: [
          "ভাইরাল ছবিটি জেনারেティブ এআই দ্বারা তৈরি, কোনো বাস্তব ছবি নয়।",
          "ইমেজের ছায়া এবং অসঙ্গতিপূর্ণ আঙুল বিশ্লেষণ করে এআই জেনারেশন ধরা পড়েছে।",
          "বর্তমানে চাঁদে কোনো ভারতীয় মহাকাশচারী উপস্থিত নেই বলে ইসরো নিশ্চিত করেছে।"
        ]
      }
    },
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    views: 2310,
    likes: 540,
    readingTime: 3,
    status: "published",
    tags: ["Fact Check", "AI", "ISRO", "Moon"],
    isFactCheck: true,
    factCheckRating: "false",
    factCheckExplanation: "The image is fully synthesized by an AI software, and ISRO verified that no manned lunar missions have been conducted yet."
  }
];

const SEED_COMMENTS: Comment[] = [
  {
    id: "comment-1",
    articleId: "seed-1",
    authorName: "রাহুল মজুমদার",
    content: "খুব সুন্দর এবং বিস্তারিত বিশ্লেষণ। কোয়াড জোটে ভারতের গুরুত্ব দিন দিন বাড়ছে, যা বৈশ্বিক রাজনীতিতে প্রভাব ফেলবে।",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 12
  },
  {
    id: "comment-2",
    articleId: "seed-3",
    authorName: "Amit Sharma",
    content: "Thanks for doing this Fact Check! AI images are becoming so realistic nowadays, it's hard to distinguish without professional checks.",
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
    likes: 8
  }
];

// Helper functions for reading/writing Database
export function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        articles: SEED_ARTICLES,
        comments: SEED_COMMENTS,
        settings: DEFAULT_SETTINGS,
        logs: [
          {
            id: "log-init",
            timestamp: new Date().toISOString(),
            level: "info",
            message: "Database initialized with seed data.",
            context: "DB Init"
          }
        ],
        adminHash: DEFAULT_ADMIN_HASH
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data) as DatabaseSchema;

    // Ensure all required top-level fields are present
    if (!parsed.articles) parsed.articles = SEED_ARTICLES;

    // Sanitize any articles having '[অনুবাদ]' tags
    if (parsed.articles) {
      let madeChanges = false;
      parsed.articles.forEach(a => {
        if (a.title && a.title.startsWith("[অনুবাদ]")) {
          a.title = a.title.replace(/^\[অনুবাদ\]\s*/, "");
          madeChanges = true;
        }
        if (a.translations) {
          for (const lang of Object.keys(a.translations)) {
            const trans = a.translations[lang as Language];
            if (trans && trans.title && trans.title.startsWith("[অনুবাদ]")) {
              trans.title = trans.title.replace(/^\[অনুবাদ\]\s*/, "");
              madeChanges = true;
            }
          }
        }
      });
      // Save cleaned DB back if we found and stripped any tags
      if (madeChanges) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
        } catch (e) {
          console.error("Failed to write sanitized db back to file", e);
        }
      }
    }

    if (!parsed.comments) parsed.comments = SEED_COMMENTS;
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
    } else {
      if (parsed.settings.geminiApiKey === undefined) {
        parsed.settings.geminiApiKey = process.env.GEMINI_API_KEY || "";
      }
    }
    if (!parsed.logs) parsed.logs = [];
    if (!parsed.adminHash) parsed.adminHash = DEFAULT_ADMIN_HASH;

    return parsed;
  } catch (err: any) {
    console.error("Error reading database:", err);
    return {
      articles: SEED_ARTICLES,
      comments: SEED_COMMENTS,
      settings: DEFAULT_SETTINGS,
      logs: [{ id: "error", timestamp: new Date().toISOString(), level: "error", message: `DB Read failed: ${err.message}` }],
      adminHash: DEFAULT_ADMIN_HASH
    };
  }
}

export function writeDb(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Log helper
export function addLog(level: "info" | "warning" | "error", message: string, context?: string): void {
  const db = getDb();
  const log: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  };
  db.logs.unshift(log);
  // Cap logs at 200 items to avoid infinite size growth
  if (db.logs.length > 200) {
    db.logs = db.logs.slice(0, 200);
  }
  writeDb(db);
}

// Dashboard Stats generator
export function getStats(): DashboardStats {
  const db = getDb();
  const activeArticles = db.articles.filter(a => a.status === "published");
  const totalViews = activeArticles.reduce((sum, a) => sum + a.views, 0);
  const totalLikes = activeArticles.reduce((sum, a) => sum + a.likes, 0);

  // Articles fetched/added today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const fetchedToday = db.articles.filter(a => new Date(a.publishedAt) >= startOfDay).length;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  activeArticles.forEach(a => {
    categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
  });

  // Simple view history mock (last 7 days)
  const viewsHistory = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Vary mock views logically based on real total
    const views = Math.round((totalViews / 7) * (0.8 + Math.random() * 0.4));
    return { date: dateStr, views };
  }).reverse();

  return {
    totalArticles: activeArticles.length,
    totalViews,
    totalLikes,
    fetchedToday,
    categoryBreakdown,
    viewsHistory
  };
}
