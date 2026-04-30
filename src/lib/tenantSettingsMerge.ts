import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepMerge<T>(target: T, source: unknown): T {
  if (source === null || source === undefined) return target;
  if (Array.isArray(source)) return source as T;
  if (!isPlainObject(source)) return source as T;
  if (target === null || typeof target !== "object" || Array.isArray(target)) {
    return source as T;
  }

  const out = { ...(target as Record<string, unknown>) };
  for (const [key, val] of Object.entries(source)) {
    const cur = out[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val) && isPlainObject(cur) && !Array.isArray(cur)) {
      out[key] = deepMerge(cur, val) as unknown;
    } else {
      out[key] = val as unknown;
    }
  }
  return out as T;
}

/**
 * Fusion profonde : `persisted` surcharge `defaults`. Les tableaux sont remplacés en entier si présents côté persisted.
 */
export function mergeTenantSettings(defaults: TenantSettingsV1, persisted: unknown | null): TenantSettingsV1 {
  if (persisted === null || persisted === undefined) {
    return structuredClone(defaults);
  }
  if (!isPlainObject(persisted)) {
    return structuredClone(defaults);
  }
  return deepMerge(structuredClone(defaults), persisted) as TenantSettingsV1;
}
