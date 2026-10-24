"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { proBtnPrimaryClass, proBtnSecondaryClass } from "./editable/proFieldStyles";
import type { SettingsTabId } from "./SettingsTabs";
import { AdvancedSaveBar } from "./AdvancedSaveBar";
import { AdvancedSettingsNav, AdvancedSettingsOverview } from "./AdvancedSettingsNav";
import { ADVANCED_SECTIONS, getAdvancedSection, isAdvancedTabId } from "./advancedSections";
import { SettingsTabPanels } from "./tabs/SettingsTabPanels";
import { useTenantDraft } from "./useTenantDraft";
import { validateContactSection } from "./contactValidation";
import { normalizeTenantVehicles } from "@/lib/tenantVehiclesNormalize";
import type { ProSettingsMailMeta } from "./types";

const ANCHOR = "reglages-avances";

/** `#reglages-avances` ou `#reglages-avances/faq` : ouvre le bloc (et la section) depuis un lien. */
function parseHash(): { open: boolean; tab: SettingsTabId | null } {
  if (typeof window === "undefined") return { open: false, tab: null };
  const [anchor, tab] = window.location.hash.replace(/^#/, "").split("/");
  if (anchor !== ANCHOR) return { open: false, tab: null };
  return { open: true, tab: tab && isAdvancedTabId(tab) ? tab : null };
}

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

  const { draft, setDraft, editing, enterEdit, cancelEdit, isDirty, dirtyKeys, syncFromServer } = useTenantDraft(tenant);
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
      setContactErrors({});
      setFeedback({ tone: "success", text: "Réglages avancés enregistrés." });
      window.setTimeout(() => setFeedback(null), 6000);
    } finally {
      setSaving(false);
    }
  };

  const statusById = useMemo(() => {
    const out: Partial<Record<SettingsTabId, { dirty: boolean; error: boolean }>> = {};
    for (const section of ADVANCED_SECTIONS) {
      out[section.id] = {
        dirty: section.draftKeys.some((k) => dirtyKeys.includes(k)),
        error: section.id === "contact" && Object.keys(contactErrors).length > 0,
      };
    }
    return out;
  }, [dirtyKeys, contactErrors]);

  const dirtyLabels = useMemo(
    () => ADVANCED_SECTIONS.filter((s) => statusById[s.id]?.dirty).map((s) => s.label),
    [statusById],
  );

  const openSection = useCallback((id: SettingsTabId) => {
    setTab(id);
    setAdvancedOpen(true);
    window.history.replaceState(null, "", `#${ANCHOR}/${id}`);
  }, []);

  const handleCancel = () => {
    if (isDirty && !window.confirm("Abandonner toutes les modifications non enregistrées ?")) return;
    setContactErrors({});
    setFeedback(null);
    cancelEdit();
  };

  const handleCollapse = () => {
    if (isDirty && !window.confirm("Des modifications ne sont pas enregistrées. Replier et les abandonner ?")) return;
    setContactErrors({});
    cancelEdit();
    setAdvancedOpen(false);
    window.history.replaceState(null, "", `#${ANCHOR}`);
  };

  // Ouverture depuis un lien (#reglages-avances/faq), y compris après chargement de la page.
  useEffect(() => {
    const applyHash = () => {
      const { open, tab: hashTab } = parseHash();
      if (!open) return;
      setAdvancedOpen(true);
      if (hashTab) setTab(hashTab);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // Garde-fous : Ctrl/Cmd+S enregistre, et on prévient avant de quitter avec des changements en cours.
  const saveRef = useRef(handleSaveAdvanced);
  saveRef.current = handleSaveAdvanced;
  useEffect(() => {
    if (!advancedOpen || !editing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (isDirty && !saving) void saveRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advancedOpen, editing, isDirty, saving]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const activeSection = getAdvancedSection(tab);

  return (
    <ProGuard>
      <ProSettingsAppearancePanel commercialName={draft.general.commercialName} />
      <ProSettingsHub />

      <ProPanel id={ANCHOR}>
        <ProSectionHeader
          title="Réglages avancés"
          description="Apparence, page d’accueil, badges, FAQ, mentions légales et routage des e-mails."
          action={
            advancedOpen ? (
              <button type="button" onClick={handleCollapse} className={proBtnSecondaryClass}>
                Replier
              </button>
            ) : (
              <button type="button" onClick={() => openSection(tab)} className={proBtnPrimaryClass}>
                Ouvrir les réglages
              </button>
            )
          }
        />

        {!advancedOpen ? (
          <>
            <p className="mt-4 text-sm text-[var(--pro-text-muted)]">
              Choisissez une section pour la modifier. Pour les réglages courants, utilisez{" "}
              <Link href="/pro/site" className="font-medium text-[var(--pro-accent)] hover:underline">
                Site internet
              </Link>{" "}
              et{" "}
              <Link href="/pro/tarifs" className="font-medium text-[var(--pro-accent)] hover:underline">
                Tarifs
              </Link>
              .
            </p>
            <AdvancedSettingsOverview onSelect={openSection} />
          </>
        ) : (
          <>
            {loadState === "loading" ? <p className="mt-4 text-sm text-[var(--pro-text-muted)]">Chargement…</p> : null}
            {loadMessage ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-[var(--pro-text)]" role="alert">
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

            <div
              className={`mt-6 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] ${loadState === "loading" ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="lg:sticky lg:top-4 lg:self-start">
                <AdvancedSettingsNav active={tab} onChange={openSection} statusById={statusById} />
              </div>

              <div className="min-w-0">
                {activeSection ? (
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[var(--pro-text)]">{activeSection.label}</h3>
                      <p className="mt-0.5 text-sm text-[var(--pro-text-muted)]">{activeSection.description}</p>
                    </div>
                    {!editing && loadState === "ready" ? (
                      <button type="button" onClick={enterEdit} className={proBtnPrimaryClass}>
                        Modifier
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {!editing && loadState === "ready" ? (
                  <p className="mb-4 rounded-xl border border-dashed border-[var(--pro-border)] px-4 py-2.5 text-xs text-[var(--pro-text-muted)]">
                    Lecture seule — cliquez sur « Modifier » pour changer ces réglages. Vos modifications restent en brouillon jusqu’à l’enregistrement.
                  </p>
                ) : null}

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

                {loadState === "ready" && editing ? (
                  <AdvancedSaveBar
                    isDirty={isDirty}
                    saving={saving}
                    dirtyLabels={dirtyLabels}
                    onCancel={handleCancel}
                    onSave={handleSaveAdvanced}
                  />
                ) : null}
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
