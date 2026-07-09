"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import {
  getProTenantSettingsFromApi,
  mergePersistedWithDefaults,
  putProTenantSettingsToApi,
} from "@/lib/proSettingsClient";
import { normalizeTenantVehicles } from "@/lib/tenantVehiclesNormalize";
import { useTenantDraft } from "@/components/pro/settings/useTenantDraft";

type LoadState = "loading" | "ready" | "error";
type Feedback = { tone: "success" | "error" | "warning"; text: string } | null;

type SaveOptions = {
  validate?: () => string[] | null;
  warnings?: string[];
};

export function useProTenantEditor(defaults: TenantSettingsV1) {
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const { draft, setDraft, editing, enterEdit, cancelEdit, isDirty, syncFromServer } = useTenantDraft(defaults);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      setLoadMessage(null);
      const result = await getProTenantSettingsFromApi();
      if (cancelled) return;
      if (!result.ok) {
        setLoadState("error");
        setLoadMessage(
          result.status === 401
            ? "Session expirée, reconnectez-vous."
            : "Configuration locale affichée (API indisponible)."
        );
        syncFromServer(defaultsRef.current);
        return;
      }
      const merged = mergePersistedWithDefaults(defaultsRef.current, result.settings);
      syncFromServer(merged);
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [syncFromServer]);

  const save = useCallback(
    async (options?: SaveOptions) => {
      const validationErrors = options?.validate?.() ?? null;
      if (validationErrors && validationErrors.length > 0) {
        setFeedback({ tone: "error", text: validationErrors[0] });
        return false;
      }

      setSaving(true);
      setFeedback(null);
      try {
        const payload = normalizeTenantVehicles(structuredClone(draft));
        const result = await putProTenantSettingsToApi(payload);
        if (!result.ok) {
          if (result.kind === "unauthorized") {
            setFeedback({ tone: "error", text: "Session expirée, reconnectez-vous." });
          } else if (result.kind === "network") {
            setFeedback({ tone: "error", text: "Impossible de sauvegarder pour le moment." });
          } else {
            setFeedback({ tone: "error", text: result.message ?? "Impossible de sauvegarder pour le moment." });
          }
          return false;
        }
        const merged = mergePersistedWithDefaults(defaultsRef.current, result.settings);
        syncFromServer(merged);
        const warningText = options?.warnings?.[0];
        setFeedback({
          tone: warningText ? "warning" : "success",
          text: warningText ? `Enregistré. Attention : ${warningText}` : "Modifications enregistrées.",
        });
        window.setTimeout(() => setFeedback(null), 6000);
        return true;
      } finally {
        setSaving(false);
      }
    },
    [draft, syncFromServer]
  );

  return {
    draft,
    setDraft,
    editing,
    enterEdit,
    cancelEdit,
    isDirty,
    loadState,
    loadMessage,
    saving,
    feedback,
    setFeedback,
    save,
  };
}
