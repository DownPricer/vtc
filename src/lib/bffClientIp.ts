/**
 * IP visiteur vue depuis le BFF Next (derrière Nginx).
 * Préfère `x-real-ip` (posé par Nginx = $remote_addr).
 * Sinon dernier élément de `X-Forwarded-For` (jamais le premier, spoofable par le client).
 */

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]+$/;

export function isPlausibleClientIp(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 45 || /\s/.test(s)) return false;
  if (IPV4_RE.test(s)) {
    return s.split(".").every((p) => {
      const n = Number(p);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    });
  }
  if (s.includes(":") && IPV6_RE.test(s)) return true;
  return false;
}

/** Extrait l'IP client depuis les en-têtes entrants du BFF. */
export function resolveVisitorIpFromHeaders(getHeader: (name: string) => string | null): string | null {
  const realIp = getHeader("x-real-ip")?.trim();
  if (realIp && isPlausibleClientIp(realIp)) return realIp;

  const xff = getHeader("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && isPlausibleClientIp(last)) return last;
  }
  return null;
}
