import { GoogleGenAI, Type } from "@google/genai";
import { getDb, writeDb, addLog } from "./db";
import { Article, Language, ArticleTranslation } from "../src/types";

// Initialize Gemini SDK with telemetry header as specified in skill documentation
let aiClient: GoogleGenAI | null = null;
let activeGeminiKey = "";

function getAiClient(): GoogleGenAI | null {
  const db = getDb();
  const apiKey = db.settings.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!aiClient || activeGeminiKey !== apiKey) {
    activeGeminiKey = apiKey;
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Map GNews queries to target categories
const CATEGORIES = [
  "Geopolitics",
  "Indian Politics",
  "West Bengal Politics",
  "Current Affairs",
  "Technology",
  "Economy",
  "International Relations",
  "Defence",
  "Science",
  "AI",
  "Business",
  "Fact Check",
  "Editorial",
  "Sports",
  "Entertainment",
  "World",
  "Education",
  "Jobs",
  "Cybersecurity",
  "Environment"
];

export function detectCategoryLocally(title: string, desc: string): string {
  const text = `${title || ""} ${desc || ""}`.toLowerCase();
  
  if (
    text.includes("west bengal") || 
    text.includes("kolkata") || 
    text.includes("mamata") || 
    text.includes("tmc") || 
    text.includes("bengal politics") ||
    text.includes("bengal governance") ||
    text.includes("darjeeling") ||
    text.includes("sundarbans")
  ) {
    return "West Bengal Politics";
  }
  if (
    text.includes("modi") || 
    text.includes("bjp") || 
    text.includes("congress") || 
    text.includes("parliament") || 
    text.includes("elections india") || 
    text.includes("indian politics") ||
    text.includes("delhi") ||
    text.includes("amit shah") ||
    text.includes("lok sabha")
  ) {
    return "Indian Politics";
  }
  if (
    text.includes("cyber") || 
    text.includes("hack") || 
    text.includes("security breach") || 
    text.includes("ransomware") || 
    text.includes("phishing") || 
    text.includes("malware")
  ) {
    return "Cybersecurity";
  }
  if (
    text.includes("defense") || 
    text.includes("defence") || 
    text.includes("military") || 
    text.includes("army") || 
    text.includes("navy") || 
    text.includes("air force") || 
    text.includes("missile") || 
    text.includes("drdo") || 
    text.includes("border dispute")
  ) {
    return "Defence";
  }
  if (
    text.includes("geopolitics") || 
    text.includes("quad ") || 
    text.includes("diplomacy") || 
    text.includes("bilateral") || 
    text.includes("summit") ||
    text.includes("g20") ||
    text.includes("border tension") ||
    text.includes("foreign policy")
  ) {
    return "Geopolitics";
  }
  if (
    text.includes("artificial intelligence") || 
    text.includes(" ai ") || 
    text.includes("openai") || 
    text.includes("chatgpt") || 
    text.includes("gemini") || 
    text.includes("deep learning") ||
    text.includes("llm") ||
    text.includes("neural network")
  ) {
    return "AI";
  }
  if (
    text.includes("tech") || 
    text.includes("software") || 
    text.includes("gadget") || 
    text.includes("smartphone") || 
    text.includes("digital transition") || 
    text.includes("silicon") ||
    text.includes("semiconductor") ||
    text.includes("telecom")
  ) {
    return "Technology";
  }
  if (
    text.includes("economy") || 
    text.includes("gdp") || 
    text.includes("inflation") || 
    text.includes("rupee") || 
    text.includes("finance") || 
    text.includes("fiscal") ||
    text.includes("budget") ||
    text.includes("rbi") ||
    text.includes("interest rate")
  ) {
    return "Economy";
  }
  if (
    text.includes("business") || 
    text.includes("startup") || 
    text.includes("market") || 
    text.includes("stock") || 
    text.includes("company") || 
    text.includes("acquisition") ||
    text.includes("investor") ||
    text.includes("ipo")
  ) {
    return "Business";
  }
  if (
    text.includes("science") || 
    text.includes("space") || 
    text.includes("nasa") || 
    text.includes("isro") || 
    text.includes("physics") || 
    text.includes("chemistry") ||
    text.includes("laboratory") ||
    text.includes("astronomy")
  ) {
    return "Science";
  }
  if (
    text.includes("climate") || 
    text.includes("environment") || 
    text.includes("pollution") || 
    text.includes("forest") || 
    text.includes("renewable") ||
    text.includes("global warming") ||
    text.includes("solar power") ||
    text.includes("ecology")
  ) {
    return "Environment";
  }
  if (
    text.includes("sports") || 
    text.includes("cricket") || 
    text.includes("football") || 
    text.includes("olympic") || 
    text.includes("match") || 
    text.includes("cup") || 
    text.includes("athletics") ||
    text.includes("ipl")
  ) {
    return "Sports";
  }
  if (
    text.includes("entertainment") || 
    text.includes("movie") || 
    text.includes("bollywood") || 
    text.includes("actor") || 
    text.includes("cinema") || 
    text.includes("singer") ||
    text.includes("tollywood") ||
    text.includes("celebrity")
  ) {
    return "Entertainment";
  }
  if (
    text.includes("education") || 
    text.includes("school") || 
    text.includes("university") || 
    text.includes("exam") || 
    text.includes("syllabus") ||
    text.includes("student")
  ) {
    return "Education";
  }
  if (
    text.includes("job") || 
    text.includes("recruitment") || 
    text.includes("vacancy") || 
    text.includes("career") ||
    text.includes("hiring")
  ) {
    return "Jobs";
  }
  if (
    text.includes("fact check") || 
    text.includes("fake news") || 
    text.includes("debunk") || 
    text.includes("fact-check") ||
    text.includes("misinformation")
  ) {
    return "Fact Check";
  }
  if (
    text.includes("international relations") || 
    text.includes("united nations") || 
    text.includes(" global alliance ") ||
    text.includes("foreign relations") ||
    text.includes("treaty")
  ) {
    return "International Relations";
  }
  if (
    text.includes("editorial") ||
    text.includes("opinion") ||
    text.includes("analysis piece") ||
    text.includes("columnist")
  ) {
    return "Editorial";
  }
  
  return "Current Affairs";
}

// Fallback high-quality local generator when both GNews and Gemini are unavailable
function generateMockArticle(query: string, index: number): Article {
  const id = `mock-${Date.now()}-${index}`;
  const nowStr = new Date().toISOString();
  
  const titles: Record<Language, string> = {
    bn: `প্রযুক্তি এবং অর্থনৈতিক উন্নয়ন: ভারতের নতুন প্রবৃদ্ধি নিয়ে বিশেষ রিপোর্ট (${query})`
  };

  const desc: Record<Language, string> = {
    bn: "ভারতের প্রযুক্তি খাত এবং সাম্প্রতিক অর্থনৈতিক সংস্কারের ফলে প্রবৃদ্ধি বৃদ্ধির রূপরেখা।"
  };

  const cont: Record<Language, string> = {
    bn: "প্রযুক্তিগত অগ্রগতি ভারতের অর্থনীতিকে বিশ্ব দরবারে নতুন উচ্চতায় নিয়ে যাচ্ছে। কলকাতা, ব্যাঙ্গালোর এবং দিল্লির মতো প্রধান কেন্দ্রগুলোতে এআই প্রযুক্তির প্রসার বাড়ছে। সাম্প্রতিক সমীক্ষা অনুযায়ী, এই প্রযুক্তিগত উন্নয়ন কর্মসংস্থান ও গ্রামীণ অর্থনীতিতে ইতিবাচক প্রভাব ফেলছে।"
  };

  return {
    id,
    title: titles.bn,
    description: desc.bn,
    content: cont.bn,
    category: CATEGORIES[index % CATEGORIES.length],
    publishedAt: nowStr,
    author: "স্টাফ রিপোর্টার",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    sourceName: "Bengali Pedia Local Desk",
    language: "bn",
    translations: {
      bn: {
        title: titles.bn,
        description: desc.bn,
        content: cont.bn,
        aiSummary: "ভারতের প্রযুক্তি ও আর্থিক নীতিসমূহের কারণে জাতীয় প্রবৃদ্ধিতে ব্যাপক রূপান্তর দেখা যাচ্ছে।",
        tags: ["প্রযুক্তি", "অর্থনীতি", "ভারত"],
        keyPoints: ["কলকাতা ও ব্যাঙ্গালোরে নতুন টেক করিডোর গঠন।", "এআই প্রযুক্তির ব্যবহার ব্যাপক বৃদ্ধি পেয়েছে।"]
      }
    },
    isFeatured: false,
    isTrending: index === 0,
    isBreaking: false,
    views: Math.floor(Math.random() * 200) + 10,
    likes: Math.floor(Math.random() * 50) + 2,
    readingTime: 3,
    status: "published",
    tags: ["Tech", "Economy", "India"],
    isFactCheck: false
  };
}

// Generate Bengali content using Gemini 3.5 Flash
export async function translateAndEnrichArticle(
  sourceTitle: string,
  sourceDesc: string,
  sourceContent: string,
  originalLanguage: string,
  fallbackCategory?: string
): Promise<{
  translations: Record<Language, ArticleTranslation>;
  category: string;
  tags: string[];
  readingTime: number;
} | null> {
  const ai = getAiClient();
  if (!ai) {
    return null;
  }

  try {
    const prompt = `
You are an expert news translator and editor for "The Bengali Pedia".
Your task is to take this source article and translate/enrich it into high-quality, professional, and journalistic Bengali (bn).

ORIGINAL LANGUAGE: ${originalLanguage}
SOURCE TITLE: ${sourceTitle}
SOURCE DESCRIPTION: ${sourceDesc}
SOURCE CONTENT: ${sourceContent}

Perform the following tasks:
1. Translate the Title, Description, and Content accurately into Bengali (bn). Ensure the tone is high-quality, professional, and journalistic.
2. Select the single best matching category from this list: ${CATEGORIES.join(", ")}. If none match, use "${fallbackCategory || "Current Affairs"}".
3. Generate 3 to 5 smart tags/keywords in Bengali.
4. Generate a 2-sentence AI-powered Summary in Bengali.
5. Extract 3 high-impact Key Points in Bengali.
6. Calculate a reasonable Reading Time (in minutes) based on article length.

Respond strictly in the JSON schema requested.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            readingTime: { type: Type.NUMBER },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            translations: {
              type: Type.OBJECT,
              properties: {
                bn: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    content: { type: Type.STRING },
                    aiSummary: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "description", "content", "aiSummary", "tags", "keyPoints"]
                }
              },
              required: ["bn"]
            }
          },
          required: ["category", "readingTime", "tags", "translations"]
        }
      }
    });

    const jsonText = response.text?.trim() || "";
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error: any) {
    addLog("error", `AI Enriching failed: ${error.message}`, "Gemini API");
    return null;
  }
}

// Fetch news either from GNews or generate using Gemini
export async function fetchAndProcessNews(): Promise<number> {
  const db = getDb();
  const apiKey = db.settings.gnewsApiKey || process.env.GNEWS_API_KEY;
  const ai = getAiClient();

  addLog("info", "Starting GNews aggregation cycle...", "News Service");

  // Define queries based on Bengal & Indian Geopolitical context in Bengali and English
  const queries = [
    "পশ্চিমবঙ্গ রাজনীতি",
    "ভারত কূটনীতি ভূরাজনীতি",
    "ভারতীয় প্রযুক্তি স্টার্টআপ এআই",
    "ভারত প্রতিরক্ষা অর্থনীতি"
  ];

  let fetchedArticles: any[] = [];

  if (apiKey) {
    try {
      const q = '"West Bengal" OR "Kolkata" OR "পশ্চিমবঙ্গ" OR "কলকাতা" OR "ভারত" OR "রাজনীতি"';
      addLog("info", `Querying GNews API with combined broad topics in Bengali: "${q}"...`, "GNews API");
      
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=bn&max=10&apikey=${apiKey}`
      );
      
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          fetchedArticles = data.articles;
          addLog("info", `GNews API returned ${fetchedArticles.length} articles.`, "GNews API");
        } else {
          addLog("warning", "GNews API returned zero articles. Checking fallback...", "GNews API");
        }
      } else {
        const errText = await res.text();
        addLog("error", `GNews API failed with code ${res.status}: ${errText}`, "GNews API");
      }
    } catch (error: any) {
      addLog("error", `GNews API connection failed: ${error.message}`, "GNews API");
    }
  }

  // If GNews API key is missing or failed, and Gemini is available, use Gemini to create realistic articles in Bengali!
  if (fetchedArticles.length === 0 && ai) {
    try {
      addLog("info", "Using Gemini API to synthesize fresh world news in Bengali...", "Gemini AI");
      const categoryHint = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const synthPrompt = `
      You are acting as a real-time international GNews aggregator for "The Bengali Pedia".
      Generate a list of 4 highly realistic, engaging, professional, and up-to-date journalistic articles about India, West Bengal, and global geopolitics/technology.
      Avoid duplicating existing topics. Ensure topics feel extremely real and current.
      Focus topics around: West Bengal development, Indian governance, Global diplomacy, or New AI research in India.
      Include a realistic image URL from Unsplash matching the topic, a realistic author name, and source name.
      
      CRITICAL REQUIREMENTS:
      1. All text fields (title, description, content, author, sourceName, category) MUST be written in high-quality, professional, and natural Bengali (bn).
      2. STICK STRICTLY TO WEST BENGAL & INDIAN TOPICS. DO NOT generate any articles or content related to Bangladesh under any circumstances.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: synthPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                content: { type: Type.STRING },
                author: { type: Type.STRING },
                sourceName: { type: Type.STRING },
                image: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["title", "description", "content", "author", "sourceName", "image", "category"]
            }
          }
        }
      });

      const jsonText = response.text?.trim() || "";
      const synthList = JSON.parse(jsonText);
      if (Array.isArray(synthList)) {
        fetchedArticles = synthList.map((art, index) => ({
          title: art.title,
          description: art.description,
          content: art.content,
          url: `https://gnews-simulated.com/article-${Date.now()}-${index}`,
          image: art.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: art.sourceName, url: "https://gnews.io" },
          author: art.author,
          categoryHint: art.category
        }));
        addLog("info", `Gemini synthesized ${fetchedArticles.length} realistic articles successfully.`, "Gemini AI");
      }
    } catch (err: any) {
      addLog("error", `Gemini synthesis failed: ${err.message}`, "Gemini AI");
    }
  }

  // If both failed, use static mock generator
  if (fetchedArticles.length === 0) {
    addLog("warning", "GNews & Gemini both unavailable. Generating static fallback seed news.", "News Service");
    fetchedArticles = [
      generateMockArticle("Global Tech", 1),
      generateMockArticle("Strategic Economy", 2)
    ];
  }

  // Now process fetched articles: avoid duplicates, enrich and translate via Gemini, save to DB
  let newlyAddedCount = 0;
  for (const rawArt of fetchedArticles) {
    // Check for Bangladesh filter exclusion
    const titleText = (rawArt.title || "").toLowerCase();
    const descText = (rawArt.description || "").toLowerCase();
    const contentText = (rawArt.content || "").toLowerCase();
    const blockList = ["bangladesh", "বাংলাদেশ", "dhaka", "ঢাকা", "hasina", "হাসিনা", "khaleda", "খালেদা", "sheikh hasina", "শেখ হাসিনা"];
    const matchesBlock = blockList.some(term => 
      titleText.includes(term) || 
      descText.includes(term) || 
      contentText.includes(term)
    );

    if (matchesBlock) {
      addLog("info", `Skipping/Filtering out Bangladesh-related article: "${rawArt.title}"`, "News Service");
      continue;
    }

    // Check for title duplicate
    const isDuplicate = db.articles.some(
      existing => 
        existing.title.toLowerCase() === rawArt.title.toLowerCase() ||
        (existing.url && rawArt.url && existing.url === rawArt.url)
    );

    if (isDuplicate) {
      continue;
    }

    // Call translation & enrichment
    let processedTranslations: Record<Language, ArticleTranslation> | null = null;
    let selectedCategory = rawArt.categoryHint || detectCategoryLocally(rawArt.title, rawArt.description || rawArt.content);
    let selectedTags: string[] = ["Global", "India"];
    let readingTime = 3;

    if (db.settings.enableAiTranslation && ai) {
      const enriched = await translateAndEnrichArticle(
        rawArt.title,
        rawArt.description,
        rawArt.content || rawArt.description,
        "bn",
        selectedCategory
      );

      if (enriched) {
        processedTranslations = enriched.translations;
        selectedCategory = enriched.category;
        selectedTags = enriched.tags;
        readingTime = enriched.readingTime;
      }
    }

    // Default translations if AI was disabled or failed
    if (!processedTranslations) {
      processedTranslations = {
        bn: {
          title: rawArt.title,
          description: rawArt.description,
          content: rawArt.content || rawArt.description,
          aiSummary: "এআই সারাংশ বর্তমানে উপলব্ধ নয়।",
          tags: ["সংবাদ"],
          keyPoints: ["এই সংবাদটির অনুবাদ বর্তমানে প্রক্রিয়াধীন রয়েছে।"]
        }
      };
    }

    // Construct final Article object
    const finalArticle: Article = {
      id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: processedTranslations.bn.title, // Default is Bengali
      description: processedTranslations.bn.description,
      content: processedTranslations.bn.content,
      category: selectedCategory,
      publishedAt: rawArt.publishedAt || new Date().toISOString(),
      author: rawArt.author || "স্টাফ রিপোর্টার",
      url: rawArt.url,
      image: rawArt.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
      sourceName: rawArt.source?.name || rawArt.sourceName || "The Bengali Pedia",
      language: "bn",
      translations: processedTranslations,
      isFeatured: false,
      isTrending: Math.random() > 0.6,
      isBreaking: newlyAddedCount === 0 && Math.random() > 0.5, // Make first item breaking sometimes
      views: Math.floor(Math.random() * 80) + 5,
      likes: Math.floor(Math.random() * 15) + 1,
      readingTime,
      status: "published",
      tags: selectedTags,
      isFactCheck: false
    };

    // Insert to the top of articles
    db.articles.unshift(finalArticle);
    newlyAddedCount++;
  }

  if (newlyAddedCount > 0) {
    writeDb(db);
    addLog("info", `Successfully added ${newlyAddedCount} new articles to the system.`, "News Service");
  } else {
    addLog("info", "No new unique articles discovered during this cycle.", "News Service");
  }

  return newlyAddedCount;
}

// Background scheduler runner
let schedulerInterval: NodeJS.Timeout | null = null;

export function startAutoFetchScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  const db = getDb();
  if (!db.settings.isAutoFetchEnabled) {
    addLog("warning", "Auto-fetch scheduler is disabled in settings.", "Scheduler");
    return;
  }

  const ms = db.settings.autoFetchIntervalMinutes * 60 * 1000;
  addLog("info", `Auto-fetch scheduler started. Running every ${db.settings.autoFetchIntervalMinutes} minutes.`, "Scheduler");
  
  // Run once immediately on startup asynchronously
  fetchAndProcessNews().catch(err => {
    addLog("error", `Initial boot fetch failed: ${err.message}`, "Scheduler");
  });

  schedulerInterval = setInterval(() => {
    fetchAndProcessNews().catch(err => {
      addLog("error", `Background fetch failed: ${err.message}`, "Scheduler");
    });
  }, ms);
}
