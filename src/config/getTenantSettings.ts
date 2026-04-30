import { defaultTenantSettings } from "./defaultTenantSettings";
import type { TenantSettingsV1 } from "./tenant-settings.types";

/**
 * Accès central à la configuration tenant.
 * V1: retourne la config par défaut (plus tard: surcharge par tenant, API, etc.).
 */
export function getTenantSettings(): TenantSettingsV1 {
  return defaultTenantSettings;
}

