import React from "react";

export const FALLBACK_IMAGES: Record<string, string> = {
  "Geopolitics": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
  "Indian Politics": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  "West Bengal Politics": "https://images.unsplash.com/photo-1588096344316-f5c9000cc5a2?auto=format&fit=crop&w=800&q=80",
  "Current Affairs": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
  "Technology": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "Economy": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
  "International Relations": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  "Defence": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
  "Science": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  "AI": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
  "Business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  "Fact Check": "https://images.unsplash.com/photo-1586339949916-3e9457bef613?auto=format&fit=crop&w=800&q=80",
  "Editorial": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
  "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
  "Entertainment": "https://images.unsplash.com/photo-1496337589254-7e19d01cedee?auto=format&fit=crop&w=800&q=80",
  "World": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "Education": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
  "Jobs": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "Environment": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
};

export const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

export function getFallbackImage(category?: string): string {
  if (!category) return DEFAULT_FALLBACK;
  return FALLBACK_IMAGES[category] || DEFAULT_FALLBACK;
}

export function handleImageLoadError(e: React.SyntheticEvent<HTMLImageElement, Event>, category?: string) {
  const target = e.currentTarget;
  const fallback = getFallbackImage(category);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
