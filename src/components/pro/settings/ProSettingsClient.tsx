"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SiteConfig } from "@/config/site.config";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import {
  getProTenantSettingsFromApi,
  mergePersistedWithDefaults,
  putProTenantSettingsToApi,
} from "@/lib/proSettingsClient";
import { ProSettingsAppearancePanel } from "./ProSettingsAppearancePanel";
import { ProSettingsHub } from "./ProSettingsHub";
import { SettingsEditToolbar } from "./editable/SettingsEditToolbar";
import { UnsavedChangesBar } from "./editable/UnsavedChangesBar";
import { SettingsTabs, type SettingsTabId } from "./SettingsTabs";
import { SettingsTabPanels } from "./tabs/SettingsTabPanels";
import { useTenantDraft } from "./useTenantDraft";
import { validateContactSection } from "./contactValidation";
import { normalizeTenantVehicles } from "@/lib/tenantVehiclesNormalize";
import type { ProSettingsMailMeta } from "./types";

const ADVANCED_TABS: SettingsTabId[] = ["appearance", "pricing", "home", "badges", "testimonials", "faq", "contact", "legal"];

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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTabId>("appearance");
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
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
        setLoadMessage(result.status === 401 ? "Session expirée, reconnectez-vous." : "Impossible de charger les paramètres.");
        return;
      }
      syncFromServer(mergePersistedWithDefaults(defaultsRef.current, result.settings));
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [syncFromServer]);

  const handleSaveAdvanced = async () => {
    const err = validateContactSection(draft.contact);
    setContactErrors(err);
    if (Object.keys(err).length > 0) {
      setFeedback({ tone: "error", text: "Corrigez les erreurs dans l’onglet Contact avant d’enregistrer." });
      setTab("contact");
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const result = await putProTenantSettingsToApi(normalizeTenantVehicles(structuredClone(draft)));
      if (!result.ok) {
        setFeedback({
          tone: "error",
          text: result.kind === "unauthorized" ? "Session expirée, reconnectez-vous." : result.message ?? "Impossible de sauvegarder.",
        });
        return;
      }
      syncFromServer(mergePersistedWithDefaults(defaultsRef.current, result.settings));
      setFeedback({ tone: "success", text: "Réglages avancés enregistrés." });
      window.setTimeout(() => setFeedback(null), 6000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProGuard>
      <ProSettingsAppearancePanel commercialName={draft.general.commercialName} />
      <ProSettingsHub />

      <ProPanel id="reglages-avances">
        <ProSectionHeader
          title="Réglages avancés"
          description="Options complémentaires : apparence, affichage marketing, FAQ, juridique et routage e-mails."
          action={
            advancedOpen ? (
              <SettingsEditToolbar
                editing={editing}
                isDirty={isDirty}
                saving={saving}
                onModify={enterEdit}
                onCancel={() => {
                  setContactErrors({});
                  setFeedback(null);
                  cancelEdit();
                }}
                onSave={handleSaveAdvanced}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdvancedOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] hover:bg-[var(--pro-panel-muted)]"
              >
                Afficher les réglages avancés
              </button>
            )
          }
        />

        {!advancedOpen ? (
          <p className="mt-4 text-sm text-[var(--pro-text-muted)]">
            Pour la plupart des réglages, utilisez{" "}
            <Link href="/pro/site" className="font-medium text-[var(--pro-accent)] hover:underline">
              Site internet
            </Link>{" "}
            et{" "}
            <Link href="/pro/tarifs" className="font-medium text-[var(--pro-accent)] hover:underline">
              Tarifs
            </Link>
            .
          </p>
        ) : (
          <>
            {loadState === "loading" ? (
              <p className="mt-4 text-sm text-[var(--pro-text-muted)]">Chargement…</p>
            ) : null}
            {loadMessage ? (
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
              <SettingsTabs
                active={tab}
                onChange={setTab}
                tabIds={ADVANCED_TABS}
              />
              <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 md:p-6">
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
          </>
        )}
      </ProPanel>
    </ProGuard>
  );
}

export function SettingsPage(props: ProSettingsClientProps) {
  return <ProSettingsClient {...props} />;
}
