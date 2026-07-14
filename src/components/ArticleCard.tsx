import React from "react";
import { Eye, ThumbsUp, Clock, Bookmark, Share2 } from "lucide-react";
import { Article, Language } from "../types";
import { handleImageLoadError } from "../utils/imageFallback";

interface CardProps {
  key?: string;
  article: Article;
  language: Language;
  onSelect: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Geopolitics": "bg-slate-50 text-slate-700 border-slate-200",
  "Indian Politics": "bg-slate-50 text-slate-700 border-slate-200",
  "West Bengal Politics": "bg-slate-50 text-slate-700 border-slate-200",
  "Current Affairs": "bg-slate-50 text-slate-700 border-slate-200",
  "Technology": "bg-slate-50 text-slate-700 border-slate-200",
  "Economy": "bg-slate-50 text-slate-700 border-slate-200",
  "Defence": "bg-slate-50 text-slate-700 border-slate-200",
  "Science": "bg-slate-50 text-slate-700 border-slate-200",
  "AI": "bg-slate-50 text-slate-700 border-slate-200",
  "Fact Check": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Editorial": "bg-slate-50 text-slate-700 border-slate-200"
};

const LOCALIZED_LABELS = {
  readTime: {
    bn: "মিনিট পড়া"
  },
  factCheckVerified: {
    bn: "যাচাইকৃত তথ্য"
  }
};

export function ArticleCard({ article, language, onSelect, isBookmarked, onToggleBookmark }: CardProps) {
  // Format dynamic dates cleanly
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "bn-BD",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const colorStyle = CATEGORY_COLORS[article.category] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <article 
      onClick={() => onSelect(article.id)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col cursor-pointer group h-full"
      id={`card-${article.id}`}
    >
      {/* Featured Image & Badge Overlay */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={article.image}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
          loading="lazy"
          onError={(e) => handleImageLoadError(e, article.category)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm ${colorStyle}`}>
            {article.category}
          </span>
          {article.isFactCheck && (
            <span className="bg-indigo-600 text-white border-indigo-700 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border shadow-sm flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{LOCALIZED_LABELS.factCheckVerified[language]}</span>
            </span>
          )}
        </div>

        {/* Bookmark Overlay Button */}
        <button
          onClick={(e) => onToggleBookmark(e, article.id)}
          className={`absolute top-3 right-3 p-1.5 rounded-full shadow-sm backdrop-blur-md transition cursor-pointer ${
            isBookmarked 
              ? "bg-red-600 text-white hover:bg-red-700" 
              : "bg-white/80 text-slate-700 hover:bg-white hover:text-red-600"
          }`}
          title="Save Article"
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Card Details & Typography */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Header Metadata */}
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
            <span className="text-red-600">{article.sourceName || "THE BENGALI PEDIA"}</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTime} {LOCALIZED_LABELS.readTime[language]}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-red-600 transition duration-200 line-clamp-2">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </div>

        {/* Footer Statistics */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold font-mono">
          <span>{formattedDate}</span>
          <div className="flex items-center space-x-3.5">
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.views}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
              <span>{article.likes}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
