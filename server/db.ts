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
    content: "ভারত, মার্কিন যুক্তরাষ্ট্র, জাপান ও অস্ট্রেলিয়ার জোট কোয়াড (Quad) এর সাম্প্রতিক শীর্ষ বৈঠকে ভারত-প্রشان্ত মহাসাগরীয় (Indo-Pacific) অঞ্চলে সামুদ্রিক নিরাপত্তা ও প্রযুক্তিগত সহযোগিতা বৃদ্ধির জন্য একটি নতুন রোডম্যাপ ঘোষণা করা হয়েছে। ভূ-রাজনৈতিক বিশ্লেষকদের মতে, এই অঞ্চলে শান্তি ও স্থায়িত্ব বজায় রাখতে ভারতের ভূমিকা অত্যন্ত গুরুত্বপূর্ণ। বৈঠকে কৃত্রিম বুদ্ধিমত্তা (AI) এবং সাইবার নিরাপত্তার ক্ষেত্রে সহযোগিতা আরও প্রসারিত করার সিদ্ধান্ত নেওয়া হয়েছে। এছাড়া, জলবায়ু পরিবর্তন মোকাবিলা এবং প্রাকৃতিক দুর্যোগে দ্রুত সাড়া দেওয়ার জন্য যৌথ টাস্কফোর্স গঠনের ঘোষণা দেওয়া হয়েছে। ভারতের প্রধানমন্ত্রী নরেন্দ্র মোদী এই জোটকে একটি ইতিবাচক শক্তি হিসেবে বর্ণনা করেছেন যা বিশ্ব কল্যাণে কাজ করছে।",
    category: "Geopolitics",
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    author: "অনির্বাণ সেনগুপ্ত",
    url: "https://thebengalipedia.com/quad-summit-2026",
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
      },
      en: {
        title: "New Turn in Geopolitics: Maritime Security Strengthened in Indo-Pacific After Quad Summit",
        description: "Key strategic decisions have been taken to boost maritime security in the Indo-Pacific region following the recent Quad Leaders' Summit.",
        content: "The Quad alliance consisting of India, the United States, Japan, and Australia, in its recent summit, announced a new roadmap to enhance maritime security and technological cooperation in the Indo-Pacific region. Geopolitical analysts observe that India's role is highly crucial in maintaining peace and stability in this region. The summit made decisions to expand cooperation in the fields of Artificial Intelligence (AI) and cyber security. Additionally, a joint task force has been formed to tackle climate change and manage natural disasters. Prime Minister Narendra Modi described the alliance as a force for global good.",
        aiSummary: "The recent Quad summit outlined a new roadmap for maritime security, AI, and cyber cooperation in the Indo-Pacific region.",
        tags: ["Geopolitics", "Quad", "Security", "Indo-Pacific"],
        keyPoints: [
          "New decisions made to strengthen Indo-Pacific security.",
          "Extended cooperation in AI and cyber security fields.",
          "PM Narendra Modi called the alliance a positive force for global good."
        ]
      },
      hi: {
        title: "भू-राजनीति में नया मोड़: क्वाड बैठक के बाद भारत-प्रशांत क्षेत्र में सुरक्षा मजबूत",
        description: "हाल ही में आयोजित क्वाड नेताओं के शिखर सम्मेलन के बाद भारत-प्रशांत क्षेत्र में रणनीतिक सुरक्षा को मजबूत करने के लिए विशेष निर्णय लिए गए हैं।",
        content: "भारत, संयुक्त राज्य अमेरिका, जापान और ऑस्ट्रेलिया के क्वाड (Quad) गठबंधन के हालिया शिखर सम्मेलन में भारत-प्रशांत (Indo-Pacific) क्षेत्र में समुद्री सुरक्षा और तकनीकी सहयोग को बढ़ावा देने के लिए एक नया रोडमैप घोषित किया गया है। भू-राजनीतिक विश्लेषकों के अनुसार, इस क्षेत्र में शांति और स्थिरता बनाए रखने में भारत की भूमिका अत्यंत महत्वपूर्ण है। बैठक में कृत्रिम बुद्धिमत्ता (AI) और साइबर सुरक्षा के क्षेत्रों में सहयोग का विस्तार करने का निर्णय लिया गया। इसके अतिरिक्त, जलवायु परिवर्तन से निपटने और प्राकृतिक आपदाओं में त्वरित सहायता के लिए एक संयुक्त कार्यबल के गठन की घोषणा की गई है। भारतीय प्रधानमंत्री नरेंद्र मोदी ने इस गठबंधन को वैश्विक कल्याण के लिए काम करने वाली एक सकारात्मक शक्ति बताया है।",
        aiSummary: "हालिया क्वाड शिखर सम्मेलन में भारत-प्रशांत क्षेत्र में समुद्री सुरक्षा, एआई और साइबर सहयोग को मजबूत करने के लिए एक नए रोडमैप की घोषणा की गई है।",
        tags: ["भू-राजनीति", "क्वाड", "सुरक्षा", "भारत-प्रशांत"],
        keyPoints: [
          "भारत-प्रशांत क्षेत्र में सुरक्षा बढ़ाने के लिए नए निर्णय लिए गए।",
          "कृत्रिम बुद्धिमत्ता और साइबर सुरक्षा के क्षेत्र में सहयोग का विस्तार।",
          "पीएम नरेंद्र मोदी ने गठबंधन को वैश्विक कल्याण के लिए एक सकारात्मक शक्ति बताया।"
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
      },
      en: {
        title: "New Industrial Wave in West Bengal: Bright Prospects for Massive Investments in IT and Manufacturing",
        description: "Following recent state government initiatives, fresh investments have started flowing into West Bengal's IT and manufacturing sectors.",
        content: "The Department of Industry, Commerce and Enterprises of West Bengal has reported receiving investment proposals worth approximately INR 10,000 crores in IT and sustainable manufacturing sectors for the upcoming fiscal year. Special economic policies have been announced to transform the Rajarhat-New Town region into one of India's premier technology hubs. Analysts note that the single-window clearance system will facilitate business setup. This industrial wave is expected to generate nearly 50,000 employment opportunities.",
        aiSummary: "Under the new state policies, West Bengal expects over INR 10,000 crores in IT and manufacturing investments, creating up to 50,000 jobs.",
        tags: ["West Bengal", "Industrialization", "IT Sector", "Employment"],
        keyPoints: [
          "New investment proposals worth INR 10,000 crores in IT and manufacturing.",
          "Major plans to transform Rajarhat-New Town into a premier tech hub.",
          "Simplified business setup with the single-window clearance system."
        ]
      },
      hi: {
        title: "पश्चिम बंगाल में औद्योगिकीकरण की नई लहर: आईटी और विनिर्माण क्षेत्र में भारी निवेश की संभावना",
        description: "राज्य सरकार की हालिया पहलों के बाद पश्चिम बंगाल के आईटी और विनिर्माण क्षेत्रों में नए निवेश की प्रक्रिया शुरू हो गई है।",
        content: "पश्चिम बंगाल सरकार के उद्योग और वाणिज्य विभाग ने बताया है कि आगामी वित्तीय वर्ष में आईटी और विनिर्माण क्षेत्रों में लगभग 10,000 करोड़ रुपये के निवेश के प्रस्ताव मिले हैं। राजारहाट-न्यू टाउन क्षेत्र को भारत के प्रमुख प्रौद्योगिकी केंद्रों में से एक में बदलने के लिए विशेष आर्थिक नीतियों की घोषणा की गई है। विश्लेषकों का मानना है कि सिंगल-विंडो क्लीयरेंस सिस्टम से व्यापार स्थापित करना आसान हो जाएगा। इस औद्योगिक लहर से लगभग 50,000 रोजगार के अवसर पैदा होने की उम्मीद है।",
        aiSummary: "नई सरकारी नीतियों के तहत, पश्चिम बंगाल में आईटी और विनिर्माण क्षेत्र में लगभग 10,000 करोड़ रुपये के नए निवेश की संभावना है, जिससे भारी रोजगार पैदा होगा।",
        tags: ["पश्चिम बंगाल", "औद्योगिकीकरण", "आईटी क्षेत्र", "रोजगार"],
        keyPoints: [
          "आईटी और विनिर्माण क्षेत्र में 10,000 करोड़ रुपये के नए निवेश प्रस्ताव।",
          "राजारहाट-न्यू टाउन को प्रमुख टेक हब के रूप में विकसित करने की योजना।",
          "नए सिंगल-विंडो सिस्टम से उद्योगों की स्थापना आसान होगी।"
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
      },
      en: {
        title: "Fact Check: Viral Moon Photos are Synthesized with AI, Truth Revealed",
        description: "Analyzing the viral photo circulating on social media showing a human in an Indian spacesuit on the lunar surface.",
        content: "Recently, an image went viral on social media claiming that Indian astronauts have landed on the moon and are standing with the national flag. The image has been shared by hundreds of thousands of users. Our 'The Bengali Pedia' Fact Check team conducted a detailed investigation. Forensic image analysis and metadata inspection revealed that this image is fully generated by artificial intelligence (Generative AI). Mismatches in the fingers and lighting shadows were identified, which are typical flaws of AI generation. Furthermore, ISRO officially clarified that no manned missions have been sent to the moon yet. Therefore, the viral claim is completely false and misleading.",
        aiSummary: "A viral photo of an Indian astronaut on the moon is actually AI-generated. ISRO confirmed that no manned lunar missions have taken place yet.",
        tags: ["Fact Check", "Misinformation", "Artificial Intelligence", "ISRO", "Moon Mission"],
        keyPoints: [
          "The viral image is generated by AI, not a real photograph.",
          "Shadow mismatches and irregular finger shapes reveal AI generation.",
          "ISRO confirmed no Indian astronauts are currently present on the moon."
        ]
      },
      hi: {
        title: "तथ्य जाँच: एआई द्वारा बनाई गई वायरल तस्वीर से फैला भ्रम, सामने आया सच",
        description: "सोशल मीडिया पर वायरल हो रही चंद्रमा की सतह पर भारतीय स्पेससूट पहने व्यक्ति की तस्वीर का सच विश्लेषण।",
        content: "हाल ही में, सोशल मीडिया पर एक तस्वीर वायरल हुई जिसमें दावा किया जा रहा है कि भारतीय अंतरिक्ष यात्री चंद्रमा पर उतरे हैं और राष्ट्रीय ध्वज के साथ खड़े हैं। इस तस्वीर को लाखों लोगों ने साझा किया है। 'द बंगाली पीडिया' फैक्ट चेक टीम ने इस पर गहन शोध किया। फोरेंसिक इमेज विश्लेषण और मेटाडेटा जांच से पता चला कि यह तस्वीर पूरी तरह से कृत्रिम बुद्धिमत्ता (Generative AI) द्वारा बनाई गई है। तस्वीर में उंगलियों और परछाइयों में असंगतियाँ पाई गईं, जो एआई जनित चित्रों की मुख्य कमियाँ हैं। इसके अलावा, इसरो (ISRO) ने आधिकारिक तौर पर स्पष्ट किया है कि वर्तमान में चंद्रमा पर कोई भारतीय अंतरिक्ष यात्री नहीं भेजा गया है। इसलिए, वायरल दावा पूरी तरह से झूठा और भ्रामक है।",
        aiSummary: "चाँद पर भारतीय अंतरिक्ष यात्री की वायरल फोटो वास्तव में एआई द्वारा बनाई गई है। इसरो ने पुष्टि की है कि अभी तक कोई मानवयुक्त चंद्र मिशन नहीं हुआ है।",
        tags: ["तथ्य जाँच", "भ्रामक खबर", "कृत्रिम बुद्धिमत्ता", "इसरो", "चंद्र मिशन"],
        keyPoints: [
          "वायरल तस्वीर जनरेटिव एआई द्वारा निर्मित है, कोई वास्तविक फोटो नहीं है।",
          "परछाइयों की विसंगति और उंगलियों के आकार से एआई की पहचान हुई।",
          "इसरो ने पुष्टि की है कि चंद्रमा पर वर्तमान में कोई भारतीय अंतरिक्ष यात्री नहीं है।"
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

    // Sanitize any articles having '[অনুবাদ]' tags or related to Bangladesh
    if (parsed.articles) {
      let madeChanges = false;
      const initialLength = parsed.articles.length;

      // Filter out Bangladesh-related articles by keywords, domains, and sources
      const BANGLADESH_DOMAINS = [
        "bd-pratidin.com",
        "prothomalo.com",
        "bdnews24.com",
        "banglanews24.com",
        "jagonews24.com",
        "jugantor.com",
        "samakal.com",
        "ittefaq.com",
        "kalbela.com",
        "somoynews.tv",
        "channelionline.com",
        "rtvonline.com",
        "thedailystar.net",
        "dhakatribune.com",
        "tbsnews.net",
        "independent24.tv",
        "amadershomoy.com",
        "nayadiganta.com",
        "manabzamin.com",
        "bhorerkagoj.com",
        "dainikshiksha.com",
        "inqilab.com",
        "deshrupantor.com",
        "risingbd.com",
        "banglatribune.com",
        "dhakapost.com",
        "daily-sun.com",
        "unb.com.bd",
        "bssnews.net",
        "kalerkantho.com"
      ];

      const blockList = ["bangladesh", "বাংলাদেশ", "dhaka", "ঢাকা", "hasina", "হাসিনা", "khaleda", "খালেদা", "sheikh hasina", "শেখ হাসিনা"];
      parsed.articles = parsed.articles.filter(a => {
        const titleText = (a.title || "").toLowerCase();
        const descText = (a.description || "").toLowerCase();
        const contentText = (a.content || "").toLowerCase();
        const lowerUrl = (a.url || "").toLowerCase();
        const lowerSource = (a.sourceName || "").toLowerCase();
        
        const matchesBlock = blockList.some(term => 
          titleText.includes(term) || 
          descText.includes(term) || 
          contentText.includes(term)
        );

        const hasBdDomain = BANGLADESH_DOMAINS.some(domain => lowerUrl.includes(domain));
        const hasBdSuffix = lowerUrl.includes(".bd/") || lowerUrl.endsWith(".bd");
        const hasBdSource = lowerSource.includes("bangladesh") || lowerSource.includes("dhaka") || lowerSource.includes("bd-") || lowerSource.includes("prothom alo") || lowerSource.includes("somoy");

        return !(matchesBlock || hasBdDomain || hasBdSuffix || hasBdSource);
      });

      if (parsed.articles.length !== initialLength) {
        madeChanges = true;
      }

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

      // Save cleaned DB back if we found and stripped any tags or removed articles
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
