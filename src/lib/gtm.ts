declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const GTM_ID: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GTM_ID) || "";

/**
 * Push an arbitrary event object to the dataLayer.
 * Safe to call on client or server; no-ops if GTM_ID is not set or not in browser.
 */
export function pushToDataLayer(data: Record<string, unknown>) {
  if (typeof window === "undefined" || !GTM_ID) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/**
 * Push a standard "page_view" event to dataLayer on route changes.
 */
export function trackPageView(pagePath?: string) {
  if (typeof window === "undefined" || !GTM_ID) return;
  pushToDataLayer({
    event: "page_view",
    page_path: pagePath || window.location.pathname + window.location.search,
    page_title: typeof document !== "undefined" ? document.title : "",
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });
}
