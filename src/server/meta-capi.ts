import { z } from "zod";

const ALLOWED_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Contact",
] as const;

const userDataSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    external_id: z.string().max(128).optional(),
  })
  .strict()
  .optional();

const contentItemSchema = z
  .object({
    id: z.string(),
    quantity: z.number().optional(),
    item_price: z.number().optional(),
  })
  .strict();

const customDataSchema = z
  .object({
    value: z.number().optional(),
    currency: z.string().optional(),
    content_ids: z.array(z.string()).optional(),
    content_type: z.string().optional(),
    contents: z.array(contentItemSchema).optional(),
    num_items: z.number().optional(),
    order_id: z.string().optional(),
  })
  .strict()
  .optional();

export const metaCapiSchema = z
  .object({
    event_name: z.enum(ALLOWED_EVENTS),
    event_id: z.string().min(1).max(256),
    event_source_url: z
      .string()
      .url()
      .refine(
        (url) => {
          try {
            const parsed = new URL(url);
            const host = parsed.hostname.toLowerCase();
            return (
              host === "www.leiacosmetics.store" ||
              host === "leiacosmetics.store" ||
              host === "localhost" ||
              host === "127.0.0.1" ||
              host.endsWith(".vercel.app")
            );
          } catch {
            return false;
          }
        },
        { message: "event_source_url must be on an authorized domain" },
      ),
    user_data: userDataSchema,
    custom_data: customDataSchema,
    fbp: z.string().max(256).optional(),
    fbc: z.string().max(256).optional(),
  })
  .strict();

export type MetaCapiPayload = z.infer<typeof metaCapiSchema>;

// Rate limiting: maximum 60 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
    return false;
  }
  record.count += 1;
  return record.count > 60;
}

// SHA-256 helper using web standard crypto
async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((pair) => {
    const [name, ...rest] = pair.trim().split("=");
    if (name) {
      cookies[name] = decodeURIComponent(rest.join("="));
    }
  });
  return cookies;
}

function getClientIp(request: Request): string | undefined {
  // 1. Primary for Vercel & reverse proxies: first client IP in x-forwarded-for
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  // 2. Direct real IP fallback
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // 3. Cloudflare fallback
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return undefined;
}

function normalizePakistaniPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("03") && digits.length === 11) {
    digits = "92" + digits.slice(1);
  } else if (digits.startsWith("0092")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("3") && digits.length === 10) {
    digits = "92" + digits;
  }
  return digits;
}

let cachedFileEnv: Record<string, string> | null = null;

function parseEnvContent(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      let v = trimmed.slice(eqIdx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      result[k] = v;
    }
  }
  return result;
}

function getFileEnv(key: string): string | undefined {
  if (cachedFileEnv) return cachedFileEnv[key];
  cachedFileEnv = {};
  try {
    if (typeof process !== "undefined" && typeof process.cwd === "function") {
      const proc = (
        globalThis as unknown as {
          process?: {
            getBuiltinModule?: (m: string) => {
              existsSync: (p: string) => boolean;
              readFileSync: (p: string, enc: string) => string;
            };
          };
        }
      ).process;
      const fs = proc?.getBuiltinModule ? proc.getBuiltinModule("fs") : undefined;
      if (fs && typeof fs.readFileSync === "function") {
        for (const file of [".env.local", ".env"]) {
          try {
            const p = `${process.cwd()}/${file}`;
            if (fs.existsSync(p)) {
              const data = fs.readFileSync(p, "utf-8");
              Object.assign(cachedFileEnv, parseEnvContent(data));
            }
          } catch {
            // Ignore file read error
          }
        }
      }
    }
  } catch {
    // Ignore runtime error
  }
  return cachedFileEnv[key];
}

function getServerEnv(key: string, env?: unknown): string | undefined {
  if (env && typeof env === "object" && key in env) {
    const val = (env as Record<string, unknown>)[key];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    const val = process.env[key];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
  }
  return getFileEnv(key);
}

const MAX_BODY_BYTES = 32 * 1024; // 32KB body limit

