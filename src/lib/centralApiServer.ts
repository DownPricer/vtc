import "server-only";
import type { CentralBusinessRoute } from "./centralApi";

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

export async function postCentralApiServer(route: CentralBusinessRoute, body: unknown): Promise<Response> {
  const cfg = getCentralServerConfig();
  return fetch(`${cfg.baseUrl}/api/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Tenant-ID": cfg.tenantId,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

