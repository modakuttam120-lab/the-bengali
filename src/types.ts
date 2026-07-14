export type Language = "bn" | "en" | "hi";

export interface ArticleTranslation {
  title: string;
  description: string;
  content: string;
  aiSummary?: string;
  tags?: string[];
  keyPoints?: string[];
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  publishedAt: string;
  author: string;
  url?: string; // GNews original URL
  image: string; // Featured image URL
  sourceName?: string;
  language: Language; // Default language of creation
  translations: Record<Language, ArticleTranslation>;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking: boolean;
  views: number;
  likes: number;
  readingTime: number; // in minutes
  status: "published" | "draft" | "scheduled";
  tags: string[];
  isFactCheck: boolean;
  factCheckRating?: "true" | "false" | "misleading" | "half-true";
  factCheckExplanation?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  publishedAt: string;
  likes: number;
}

export interface Bookmark {
  id: string;
  articleId: string;
  savedAt: string;
}

export interface AppSettings {
  gnewsApiKey: string;
  geminiApiKey: string;
  autoFetchIntervalMinutes: number;
  isAutoFetchEnabled: boolean;
  enableAiSummary: boolean;
  enableAiTranslation: boolean;
  seoMetaTitleTemplate: string;
  seoMetaDescriptionTemplate: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  context?: string;
}

export interface DashboardStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  fetchedToday: number;
  categoryBreakdown: Record<string, number>;
  viewsHistory: { date: string; views: number }[];
}
