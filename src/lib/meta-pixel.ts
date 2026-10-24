export type MetaEventName =
  "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | "Contact";

export interface MetaContentItem {
  id: string;
  quantity?: number;
  item_price?: number;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: MetaContentItem[];
  num_items?: number;
  order_id?: string;
}

export interface MetaUserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
}

function getClientCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Sends a Meta Conversions API event (server /api/meta-capi) and returns its event_id.
 * The browser Pixel is fired by GTM (GTM-5BFSK786); include the returned event_id in the
 * matching dataLayer push so the GTM Meta tag can use it as eventID for deduplication.
 */
export function sendMetaCapiEvent(
  eventName: MetaEventName,
  customData?: MetaCustomData,
  userData?: MetaUserData,
  eventIdOverride?: string,
): string | undefined {
  if (typeof window === "undefined") return undefined;

  const eventId =
    eventIdOverride ||
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Extract client-side Meta cookies as fallback for server CAPI
  const fbp = getClientCookie("_fbp");
  let fbc = getClientCookie("_fbc");
  if (!fbc && typeof window !== "undefined" && window.location.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get("fbclid");
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // Server CAPI via /api/meta-capi with keepalive: true (never blocks UI or checkout)
  try {
    fetch("/api/meta-capi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        user_data: userData,
        custom_data: customData,
        fbp,
        fbc,
      }),
    }).catch(() => {
      // Swallowed silently
    });
  } catch {
    // Swallowed silently
  }

  return eventId;
}
