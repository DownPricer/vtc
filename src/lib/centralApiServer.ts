import "server-only";
import type { CentralBusinessRoute } from "./centralApi";
import { resolveVisitorIpFromHeaders } from "./bffClientIp";

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

function getCentralServerConfig(): { baseUrl: string; tenantId: string } {
  const baseUrlRaw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim() ?? "";
  if (!baseUrlRaw || !tenantId) {
    throw new Error("Configuration API centrale manquante (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_TENANT_ID).");
  }
  return { baseUrl: normalizeBaseUrl(baseUrlRaw), tenantId };
}

type IncomingHeaders = { get(name: string): string | null };

/**
 * POST JSON vers l’API centrale.
 * Si `CENTRAL_API_BFF_SECRET` (≥ 32 car.) est défini : envoie `X-BFF-Auth` + `X-Client-Ip`.
 * Sinon n’envoie aucun de ces en-têtes (compatibilité sites non encore configurés).
 */
export async function postCentralApiServer(
  route: CentralBusinessRoute,
  body: unknown,
  siteDomain?: string | null,
  incoming?: IncomingHeaders | null
): Promise<Response> {
  const cfg = getCentralServerConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Tenant-ID": cfg.tenantId,
  };
  if (siteDomain) headers["X-Site-Domain"] = siteDomain;

  const secret = process.env.CENTRAL_API_BFF_SECRET?.trim() ?? "";
  if (secret.length >= 32 && incoming) {
    const visitorIp = resolveVisitorIpFromHeaders((n) => incoming.get(n));
    if (visitorIp) {
      headers["X-BFF-Auth"] = secret;
      headers["X-Client-Ip"] = visitorIp;
    }
  }

  return fetch(`${cfg.baseUrl}/api/${route}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
}
