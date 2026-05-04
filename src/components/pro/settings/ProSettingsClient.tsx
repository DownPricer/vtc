"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteConfig } from "@/config/site.config";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import {
  getProTenantSettingsFromApi,
  mergePersistedWithDefaults,
  putProTenantSettingsToApi,
} from "@/lib/proSettingsClient";
import { SettingsEditToolbar } from "./editable/SettingsEditToolbar";
import { UnsavedChangesBar } from "./editable/UnsavedChangesBar";
import { SettingsTabs, type SettingsTabId } from "./SettingsTabs";
import { SettingsTabPanels } from "./tabs/SettingsTabPanels";
import { SiteDraftPreviewModal } from "./SiteDraftPreviewModal";
import { useTenantDraft } from "./useTenantDraft";
import { validateContactSection } from "./contactValidation";
import { normalizeTenantVehicles } from "@/lib/tenantVehiclesNormalize";
import type { ProSettingsMailMeta } from "./types";

type ProSettingsClientProps = {
  tenant: TenantSettingsV1;
  mailMeta: ProSettingsMailMeta;
  siteFeatures: SiteConfig["features"];
};

type LoadState = "loading" | "ready" | "error";

type Feedback = { tone: "success" | "error"; text: string } | null;

export function ProSettingsClient({ tenant, mailMeta, siteFeatures }: ProSettingsClientProps) {
  const defaultsRef = useRef(tenant);
  defaultsRef.current = tenant;

  const { draft, setDraft, editing, enterEdit, cancelEdit, isDirty, syncFromServer } = useTenantDraft(tenant);
  const [tab, setTab] = useState<SettingsTabId>("general");
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      setLoadMessage(null);
      const result = await getProTenantSettingsFromApi();
      if (cancelled) return;
      if (!result.ok) {
        setLoadState("error");
        if (result.status === 401) {
          setLoadMessage("Session expirée, reconnectez-vous.");
        } else {
          setLoadMessage("Impossible de charger les paramètres pour le moment.");
        }
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

  const handleSave = async () => {
    const err = validateContactSection(draft.contact);
    setContactErrors(err);
    if (Object.keys(err).length > 0) {
      window.alert("Corrigez les erreurs dans l’onglet « Contact & e-mails » avant d’enregistrer.");
      setTab("contact");
      return;
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
        return;
      }
      const merged = mergePersistedWithDefaults(defaultsRef.current, result.settings);
      syncFromServer(merged);
      setFeedback({ tone: "success", text: "Paramètres sauvegardés." });
      window.setTimeout(() => setFeedback(null), 6000);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleCancel = () => {
    setContactErrors({});
    setFeedback(null);
    cancelEdit();
  };

  return (
    <ProGuard>
      <SiteDraftPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} draft={draft} />
      <ProShell>
        <ProNav />
        <ProPanel>
          <ProSectionHeader
            eyebrow="Configuration"
            title="Paramètres du site"
            description="Les valeurs par défaut du site sont fusionnées avec la configuration enregistrée sur l’API centrale. Enregistrer envoie le brouillon actuel au serveur."
            action={
              <SettingsEditToolbar
                editing={editing}
                isDirty={isDirty}
                saving={saving}
                onModify={enterEdit}
                onCancel={handleCancel}
                onSave={handleSave}
                onPreview={handlePreview}
              />
            }
          />

          {loadState === "loading" ? (
            <p className="mt-4 text-sm text-[var(--pro-text-muted)]">Chargement des paramètres depuis l’API…</p>
          ) : null}
          {loadState === "error" && loadMessage ? (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-[var(--pro-text)]">
              {loadMessage}
            </div>
          ) : null}
          {feedback ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                feedback.tone === "success"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-[var(--pro-text)]"
                  : "border-red-400/40 bg-red-500/10 text-[var(--pro-text)]"
              }`}
              role="status"
            >
              {feedback.text}
            </div>
          ) : null}

          <div className="mt-4">
            <UnsavedChangesBar visible={loadState === "ready" && editing && isDirty} />
          </div>
          <div className={`mt-6 space-y-5 ${loadState === "loading" ? "pointer-events-none opacity-50" : ""}`}>
            <SettingsTabs active={tab} onChange={setTab} />
            <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 md:p-6">
              <SettingsTabPanels
                tab={tab}
                draft={draft}
                setDraft={setDraft}
                editing={editing}
                siteFeatures={siteFeatures}
                mailMeta={mailMeta}
                contactErrors={contactErrors}
              />
            </div>
          </div>
        </ProPanel>
      </ProShell>
    </ProGuard>
  );
}

/** Alias demandé par le backlog (composant page paramètres). */
export function SettingsPage(props: ProSettingsClientProps) {
  return <ProSettingsClient {...props} />;
}
