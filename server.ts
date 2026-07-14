import express, { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { getDb, writeDb, addLog, getStats } from "./server/db";
import { fetchAndProcessNews, startAutoFetchScheduler, translateAndEnrichArticle, healDatabase } from "./server/newsService";
import { Article, Language, Comment } from "./src/types";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "bengali-pedia-super-secret-key-2026";

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Request logs
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api/admin/logs") && req.path.startsWith("/api")) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // JWT Middleware
  const authenticateToken = (req: Request | any, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }
    
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Token is invalid or expired" });
      }
      req.admin = decoded;
      next();
    });
  };

  // ----------------------------------------------------
  // PUBLIC ARTICLE ENDPOINTS
  // ----------------------------------------------------

  // Fetch articles with search, language resolution, category, and limit filtering
  app.get("/api/articles", (req: Request, res: Response) => {
    try {
      const { lang = "bn", category, search, tag, featured, trending, breaking, limit = 20, page = 1, isFactCheck } = req.query;
      const targetLang = lang as Language;
      
      const db = getDb();
      let list = db.articles.filter(a => a.status === "published");

      // Filter by language verification if targetLang is 'bn', 'hi', or 'en'
      if (targetLang === "bn") {
        list = list.filter(a => {
          const t = a.translations["bn"];
          return (
            t &&
            /[\u0980-\u09FF]/.test(t.title) &&
            !t.title.includes("[অনুবাদ প্রক্রিয়াধীন]") &&
            !t.title.includes("[Translation Pending]") &&
            !t.title.includes("[अनुवाद प्रक्रियाधीन]")
          );
        });
      } else if (targetLang === "hi") {
        list = list.filter(a => {
          const t = a.translations["hi"];
          return (
            t &&
            /[\u0900-\u097F]/.test(t.title) &&
            !/[\u0980-\u09FF]/.test(t.title) &&
            !t.title.includes("[অনুবাদ প্রক্রিয়াধীন]") &&
            !t.title.includes("[Translation Pending]") &&
            !t.title.includes("[अनुवाद प्रक्रियाधीन]")
          );
        });
      } else if (targetLang === "en") {
        list = list.filter(a => {
          const t = a.translations["en"];
          return (
            t &&
            /[a-zA-Z]/.test(t.title) &&
            !/[\u0980-\u09FF]/.test(t.title) &&
            !/[\u0900-\u097F]/.test(t.title) &&
            !t.title.includes("[অনুবাদ প্রক্রিয়াধীন]") &&
            !t.title.includes("[Translation Pending]") &&
            !t.title.includes("[अनुवाद प्रक्रियाधीन]")
          );
        });
      }

      // Filter by category
      if (category) {
        list = list.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
      }

      // Filter by tag
      if (tag) {
        list = list.filter(a => a.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
      }

      // Filter by fact check status
      if (isFactCheck !== undefined) {
        const isFactCheckBool = isFactCheck === "true";
        list = list.filter(a => a.isFactCheck === isFactCheckBool);
      }

      // Filter by featured
      if (featured === "true") {
        list = list.filter(a => a.isFeatured);
      }

      // Filter by trending
      if (trending === "true") {
        list = list.filter(a => a.isTrending);
      }

      // Filter by breaking
      if (breaking === "true") {
        list = list.filter(a => a.isBreaking);
      }

      // Search filters (checks title, description, content in original OR requested translation)
      if (search) {
        const queryStr = (search as string).toLowerCase();
        list = list.filter(a => {
          const t = a.translations[targetLang] || a.translations["bn"];
          return (
            t.title.toLowerCase().includes(queryStr) ||
            t.description.toLowerCase().includes(queryStr) ||
            t.content.toLowerCase().includes(queryStr) ||
            a.category.toLowerCase().includes(queryStr) ||
            a.tags.some(tg => tg.toLowerCase().includes(queryStr))
          );
        });
      }

      // Calculate pagination
      const total = list.length;
      const parsedPage = parseInt(page as string, 10) || 1;
      const parsedLimit = parseInt(limit as string, 10) || 20;
      const startIndex = (parsedPage - 1) * parsedLimit;
      const paginatedList = list.slice(startIndex, startIndex + parsedLimit);

      // Map translations to top level properties based on target language
      const resolvedList = paginatedList.map(a => {
        const translation = a.translations[targetLang] || a.translations["bn"];
        return {
          ...a,
          title: translation.title,
          description: translation.description,
          content: translation.content,
          aiSummary: translation.aiSummary,
          tags: translation.tags || a.tags,
          keyPoints: translation.keyPoints || []
        };
      });

      res.json({
        articles: resolvedList,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single article by ID
  app.get("/api/articles/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { lang = "bn" } = req.query;
      const targetLang = lang as Language;

      const db = getDb();
      const article = db.articles.find(a => a.id === id);

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const translation = article.translations[targetLang] || article.translations["bn"];
      const resolved = {
        ...article,
        title: translation.title,
        description: translation.description,
        content: translation.content,
        aiSummary: translation.aiSummary,
        tags: translation.tags || article.tags,
        keyPoints: translation.keyPoints || []
      };

      res.json(resolved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Upvote/Like an article
  app.post("/api/articles/:id/like", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const db = getDb();
      const index = db.articles.findIndex(a => a.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: "Article not found" });
      }

      db.articles[index].likes += 1;
      writeDb(db);
      res.json({ success: true, likes: db.articles[index].likes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Increment article view count
  app.post("/api/articles/:id/view", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const db = getDb();
      const index = db.articles.findIndex(a => a.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: "Article not found" });
      }

      db.articles[index].views += 1;
      writeDb(db);
      res.json({ success: true, views: db.articles[index].views });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get comments for an article
  app.get("/api/articles/:id/comments", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const db = getDb();
      const comments = db.comments.filter(c => c.articleId === id);
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add comment to an article
  app.post("/api/articles/:id/comments", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { authorName, content } = req.body;

      if (!authorName || !content) {
        return res.status(400).json({ error: "Author name and content are required" });
      }

      const db = getDb();
      const articleExists = db.articles.some(a => a.id === id);
      
      if (!articleExists) {
        return res.status(404).json({ error: "Article not found" });
      }

      const newComment: Comment = {
        id: `com-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        articleId: id,
        authorName: authorName.substring(0, 100),
        content: content.substring(0, 1000),
        publishedAt: new Date().toISOString(),
        likes: 0
      };

      db.comments.push(newComment);
      writeDb(db);
      res.json(newComment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Advanced search and filters
  app.get("/api/search/advanced", (req: Request, res: Response) => {
    try {
      const { lang = "bn", category, startDate, endDate, keywords, author } = req.query;
      const targetLang = lang as Language;
      
      const db = getDb();
      let list = db.articles.filter(a => a.status === "published");

      // Filter by language verification if targetLang is 'bn', 'hi', or 'en'
      if (targetLang === "bn") {
        list = list.filter(a => {
          const t = a.translations["bn"];
          return (
            t &&
            /[\u0980-\u09FF]/.test(t.title) &&
            !t.title.includes("[অনুবাদ প্রক্রিয়াধীন]") &&
            !t.title.includes("[Translation Pending]") &&
            !t.title.includes("[अनुवाद प्रक्रियाधीन]")
          );
        });
      } else if (targetLang === "hi") {
        list = list.filter(a => {
          const t = a.translations["hi"];
          return (
            t &&
            /[\u0900-\u097F]/.test(t.title) &&
            !/[\u0980-\u09FF]/.test(t.title) &&
            !t.title.includes("[অনুবাদ প্রক্রিয়াধীন]") &&
            !t.title.includes("[Translation Pending]") &&
            !t.title.includes("[अनुवाद प्रक्रियाधीन]")
          );
        });
      } else if (targetLang === "en") {
        list = list.filter(a => {
          const t = a.translations["en"];
          return (
            t &&
            /[a-zA-Z]/.test(t.title) &&
            !/[\u0980-\u09FF]/.test(t.title) &&
            !/[\u0900-\u097F]/.test(t.title) &&
            !t.title.includes("[অনুবাদ প্রক্রিয়াধীন]") &&
            !t.title.includes("[Translation Pending]") &&
            !t.title.includes("[अनुवाद प्रक्रियाधीन]")
          );
        });
      }

      if (category) {
        list = list.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
      }
      if (author) {
        list = list.filter(a => a.author.toLowerCase().includes((author as string).toLowerCase()));
      }
      if (startDate) {
        list = list.filter(a => new Date(a.publishedAt) >= new Date(startDate as string));
      }
      if (endDate) {
        list = list.filter(a => new Date(a.publishedAt) <= new Date(endDate as string));
      }
      if (keywords) {
        const queryStr = (keywords as string).toLowerCase();
        list = list.filter(a => {
          const t = a.translations[targetLang] || a.translations["bn"];
          return (
            t.title.toLowerCase().includes(queryStr) ||
            t.description.toLowerCase().includes(queryStr) ||
            t.content.toLowerCase().includes(queryStr) ||
            a.tags.some(tg => tg.toLowerCase().includes(queryStr))
          );
        });
      }

      const resolved = list.map(a => {
        const translation = a.translations[targetLang] || a.translations["bn"];
        return {
          ...a,
          title: translation.title,
          description: translation.description,
          content: translation.content,
          aiSummary: translation.aiSummary,
          tags: translation.tags || a.tags,
          keyPoints: translation.keyPoints || []
        };
      });

      res.json(resolved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // ----------------------------------------------------
  // ADMIN & AUTH ENDPOINTS
  // ----------------------------------------------------

  // Admin login with hashed credentials validation
  app.post("/api/admin/login", (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const db = getDb();

      if (username === "admin" && bcrypt.compareSync(password, db.adminHash)) {
        const token = jwt.sign({ username: "admin", role: "administrator" }, JWT_SECRET, { expiresIn: "24h" });
        addLog("info", "Administrator logged in successfully.", "Admin Auth");
        return res.json({ token, username: "admin", role: "administrator" });
      }

      addLog("warning", `Unauthorized admin login attempt for username: "${username}"`, "Admin Auth");
      res.status(401).json({ error: "Invalid username or password" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Admin dashboard metrics (auth required)
  app.get("/api/admin/stats", authenticateToken, (req: Request, res: Response) => {
    try {
      const stats = getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all articles including drafts/scheduled (auth required)
  app.get("/api/admin/articles", authenticateToken, (req: Request, res: Response) => {
    try {
      const db = getDb();
      res.json(db.articles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create customized article manually (auth required)
  app.post("/api/admin/articles", authenticateToken, async (req: Request, res: Response) => {
    try {
      const articleData: Partial<Article> & { autoTranslate?: boolean } = req.body;
      const db = getDb();

      if (!articleData.title || !articleData.content || !articleData.category) {
        return res.status(400).json({ error: "Title, content and category are required" });
      }

      const id = `art-custom-${Date.now()}`;
      
      let finalTranslations: any = articleData.translations || {};

      // If translations are missing and Auto Translate is requested, invoke Gemini!
      if (articleData.autoTranslate && process.env.GEMINI_API_KEY) {
        addLog("info", `Initiating Gemini auto-translation for new manual article "${articleData.title}"...`, "Admin AI");
        const enriched = await translateAndEnrichArticle(
          articleData.title,
          articleData.description || "",
          articleData.content,
          articleData.language || "bn",
          articleData.category
        );
        if (enriched) {
          finalTranslations = enriched.translations;
        }
      }

      // Ensure base translation structures exist fallback
      if (!finalTranslations.bn) {
        finalTranslations.bn = {
          title: articleData.title,
          description: articleData.description || "",
          content: articleData.content,
          aiSummary: articleData.description || "",
          tags: articleData.tags || [],
          keyPoints: []
        };
      }
      if (!finalTranslations.en) {
        finalTranslations.en = {
          title: articleData.title,
          description: articleData.description || "",
          content: articleData.content,
          aiSummary: articleData.description || "",
          tags: articleData.tags || [],
          keyPoints: []
        };
      }
      if (!finalTranslations.hi) {
        finalTranslations.hi = {
          title: articleData.title,
          description: articleData.description || "",
          content: articleData.content,
          aiSummary: articleData.description || "",
          tags: articleData.tags || [],
          keyPoints: []
        };
      }

      const newArticle: Article = {
        id,
        title: finalTranslations.bn.title,
        description: finalTranslations.bn.description,
        content: finalTranslations.bn.content,
        category: articleData.category,
        publishedAt: articleData.publishedAt || new Date().toISOString(),
        author: articleData.author || "সম্পাদক",
        image: articleData.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
        sourceName: "The Bengali Pedia Editorial",
        language: "bn",
        translations: finalTranslations,
        isFeatured: !!articleData.isFeatured,
        isTrending: !!articleData.isTrending,
        isBreaking: !!articleData.isBreaking,
        views: 0,
        likes: 0,
        readingTime: articleData.readingTime || 3,
        status: articleData.status || "published",
        tags: articleData.tags || [],
        isFactCheck: !!articleData.isFactCheck,
        factCheckRating: articleData.factCheckRating,
        factCheckExplanation: articleData.factCheckExplanation
      };

      db.articles.unshift(newArticle);
      writeDb(db);
      addLog("info", `Manual article added successfully: "${newArticle.title}"`, "Admin Console");
      res.status(201).json(newArticle);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update an article (auth required)
  app.put("/api/admin/articles/:id", authenticateToken, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: Partial<Article> = req.body;
      const db = getDb();
      const idx = db.articles.findIndex(a => a.id === id);

      if (idx === -1) {
        return res.status(404).json({ error: "Article not found" });
      }

      db.articles[idx] = {
        ...db.articles[idx],
        ...updateData,
        // Make sure it doesn't overwrite core fields critically
        id: db.articles[idx].id
      };

      writeDb(db);
      addLog("info", `Article updated successfully: "${db.articles[idx].title}"`, "Admin Console");
      res.json(db.articles[idx]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete article completely (auth required)
  app.delete("/api/admin/articles/:id", authenticateToken, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const db = getDb();
      const idx = db.articles.findIndex(a => a.id === id);

      if (idx === -1) {
        return res.status(404).json({ error: "Article not found" });
      }

      const deletedTitle = db.articles[idx].title;
      db.articles.splice(idx, 1);
      
      // Clean up comments related to this article
      db.comments = db.comments.filter(c => c.articleId !== id);

      writeDb(db);
      addLog("info", `Article and associated comments deleted: "${deletedTitle}"`, "Admin Console");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get current system logs (auth required)
  app.get("/api/admin/logs", authenticateToken, (req: Request, res: Response) => {
    try {
      const db = getDb();
      res.json(db.logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Clear system logs (auth required)
  app.post("/api/admin/logs/clear", authenticateToken, (req: Request, res: Response) => {
    try {
      const db = getDb();
      db.logs = [{ id: "log-clear", timestamp: new Date().toISOString(), level: "info", message: "Logs cleared by administrator." }];
      writeDb(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get current system settings (auth required)
  app.get("/api/admin/settings", authenticateToken, (req: Request, res: Response) => {
    try {
      const db = getDb();
      res.json(db.settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update system settings & restart scheduler if interval changes (auth required)
  app.put("/api/admin/settings", authenticateToken, (req: Request, res: Response) => {
    try {
      const db = getDb();
      const previousInterval = db.settings.autoFetchIntervalMinutes;
      const previousEnabled = db.settings.isAutoFetchEnabled;
      const previousGnewsKey = db.settings.gnewsApiKey;
      const previousGeminiKey = db.settings.geminiApiKey;

      db.settings = {
        ...db.settings,
        ...req.body
      };

      writeDb(db);
      addLog("info", "Website configuration settings updated by administrator.", "Admin Console");

      const keysChanged = previousGnewsKey !== db.settings.gnewsApiKey || previousGeminiKey !== db.settings.geminiApiKey;

      // Reactivate scheduler dynamically if settings change
      if (
        previousInterval !== db.settings.autoFetchIntervalMinutes ||
        previousEnabled !== db.settings.isAutoFetchEnabled ||
        keysChanged
      ) {
        startAutoFetchScheduler();

        // Trigger immediate background news aggregation if keys changed or scheduler was enabled
        if (keysChanged || (db.settings.isAutoFetchEnabled && !previousEnabled)) {
          addLog("info", "Triggering immediate background news fetch following configuration updates...", "Scheduler");
          fetchAndProcessNews().catch((err) => {
            addLog("error", `Configuration auto-fetch failed: ${err.message}`, "Scheduler");
          });
        }
      }

      res.json(db.settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Change Admin Password (auth required)
  app.put("/api/admin/change-password", authenticateToken, (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      const db = getDb();
      if (!bcrypt.compareSync(currentPassword, db.adminHash)) {
        return res.status(400).json({ error: "Incorrect current password" });
      }

      const salt = bcrypt.genSaltSync(10);
      db.adminHash = bcrypt.hashSync(newPassword, salt);
      writeDb(db);

      addLog("info", "Administrator password successfully changed.", "Admin Console");
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Force manual GNews API integration pull immediately (auth required)
  app.post("/api/admin/settings/force-fetch", authenticateToken, async (req: Request, res: Response) => {
    try {
      addLog("info", "Manual news pull requested by Administrator.", "Admin Console");
      const newlyAdded = await fetchAndProcessNews();
      res.json({ success: true, newlyAdded });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Database Backup download (auth required)
  app.get("/api/admin/database/backup", authenticateToken, (req: Request, res: Response) => {
    try {
      const db = getDb();
      res.setHeader("Content-Disposition", "attachment; filename=bengali-pedia-backup.json");
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(db, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Database Restore uploading (auth required)
  app.post("/api/admin/database/restore", authenticateToken, (req: Request, res: Response) => {
    try {
      const uploadedDb = req.body;
      if (!uploadedDb.articles || !uploadedDb.settings || !uploadedDb.adminHash) {
        return res.status(400).json({ error: "Invalid database structure uploaded" });
      }

      writeDb(uploadedDb);
      addLog("info", "Database successfully restored from administrator backup file.", "Admin Console");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // ON-THE-FLY GEMINI AI POWERED HELPERS (For Admin manual authoring)
  // ----------------------------------------------------

  // Translate a custom content
  app.post("/api/admin/ai/translate", authenticateToken, async (req: Request, res: Response) => {
    const { title, description, content, sourceLang = "en" } = req.body;
    try {
      const enriched = await translateAndEnrichArticle(
        title || "",
        description || "",
        content || "",
        sourceLang as Language,
        "Current Affairs"
      );
      if (enriched) {
        res.json(enriched);
      } else {
        res.status(500).json({ error: "Gemini failed to translate" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Summary generator
  app.post("/api/admin/ai/summary", authenticateToken, async (req: Request, res: Response) => {
    const { text, lang = "bn" } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY not set" });
      }
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Read the following news content and generate a highly professional 2-sentence summary in language code "${lang}". Content:\n\n${text}`
      });
      res.json({ summary: response.text?.trim() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Headline generator
  app.post("/api/admin/ai/headline", authenticateToken, async (req: Request, res: Response) => {
    const { keyword, lang = "bn" } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY not set" });
      }
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Based on the keywords "${keyword}", generate exactly 5 catchy, sensational, click-friendly journalistic news headlines in language code "${lang}". Return them as a clean bulleted list.`
      });
      res.json({ headlines: response.text?.trim() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // ----------------------------------------------------
  // SEO ENDPOINTS (Sitemap, RSS, robots.txt)
  // ----------------------------------------------------

  // robots.txt
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    const domain = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    res.send(`User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /admin

Sitemap: ${domain}/sitemap.xml
`);
  });

  // sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    try {
      const db = getDb();
      const domain = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const articles = db.articles.filter(a => a.status === "published");

      res.type("application/xml");
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
`;

      articles.forEach(art => {
        xml += `  <url>
    <loc>${domain}/article/${art.id}</loc>
    <lastmod>${new Date(art.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      });

      xml += `</urlset>`;
      res.send(xml);
    } catch (err: any) {
      res.status(500).send(`<error>${err.message}</error>`);
    }
  });

  // RSS Feed XML (/feed.xml or /rss)
  const rssHandler = (req: Request, res: Response) => {
    try {
      const db = getDb();
      const domain = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const articles = db.articles.filter(a => a.status === "published").slice(0, 20);

      res.type("application/xml");
      let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Bengali Pedia</title>
  <link>${domain}</link>
  <description>The Premier Multilingual Geopolitical, Political, and Technology News Portal for West Bengal and India</description>
  <language>bn</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${domain}/rss" rel="self" type="application/rss+xml" />
`;

      articles.forEach(art => {
        xml += `  <item>
    <title><![CDATA[${art.title}]]></title>
    <link>${domain}/article/${art.id}</link>
    <guid>${domain}/article/${art.id}</guid>
    <pubDate>${new Date(art.publishedAt).toUTCString()}</pubDate>
    <description><![CDATA[${art.description}]]></description>
    <author><![CDATA[${art.author}]]></author>
    <category><![CDATA[${art.category}]]></category>
  </item>\n`;
      });

      xml += `</channel>\n</rss>`;
      res.send(xml);
    } catch (err: any) {
      res.status(500).send(`<error>${err.message}</error>`);
    }
  };

  app.get("/rss", rssHandler);
  app.get("/feed.xml", rssHandler);


  // ----------------------------------------------------
  // VITE & STATIC FILE SERVING
  // ----------------------------------------------------
  if (process.env.DISABLE_HMR === "true" || process.env.NODE_ENV === "production") {
    // Production / Static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development mode with Vite Dev Server Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  // Error boundary response
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("[Express Core Error]", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Start server
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server started successfully on port ${PORT}`);
    
    // Automatically repair any corrupted or missing translations on launch
    try {
      await healDatabase();
    } catch (err: any) {
      console.error("Failed to run database healing routine:", err);
    }

    // Boot up the news service automatic fetch scheduler
    startAutoFetchScheduler();
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to start full-stack server:", err);
});
