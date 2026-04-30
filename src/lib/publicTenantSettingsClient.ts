import { cache } from "react";
import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { mergeTenantSettings } from "@/lib/tenantSettingsMerge";

export { mergeTenantSettings } from "@/lib/tenantSettingsMerge";

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/** Config lecture publique : tenant « default » si env absent (spec API). */
function getPublicTenantSettingsFetchConfig(): { baseUrl: string; tenantId: string } | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (!raw) return null;
  return {
    baseUrl: normalizeBaseUrl(raw),
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID?.trim() || "default",
  };
}

export type FetchPublicTenantSettingsResult =
  | { ok: true; status: number; settings: unknown | null; meta?: { persisted?: boolean } }
  | { ok: false; status: number };

async function readJsonBody(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Appelle l’API centrale GET /api/public/tenant-settings (no-store).
 * En cas d’erreur réseau, JSON invalide ou réponse inattendue : ok false.
 */
export async function fetchPublicTenantSettings(): Promise<FetchPublicTenantSettingsResult> {
  const cfg = getPublicTenantSettingsFetchConfig();
  if (!cfg) {
    return { ok: false, status: 0 };
  }

  const url = `${cfg.baseUrl}/api/public/tenant-settings`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "X-Tenant-ID": cfg.tenantId },
      cache: "no-store",
    });

    const json = await readJsonBody(res);

    if (!res.ok) {
      return { ok: false, status: res.status };
    }

    const success = json.success === true;
    if (!success) {
      return { ok: false, status: res.status };
    }

    const data = json.data as { settings?: unknown } | undefined;
    const meta = json.meta as { persisted?: boolean } | undefined;

    return {
      ok: true,
      status: res.status,
      settings: data?.settings ?? null,
      meta,
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * Settings tenant fusionnés avec les défauts, mis en cache par requête RSC (layout + pages).
 */
export const getPublicTenantSettings = cache(async (): Promise<TenantSettingsV1> => {
  try {
    const result = await fetchPublicTenantSettings();
    if (!result.ok) {
      return mergeTenantSettings(defaultTenantSettings, null);
    }
    return mergeTenantSettings(defaultTenantSettings, result.settings);
  } catch {
    return mergeTenantSettings(defaultTenantSettings, null);
  }
});
