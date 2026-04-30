import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { proAuthenticatedFetch } from "@/lib/proApi";
import { mergeTenantSettings } from "@/lib/tenantSettingsMerge";

async function readJsonBody(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** @deprecated Utiliser mergeTenantSettings — alias conservé pour le dashboard pro. */
export const mergePersistedWithDefaults = mergeTenantSettings;

export type GetProSettingsResult =
  | { ok: true; status: number; settings: unknown | null; meta?: Record<string, unknown> }
  | { ok: false; status: number };

export async function getProTenantSettingsFromApi(): Promise<GetProSettingsResult> {
  try {
    const res = await proAuthenticatedFetch("/pro/settings", { method: "GET" });
    const json = await readJsonBody(res);
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    const data = json.data as { settings?: unknown } | undefined;
    return {
      ok: true,
      status: res.status,
      settings: data?.settings ?? null,
      meta: json.meta as Record<string, unknown> | undefined,
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

export type PutProSettingsResult =
  | { ok: true; status: number; settings: TenantSettingsV1 }
  | { ok: false; status: number; kind: "unauthorized" | "network" | "api"; message?: string };

export async function putProTenantSettingsToApi(settings: TenantSettingsV1): Promise<PutProSettingsResult> {
  try {
    const res = await proAuthenticatedFetch("/pro/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const json = await readJsonBody(res);

    if (res.status === 401) {
      return { ok: false, status: 401, kind: "unauthorized" };
    }

    if (!res.ok) {
      const msg =
        ((json.error as { message?: string } | undefined)?.message as string | undefined) || "Erreur lors de la sauvegarde.";
      return { ok: false, status: res.status, kind: "api", message: msg };
    }

    const data = json.data as { settings?: unknown } | undefined;
    const saved = data?.settings;
    if (!isPlainObject(saved)) {
      return { ok: false, status: res.status, kind: "api", message: "Réponse serveur invalide (settings manquant)." };
    }

    return {
      ok: true,
      status: res.status,
      settings: saved as TenantSettingsV1,
    };
  } catch {
    return { ok: false, status: 0, kind: "network" };
  }
}
