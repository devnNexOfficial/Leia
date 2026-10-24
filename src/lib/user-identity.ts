export interface StoredIdentity {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
  external_id?: string;
}

const STORAGE_KEY_EXTERNAL_ID = "leia_external_id";
const STORAGE_KEY_SAVED_CHECKOUT = "leia_saved_checkout_customer";
const STORAGE_KEY_IDENTITY = "leia_identity";

/**
 * Returns a persistent pseudo-anonymous identifier.
 * Stored in localStorage under "leia_external_id".
 * Safe on server (SSR) and client; never throws.
 */
export function getExternalId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = localStorage.getItem(STORAGE_KEY_EXTERNAL_ID);
    if (existing && existing.trim()) {
      return existing.trim();
    }
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `ext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY_EXTERNAL_ID, newId);
    return newId;
  } catch {
    return undefined;
  }
}

/**
 * Returns stored customer identity merged from:
 * 1) "leia_saved_checkout_customer" (fields: email, phone, firstName, lastName, city)
 * 2) "leia_identity" (fields: email, phone, first_name, last_name, city)
 * "leia_identity" values take priority if both exist. Empty strings are ignored.
 */
export function getStoredIdentity(): StoredIdentity {
  if (typeof window === "undefined") return {};
  const identity: StoredIdentity = {};

  try {
    // 1. Read from saved checkout customer
    const rawCheckout = localStorage.getItem(STORAGE_KEY_SAVED_CHECKOUT);
    if (rawCheckout) {
      const parsed = JSON.parse(rawCheckout);
      if (typeof parsed === "object" && parsed !== null) {
        if (typeof parsed.email === "string" && parsed.email.trim()) {
          identity.email = parsed.email.trim();
        }
        if (typeof parsed.phone === "string" && parsed.phone.trim()) {
          identity.phone = parsed.phone.trim();
        }
        if (typeof parsed.firstName === "string" && parsed.firstName.trim()) {
          identity.first_name = parsed.firstName.trim();
        }
        if (typeof parsed.lastName === "string" && parsed.lastName.trim()) {
          identity.last_name = parsed.lastName.trim();
        }
        if (typeof parsed.city === "string" && parsed.city.trim()) {
          identity.city = parsed.city.trim();
        }
      }
    }
  } catch {
    // Ignore storage parse error
  }

  try {
    // 2. Read from leia_identity (takes priority)
    const rawIdentity = localStorage.getItem(STORAGE_KEY_IDENTITY);
    if (rawIdentity) {
      const parsed = JSON.parse(rawIdentity);
      if (typeof parsed === "object" && parsed !== null) {
        if (typeof parsed.email === "string" && parsed.email.trim()) {
          identity.email = parsed.email.trim();
        }
        if (typeof parsed.phone === "string" && parsed.phone.trim()) {
          identity.phone = parsed.phone.trim();
        }
        if (typeof parsed.first_name === "string" && parsed.first_name.trim()) {
          identity.first_name = parsed.first_name.trim();
        }
        if (typeof parsed.last_name === "string" && parsed.last_name.trim()) {
          identity.last_name = parsed.last_name.trim();
        }
        if (typeof parsed.city === "string" && parsed.city.trim()) {
          identity.city = parsed.city.trim();
        }
      }
    }
  } catch {
    // Ignore storage parse error
  }

  return identity;
}

/**
 * Merges the given partial fields into "leia_identity" in localStorage.
 * Ignores empty or undefined values. Safe on SSR; never throws.
 */
export function saveIdentity(partial: Partial<StoredIdentity>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredIdentity();
    const updated: StoredIdentity = { ...current };

    if (typeof partial.email === "string" && partial.email.trim()) {
      updated.email = partial.email.trim();
    }
    if (typeof partial.phone === "string" && partial.phone.trim()) {
      updated.phone = partial.phone.trim();
    }
    if (typeof partial.first_name === "string" && partial.first_name.trim()) {
      updated.first_name = partial.first_name.trim();
    }
    if (typeof partial.last_name === "string" && partial.last_name.trim()) {
      updated.last_name = partial.last_name.trim();
    }
    if (typeof partial.city === "string" && partial.city.trim()) {
      updated.city = partial.city.trim();
    }

    localStorage.setItem(STORAGE_KEY_IDENTITY, JSON.stringify(updated));
  } catch {
    // Ignore storage error
  }
}
