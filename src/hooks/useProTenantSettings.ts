"use client";

import { useEffect, useState } from "react";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { getProTenantSettingsFromApi, mergePersistedWithDefaults } from "@/lib/proSettingsClient";

type LoadState = "loading" | "ready" | "error";

export function useProTenantSettings(defaults: TenantSettingsV1) {
  const [tenant, setTenant] = useState<TenantSettingsV1>(defaults);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      setLoadMessage(null);
      const result = await getProTenantSettingsFromApi();
      if (cancelled) return;
      if (!result.ok) {
        setTenant(defaults);
        setLoadState("error");
        setLoadMessage(
          result.status === 401
            ? "Session expirée — reconnectez-vous pour voir la configuration enregistrée."
            : "Configuration locale affichée (API indisponible)."
        );
        return;
      }
      setTenant(mergePersistedWithDefaults(defaults, result.settings));
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [defaults]);

  return { tenant, loadState, loadMessage };
}
