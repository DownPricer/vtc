"use client";

import { useEffect, useState } from "react";
import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { getProTenantSettingsFromApi } from "@/lib/proSettingsClient";
import { mergeTenantSettings } from "@/lib/tenantSettingsMerge";
import { proApi } from "@/lib/proApi";
import type { QuoteLead } from "./QuoteDocument";

/** Charge la demande et les paramètres du tenant (identité, coordonnées, mentions légales) pour le devis. */
export function useQuoteData(id: string) {
  const [lead, setLead] = useState<QuoteLead | null>(null);
  const [tenant, setTenant] = useState<TenantSettingsV1>(defaultTenantSettings);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reqRes, settingsRes] = await Promise.all([proApi(`/requests/${id}`), getProTenantSettingsFromApi()]);
        if (cancelled) return;
        setLead(reqRes.data as QuoteLead);
        if (settingsRes.ok && settingsRes.settings) {
          setTenant(mergeTenantSettings(defaultTenantSettings, settingsRes.settings));
        }
      } catch {
        if (!cancelled) setError("Impossible de charger le devis.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { lead, tenant, error };
}
