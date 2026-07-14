import React from "react";
import { Article, Language } from "../types";

interface TickerProps {
  articles: Article[];
  language: Language;
  onSelectArticle: (id: string) => void;
}

export function BreakingTicker({ articles, language, onSelectArticle }: TickerProps) {
  const breakingList = articles.filter(a => a.isBreaking);

  if (breakingList.length === 0) return null;

  const labels = {
    bn: "ব্রেকিং নিউজ"
  };

  return (
    <div className="bg-red-600 text-white flex items-center h-10 border-b border-red-700/10 relative overflow-hidden text-xs sm:text-sm z-30 px-4 sm:px-8">
      {/* Live Indicator */}
      <div className="bg-white text-red-600 text-[10px] font-black px-2.5 py-0.5 rounded-full mr-4 uppercase whitespace-nowrap tracking-wider shadow-sm flex items-center space-x-1.5 flex-shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
        </span>
        <span>{labels[language]}</span>
      </div>

      {/* Marquee Content */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="flex space-x-12 animate-[marquee_25s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer">
          {breakingList.concat(breakingList).map((art, idx) => (
            <button
              key={`${art.id}-${idx}`}
              onClick={() => onSelectArticle(art.id)}
              className="text-white hover:text-red-100 transition font-medium focus:outline-none flex items-center space-x-2 text-xs sm:text-sm"
            >
              <span className="text-red-200">✦</span>
              <span>{art.title}</span>
              <span className="text-[9px] bg-red-700 text-red-100 px-1.5 py-0.5 rounded-full ml-2 font-mono uppercase font-bold">
                {art.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
