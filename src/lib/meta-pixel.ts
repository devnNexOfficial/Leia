export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Contact";

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
}

type QueuedBrowserPixelEvent = {
  eventName: MetaEventName;
  customData?: MetaCustomData;
  eventId: string;
  enqueuedAt: number;
};

const browserPixelQueue: QueuedBrowserPixelEvent[] = [];
let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL_MS = 200;
const MAX_QUEUE_AGE_MS = 10_000; // 10 seconds timeout

function flushBrowserPixelQueue() {
  if (typeof window === "undefined") return;
  const win = window as unknown as {
    fbq?: (action: string, event: string, params?: unknown, opts?: { eventID: string }) => void;
  };

  if (typeof win.fbq === "function") {
    while (browserPixelQueue.length > 0) {
      const item = browserPixelQueue.shift();
      if (item) {
        if (Date.now() - item.enqueuedAt <= MAX_QUEUE_AGE_MS) {
          try {
            win.fbq("track", item.eventName, item.customData, { eventID: item.eventId });
          } catch {
            // Swallow execution errors
          }
        } else {
          console.warn(
            `[Meta Pixel] Dropped queued browser event "${item.eventName}" (eventID: ${item.eventId}) after 10s timeout without window.fbq`,
          );
        }
      }
    }
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  } else {
    // Check and drop any expired events while fbq is still not available
    const now = Date.now();
    while (browserPixelQueue.length > 0 && now - browserPixelQueue[0].enqueuedAt > MAX_QUEUE_AGE_MS) {
      const expired = browserPixelQueue.shift();
      if (expired) {
        console.warn(
          `[Meta Pixel] Dropped queued browser event "${expired.eventName}" (eventID: ${expired.eventId}) after 10s timeout without window.fbq`,
        );
      }
    }
    if (browserPixelQueue.length === 0 && pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }
}

/**
 * Dispatches a dual Meta Pixel (browser window.fbq) + Conversions API (server /api/meta-capi)
 * event using an identical event_id for automatic deduplication in Meta Events Manager.
 */
export function trackMetaEvent(
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

  // 1. Browser Pixel via window.fbq (fires immediately or queues + polls every 200ms up to 10s)
  try {
    const win = window as unknown as {
      fbq?: (action: string, event: string, params?: unknown, opts?: { eventID: string }) => void;
    };
    if (typeof win.fbq === "function") {
      win.fbq("track", eventName, customData, { eventID: eventId });
    } else {
      browserPixelQueue.push({
        eventName,
        customData,
        eventId,
        enqueuedAt: Date.now(),
      });
      if (!pollTimer) {
        pollTimer = setInterval(flushBrowserPixelQueue, POLL_INTERVAL_MS);
      }
    }
  } catch {
    // Swallow browser pixel errors silently
  }

  // 2. Server CAPI via /api/meta-capi with keepalive: true (never blocks UI or checkout)
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
      }),
    }).catch(() => {
      // Swallowed silently
    });
  } catch {
    // Swallowed silently
  }

  return eventId;
}
