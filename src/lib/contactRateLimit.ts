/**
 * Limiteur en mémoire pour POST /api/contact (IP + e-mail).
 * Purge périodique des entrées expirées pour éviter une croissance infinie.
 */

type Hit = { count: number; resetAt: number };

const ipHits = new Map<string, Hit>();
const emailHits = new Map<string, Hit>();

const WINDOW_MS = 15 * 60 * 1000;
export const CONTACT_IP_MAX = 5;
export const CONTACT_EMAIL_MAX = 3;

let lastPurgeAt = 0;
const PURGE_EVERY_MS = 60_000;

function purgeMap(map: Map<string, Hit>, now: number): void {
  map.forEach((v, k) => {
    if (v.resetAt <= now) map.delete(k);
  });
}

export function purgeExpiredContactRateLimits(now = Date.now()): void {
  purgeMap(ipHits, now);
  purgeMap(emailHits, now);
  lastPurgeAt = now;
}

function maybePurge(now: number): void {
  if (now - lastPurgeAt >= PURGE_EVERY_MS || ipHits.size + emailHits.size > 2000) {
    purgeExpiredContactRateLimits(now);
  }
}

function touch(map: Map<string, Hit>, key: string, max: number, now: number): { ok: true } | { ok: false; retryAfterSec: number } {
  const entry = map.get(key);
  if (!entry || entry.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

/** Réservé aux tests. */
export function _resetContactRateLimitsForTests(): void {
  ipHits.clear();
  emailHits.clear();
  lastPurgeAt = 0;
}

export function _contactRateLimitSizesForTests(): { ip: number; email: number } {
  return { ip: ipHits.size, email: emailHits.size };
}

/**
 * @returns null si OK, sinon { retryAfterSec } pour 429.
 */
export function checkContactRateLimit(ip: string, email: string): { retryAfterSec: number } | null {
  const now = Date.now();
  maybePurge(now);
  const ipKey = `ip:${ip || "unknown"}`;
  const emailKey = `email:${email.trim().toLowerCase()}`;
  const ipRes = touch(ipHits, ipKey, CONTACT_IP_MAX, now);
  if (!ipRes.ok) return { retryAfterSec: ipRes.retryAfterSec };
  const emailRes = touch(emailHits, emailKey, CONTACT_EMAIL_MAX, now);
  if (!emailRes.ok) return { retryAfterSec: emailRes.retryAfterSec };
  return null;
}
