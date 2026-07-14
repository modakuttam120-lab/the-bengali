import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Eye, ThumbsUp, Calendar, User, Bookmark, Share2, Sparkles, 
  Send, ShieldCheck, AlertTriangle, CheckCircle, Info, Heart, Copy, Check 
} from "lucide-react";
import { Article, Comment, Language } from "../types";
import { handleImageLoadError } from "../utils/imageFallback";

interface ViewProps {
  articleId: string;
  language: Language;
  onBack: () => void;
  onSelectArticle: (id: string) => void;
  allArticles: Article[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  fontSizeClass: string;
}

const LOCALIZED_LABELS = {
  by: { bn: "অনুলিখন:" },
  published: { bn: "প্রকাশিত:" },
  aiSummary: { bn: "কৃত্রিম বুদ্ধিমত্তা (AI) বিশ্লেষিত সারাংশ" },
  keyTakeaways: { bn: "মূল আকর্ষণসমূহ" },
  verdict: { bn: "ফ্যাক্ট চেক সিদ্ধান্ত" },
  commentsHeader: { bn: "মন্তব্যসমূহ" },
  noComments: { bn: "প্রথম মন্তব্যকারী হোন!" },
  placeholderName: { bn: "আপনার নাম..." },
  placeholderComment: { bn: "আপনার মন্তব্যটি লিখুন..." },
  submitComment: { bn: "মন্তব্য পোস্ট করুন" },
  relatedArticles: { bn: "সম্পর্কিত খবর" },
  copied: { bn: "লিঙ্ক কপি করা হয়েছে!" },
  share: { bn: "শেয়ার করুন" }
};

/*
const LOCALIZED_LABELS_OLD = {
  by: { bn: "অনুলিখন:", en: "By", hi: "द्वारा" },
  published: { bn: "প্রকাশিত:", en: "Published:", hi: "प्रकाशित:" },
  aiSummary: { bn: "কৃত্রিম বুদ্ধিমত্তা (AI) বিশ্লেষিত সারাংশ", en: "AI Generated Analytical Summary", hi: "कृत्रिम बुद्धिमत्ता (AI) विश्लेषित सारांश" },
  keyTakeaways: { bn: "মূল আকর্ষণসমূহ", en: "Key Takeaways", hi: "मुख्य बिंदु" },
  verdict: { bn: "ফ্যাক্ট চেক সিদ্ধান্ত", en: "Fact Check Verdict", hi: "तथ्य जाँच परिणाम" },
  commentsHeader: { bn: "মন্তব্যসমূহ", en: "Comments", hi: "टिप्पणियाँ" },
  noComments: { bn: "প্রথম মন্তব্যকারী হোন!", en: "Be the first to comment!", hi: "पहले टिप्पणीकार बनें!" },
  placeholderName: { bn: "আপনার নাম...", en: "Your name...", hi: "आपका नाम..." },
  placeholderComment: { bn: "আপনার মন্তব্যটি লিখুন...", en: "Write your comment...", hi: "अपनी टिप्पणी लिखें..." },
  submitComment: { bn: "মন্তব্য পোস্ট করুন", en: "Post Comment", hi: "टिप्पणी पोस्ट करें" },
  relatedArticles: { bn: "সম্পর্কিত খবর", en: "Related News", hi: "संबंधित समाचार" },
  copied: { bn: "লিঙ্ক কপি করা হয়েছে!", en: "Link Copied!", hi: "लिंक कॉपी हो गया!" },
  share: { bn: "শেয়ার করুন", en: "Share", hi: "साझा करें" }
};

*/
const RATING_STYLING = {
  true: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle, label: { bn: "সত্য" } },
  false: { bg: "bg-red-50 text-red-800 border-red-200", icon: AlertTriangle, label: { bn: "মিথ্যা" } },
  misleading: { bg: "bg-amber-50 text-amber-800 border-amber-200", icon: Info, label: { bn: "বিভ্রান্তিকর" } },
  "half-true": { bg: "bg-blue-50 text-blue-800 border-blue-200", icon: Info, label: { bn: "আংশিক সত্য" } }
};

