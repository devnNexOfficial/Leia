const rawSiteUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
  "https://www.leiacosmetics.store";

// Ensure https only and strip any trailing slash
export const siteUrl: string = rawSiteUrl.replace(/\/+$/, "").replace(/^http:\/\//, "https://");

export const siteName: string = "Leia Cosmetics";

export const defaultTitle: string = "LÉÏA Cosmetics — Authentic Luxury Cosmetics Online Store";

export const defaultDescription: string =
  "Shop authentic luxury cosmetics, radiant foundations, botanical serums, and high-pigment palettes from LEIA Pakistan. Express nationwide delivery.";

export const defaultOgImage: string = `${siteUrl}/og-image.jpg`;

export const siteConfig = {
  siteUrl,
  siteName,
  defaultTitle,
  defaultDescription,
  defaultOgImage,
  social: {
    instagram: "https://www.instagram.com/leiacosmetics",
    twitter: "@LeiaCosmetics",
  },
} as const;

/**
 * Helper to build an absolute canonical URL from a pathname.
 */
export function getCanonicalUrl(path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/" || cleanPath === "") {
    return siteUrl;
  }
  return `${siteUrl}${cleanPath.replace(/\/+$/, "")}`;
}
