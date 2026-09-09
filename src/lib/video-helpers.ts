export type VideoSourceType = "youtube" | "instagram" | "facebook" | "direct";

export type VideoSourceInfo = {
  type: VideoSourceType;
  embedUrl: string;
  thumbnailUrl: string;
  videoId?: string;
  badgeLabel: string;
};

/**
 * Detects the provider type from a video URL (YouTube, Instagram, Facebook, or Direct video file)
 * and returns embed-friendly URL, thumbnail, and badge label.
 */
export function getVideoSourceInfo(url: string, customThumbnail?: string | null): VideoSourceInfo {
  const cleanUrl = (url || "").trim();

  if (!cleanUrl) {
    return {
      type: "direct",
      embedUrl: "",
      thumbnailUrl: customThumbnail || "",
      badgeLabel: "REEL",
    };
  }

  // 1. YouTube link detection (watch, shorts, embed, or short link youtu.be)
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: customThumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      badgeLabel: "YOUTUBE",
    };
  }

  // 2. Instagram link detection (/reel/CODE or /p/CODE)
  const igMatch = cleanUrl.match(/(?:instagram\.com|instagr\.am)\/(?:reel|p)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const shortcode = igMatch[1];
    return {
      type: "instagram",
      videoId: shortcode,
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
      thumbnailUrl: customThumbnail || "",
      badgeLabel: "INSTAGRAM",
    };
  }

  // 3. Facebook video link detection
  const isFb = /(?:facebook\.com|fb\.watch)/i.test(cleanUrl);
  if (isFb) {
    const encodedUrl = encodeURIComponent(cleanUrl);
    return {
      type: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=true`,
      thumbnailUrl: customThumbnail || "",
      badgeLabel: "FACEBOOK",
    };
  }

  // 4. Fallback to direct video file
  return {
    type: "direct",
    embedUrl: cleanUrl,
    thumbnailUrl: customThumbnail || "",
    badgeLabel: "REEL",
  };
}