export async function handleMetaCapi(request: Request, env?: unknown): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ ok: false, error: "Payload too large" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientIp = getClientIp(request);
  if (clientIp && isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ ok: false, error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  let bodyJson: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: "Payload too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
    bodyJson = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = metaCapiSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Validation error",
        issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const payload = parsed.data;

  // Feature flag: ENABLE_PAGEVIEW_CAPI (defaults to false)
  if (payload.event_name === "PageView") {
    const isPageViewCapiEnabled = getServerEnv("ENABLE_PAGEVIEW_CAPI", env) === "true";
    if (!isPageViewCapiEnabled) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Extract cookies (from Cookie header with fallback to client-sent fbp/fbc)
  const cookies = parseCookies(request.headers.get("cookie"));
  const fbp = cookies._fbp || payload.fbp;
  let fbc = cookies._fbc || payload.fbc;

  // Fallback: build fbc from fbclid if _fbc was not found
  if (!fbc) {
    try {
      const sourceUrl = new URL(payload.event_source_url);
      const fbclid = sourceUrl.searchParams.get("fbclid");
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    } catch {
      // Ignore URL parsing failure
    }
  }

  const userAgent = request.headers.get("user-agent") || undefined;

  // Build user_data according to Meta CAPI specification
  // Never hash client_ip_address, client_user_agent, fbp, or fbc
  const metaUserData: Record<string, unknown> = {
    client_ip_address: clientIp || undefined,
    client_user_agent: userAgent || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
  };

  // Hash customer identifiers across ALL events whenever provided
  if (payload.user_data) {
    let hasCustomerIdentifier = false;

    if (payload.user_data.email) {
      const trimmed = payload.user_data.email.trim().toLowerCase();
      if (trimmed) {
        metaUserData.em = [await sha256(trimmed)];
        hasCustomerIdentifier = true;
      }
    }

    if (payload.user_data.phone) {
      const normalizedPhone = normalizePakistaniPhone(payload.user_data.phone);
      if (normalizedPhone) {
        metaUserData.ph = [await sha256(normalizedPhone)];
        hasCustomerIdentifier = true;
      }
    }

    if (payload.user_data.first_name) {
      const trimmed = payload.user_data.first_name.trim().toLowerCase();
      if (trimmed) {
        metaUserData.fn = [await sha256(trimmed)];
        hasCustomerIdentifier = true;
      }
    }

    if (payload.user_data.last_name) {
      const trimmed = payload.user_data.last_name.trim().toLowerCase();
      if (trimmed) {
        metaUserData.ln = [await sha256(trimmed)];
        hasCustomerIdentifier = true;
      }
    }

    if (payload.user_data.city) {
      const trimmed = payload.user_data.city.trim().toLowerCase();
      if (trimmed) {
        metaUserData.ct = [await sha256(trimmed)];
        hasCustomerIdentifier = true;
      }
    }

    // external_id is allowed on every event (including anonymous)
    if (payload.user_data.external_id) {
      const trimmed = payload.user_data.external_id.trim();
      if (trimmed) {
        metaUserData.external_id = [await sha256(trimmed)];
      }
    }

    // Only add hashed country ("pk") when at least one customer identifier (em/ph/fn/ln/ct) was added
    if (hasCustomerIdentifier) {
      const countryCode = (payload.user_data.country || "pk").trim().toLowerCase();
      metaUserData.country = [await sha256(countryCode)];
    }
  }

  // Non-sensitive diagnostic log: booleans only, zero personal data or hashes
  console.log(
    `[Meta CAPI Dispatch] event=${payload.event_name} has_ip=${Boolean(metaUserData.client_ip_address)} has_ua=${Boolean(metaUserData.client_user_agent)} has_fbp=${Boolean(metaUserData.fbp)} has_fbc=${Boolean(metaUserData.fbc)} has_em=${Boolean(metaUserData.em)} has_external_id=${Boolean(metaUserData.external_id)}`,
  );

  const accessToken = getServerEnv("META_CAPI_ACCESS_TOKEN", env);
  const pixelId = getServerEnv("META_PIXEL_ID", env) || "2551859458621574";
  const testEventCode = getServerEnv("META_TEST_EVENT_CODE", env);

  if (!accessToken) {
    console.warn(
      "[Meta CAPI] Server access token not configured (META_CAPI_ACCESS_TOKEN is unset)",
    );
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventTime = Math.floor(Date.now() / 1000);

  const eventData: Record<string, unknown> = {
    event_name: payload.event_name,
    event_time: eventTime,
    action_source: "website",
    event_id: payload.event_id,
    event_source_url: payload.event_source_url,
    user_data: metaUserData,
  };

  if (payload.custom_data) {
    eventData.custom_data = payload.custom_data;
  }

  const metaRequestBody: Record<string, unknown> = {
    data: [eventData],
  };

  if (testEventCode) {
    metaRequestBody.test_event_code = testEventCode;
  }

  try {
    const metaResponse = await fetch(`https://graph.facebook.com/v22.0/${pixelId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(metaRequestBody),
    });

    if (!metaResponse.ok) {
      const errText = await metaResponse.text();
      // Log short error message without exposing token
      let errMsg = `HTTP ${metaResponse.status}`;
      try {
        const errObj = JSON.parse(errText) as { error?: { message?: string; type?: string } };
        if (errObj.error?.message) {
          errMsg += `: ${errObj.error.message}`;
        }
      } catch {
        errMsg += `: ${errText.slice(0, 100)}`;
      }
      console.error(`[Meta CAPI] Dispatch failed (${errMsg})`);
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(
      `[Meta CAPI] Network error: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