export function ArticleView({
  articleId,
  language,
  onBack,
  onSelectArticle,
  allArticles,
  isBookmarked,
  onToggleBookmark,
  fontSizeClass
}: ViewProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch article detail, views increment, and comments on mount/ID change
  useEffect(() => {
    setLoading(true);
    setIsLiked(false);
    
    // View count increment API call
    fetch(`/api/articles/${articleId}/view`, { method: "POST" }).catch(() => {});

    // Get article translation properties
    fetch(`/api/articles/${articleId}?lang=${language}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setArticle(data);
          setLocalLikes(data.likes);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch comments
    fetch(`/api/articles/${articleId}/comments`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setComments(data);
        }
      })
      .catch(err => console.error(err));
  }, [articleId, language]);

  // Handle article liking
  const handleLike = async () => {
    if (isLiked) return;
    try {
      const res = await fetch(`/api/articles/${articleId}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLocalLikes(data.likes);
        setIsLiked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Comments
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentContent.trim()) return;

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: commentName, content: commentContent })
      });
      const data = await res.json();
      if (!data.error) {
        setComments(prev => [...prev, data]);
        setCommentContent("");
        setCommentName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger quick clipboard URL copy
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading content...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-950">Article Not Found</h2>
        <button onClick={onBack} className="text-red-600 font-bold hover:underline">
          Go back to homepage
        </button>
      </div>
    );
  }

  // Related articles filtration
  const relatedArticles = allArticles
    .filter(a => a.id !== articleId && (a.category === article.category))
    .slice(0, 3);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "bn-BD",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans space-y-8 animate-[fadeIn_0.3s_ease-out]" id="article-detail">
      {/* Navigation & Controls header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-red-600 font-bold text-sm bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex items-center space-x-3.5 mt-2 sm:mt-0">
          {/* Like Indicator */}
          <button
            onClick={handleLike}
            disabled={isLiked}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${
              isLiked 
                ? "bg-blue-50 border-blue-200 text-blue-600" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{localLikes}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${
              isBookmarked 
                ? "bg-red-600 border-red-700 text-white hover:bg-red-700" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            <span>Save</span>
          </button>

          {/* Social Share Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? LOCALIZED_LABELS.copied[language] : LOCALIZED_LABELS.share[language]}</span>
          </button>
        </div>
      </div>

      {/* Main Core Header & Metadata */}
      <div className="space-y-4">
        <span className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
          {article.category}
        </span>
        <h1 className="text-2xl sm:text-3.5xl md:text-4xl font-black text-slate-900 leading-tight">
          {article.title}
        </h1>

        {/* Metadata subline */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-500 font-mono">
          <span className="flex items-center space-x-1.5">
            <User className="w-4 h-4 text-red-500" />
            <span className="font-sans font-semibold text-slate-700">
              {LOCALIZED_LABELS.by[language]} {article.author}
            </span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{article.views} views</span>
          </span>
        </div>
      </div>

      {/* Hero Featured Image */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[250px] sm:h-[400px] w-full bg-slate-50">
        <img
          src={article.image}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => handleImageLoadError(e, article.category)}
        />
      </div>

      {/* AI summaries Section (Glassmorphism layout) */}
      {article.aiSummary && (
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-400/5 rounded-full blur-xl" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-indigo-400/5 rounded-full blur-xl" />
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="uppercase text-xs font-black font-sans">{LOCALIZED_LABELS.aiSummary[language]}</span>
          </div>
          <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
            {article.aiSummary}
          </p>
        </div>
      )}

      {/* Key Takeaways list */}
      {article.keyPoints && article.keyPoints.length > 0 && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{LOCALIZED_LABELS.keyTakeaways[language]}</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
            {article.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start space-x-2.5">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-xs">
                  {index + 1}
                </span>
                <span className="font-medium leading-relaxed text-slate-800">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Core Article Body Content */}
      <div className={`prose max-w-none text-slate-800 leading-relaxed border-b border-slate-200 pb-8 ${fontSizeClass}`}>
        {article.content.split("\n\n").map((para, i) => para.trim() && (
          <p key={i} className="mb-4">
            {para}
          </p>
        ))}
      </div>

      {/* Fact-Checking rating verdict card */}
      {article.isFactCheck && article.factCheckRating && (
        (() => {
          const ratingData = RATING_STYLING[article.factCheckRating] || RATING_STYLING.misleading;
          const RatingIcon = ratingData.icon;
          return (
            <div className={`border rounded-2xl p-6 ${ratingData.bg}`}>
              <div className="flex items-center space-x-3 pb-3 border-b border-current/10">
                <RatingIcon className="w-7 h-7" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider opacity-60">
                    {LOCALIZED_LABELS.verdict[language]}
                  </h4>
                  <p className="text-xl font-extrabold">
                    {ratingData.label[language]}
                  </p>
                </div>
              </div>
              {article.factCheckExplanation && (
                <p className="text-sm font-medium leading-relaxed pt-4">
                  {article.factCheckExplanation}
                </p>
              )}
            </div>
          );
        })()
      )}

      {/* Dynamic User Comments Section */}
      <div className="space-y-6 pt-4" id="comments">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          💬 {LOCALIZED_LABELS.commentsHeader[language]} ({comments.length})
        </h3>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-slate-400 text-sm italic py-4">
            {LOCALIZED_LABELS.noComments[language]}
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((com) => (
              <div key={com.id} className="bg-slate-50/40 border border-slate-100 p-4 rounded-2xl flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm uppercase">
                  {com.authorName.slice(0, 2)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900">{com.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(com.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {com.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment submit form */}
        <form onSubmit={handleCommentSubmit} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder={LOCALIZED_LABELS.placeholderName[language]}
              className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 pl-4 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600"
            />
          </div>
          <textarea
            required
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder={LOCALIZED_LABELS.placeholderComment[language]}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 pl-4 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow flex items-center space-x-2 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{LOCALIZED_LABELS.submitComment[language]}</span>
          </button>
        </form>
      </div>

      {/* Related articles carousel */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
            🔗 {LOCALIZED_LABELS.relatedArticles[language]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((art) => {
              const trans = art.translations[language] || art.translations["bn"];
              return (
                <div 
                  key={art.id}
                  onClick={() => onSelectArticle(art.id)}
                  className="bg-white border border-slate-200 hover:border-red-600 p-4 rounded-2xl shadow-sm hover:shadow cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-red-600 font-mono">
                      {art.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {trans.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-3 font-mono">
                    {new Date(art.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
