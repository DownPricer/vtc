"use client";

type TelemetryEventType =
  | "page_view"
  | "calculator_opened"
  | "calculator_started"
  | "calculator_quote_displayed"
  | "form_validation_error"
  | "click_reserver"
  | "click_devis"
  | "click_contact"
  | "click_phone"
  | "click_email"
  | "click_payment"
  | "contact_form_started"
  | "booking_form_started"
  | "quote_form_started";

const CONSENT_KEY = "vtc_consent_analytics";
const VISITOR_KEY = "vtc_visitor_id";
const SESSION_KEY = "vtc_session_id";

function randId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function getTenantId(): string {
  return (process.env.NEXT_PUBLIC_TENANT_ID || "default").trim() || "default";
}

function baseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
  return raw || "https://api.sitereadyshd.fr";
}

function getRuntimeLocation(): {
  hostname: string;
  origin: string;
  href: string;
  path: string;
  isTechnicalHost: boolean;
} {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const href = window.location.href;
  const path = window.location.pathname;
  const h = hostname.toLowerCase().replace(/^www\./, "");
  const isTechnicalHost =
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "vercel.com" ||
    h === "vercel.app" ||
    h.endsWith(".vercel.app");
  return { hostname, origin, href, path, isTechnicalHost };
}

function nowIso(): string {
  return new Date().toISOString();
}

function safeMeta(meta: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  let count = 0;
  for (const [k, v] of Object.entries(meta)) {
    if (count >= 30) break;
    if (/pass(word)?|secret|token|api[_-]?key|stripe|smtp|database|jwt/i.test(k)) continue;
    if (v == null) continue;
    if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
    else out[k] = JSON.parse(JSON.stringify(v));
    count += 1;
  }
  return out;
}

export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CONSENT_KEY) === "1";
}

export function setAnalyticsConsent(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value ? "1" : "0");
}

function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const v = randId("v");
  window.localStorage.setItem(VISITOR_KEY, v);
  return v;
}

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const v = randId("s");
  window.sessionStorage.setItem(SESSION_KEY, v);
  return v;
}

const lastSent = new Map<string, number>();
function shouldThrottle(key: string, ms: number): boolean {
  const now = Date.now();
  const prev = lastSent.get(key) ?? 0;
  if (now - prev < ms) return true;
  lastSent.set(key, now);
  return false;
}

export function trackEvent(params: {
  type: TelemetryEventType;
  path?: string;
  metadata?: Record<string, unknown>;
  consentAnalytics?: boolean;
  throttleMs?: number;
}): void {
  try {
    if (typeof window === "undefined") return;
    const tenantId = getTenantId();
    const location = getRuntimeLocation();
    const path = params.path || location.path;
    const throttleKey = `${params.type}:${path}`;
    if (params.throttleMs && shouldThrottle(throttleKey, params.throttleMs)) return;

    const consentAnalytics =
      typeof params.consentAnalytics === "boolean" ? params.consentAnalytics : getAnalyticsConsent();

    // RGPD: page_view uniquement si consentement analytics.
    if (params.type === "page_view" && consentAnalytics !== true) return;

    const payload = {
      tenantId,
      siteDomain: location.hostname,
      hostname: location.hostname,
      origin: location.origin,
      href: location.href,
      type: params.type,
      path,
      referrer: document.referrer || undefined,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      consentAnalytics,
      metadata: safeMeta({
        ...params.metadata,
        siteDomain: location.hostname,
        hostname: location.hostname,
        origin: location.origin,
        href: location.href,
        isTechnicalHost: location.isTechnicalHost,
        clientTs: nowIso(),
      }),
    };

    const url = `${baseUrl()}/api/telemetry/event`;

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json; charset=utf-8" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
      return;
    }
    void fetch(url, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // jamais bloquant
  }
}

