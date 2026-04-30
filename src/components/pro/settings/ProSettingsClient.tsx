"use client";

import { useState } from "react";
import type { SiteConfig } from "@/config/site.config";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import { SettingsEditToolbar } from "./editable/SettingsEditToolbar";
import { UnsavedChangesBar } from "./editable/UnsavedChangesBar";
import { SettingsTabs, type SettingsTabId } from "./SettingsTabs";
import { SettingsTabPanels } from "./tabs/SettingsTabPanels";
import { useTenantDraft } from "./useTenantDraft";
import { validateContactSection } from "./contactValidation";
import type { ProSettingsMailMeta } from "./types";

type ProSettingsClientProps = {
  tenant: TenantSettingsV1;
  mailMeta: ProSettingsMailMeta;
  siteFeatures: SiteConfig["features"];
};

export function ProSettingsClient({ tenant, mailMeta, siteFeatures }: ProSettingsClientProps) {
  const { draft, setDraft, editing, enterEdit, cancelEdit, isDirty } = useTenantDraft(tenant);
  const [tab, setTab] = useState<SettingsTabId>("general");
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const err = validateContactSection(draft.contact);
    setContactErrors(err);
    if (Object.keys(err).length > 0) {
      window.alert("Corrigez les erreurs dans l’onglet « Contact & e-mails » avant d’enregistrer.");
      setTab("contact");
      return;
    }
    window.alert("Les modifications sont prêtes. La sauvegarde persistante sera branchée à l’étape suivante.");
  };

  const handlePreview = () => {
    window.alert("Prévisualisation complète disponible à l’étape suivante.");
  };

  const handleCancel = () => {
    setContactErrors({});
    cancelEdit();
  };

  return (
    <ProGuard>
      <ProShell>
        <ProNav />
        <ProPanel>
          <ProSectionHeader
            eyebrow="Configuration"
            title="Paramètres du site"
            description="Modifiez la configuration locale du tableau de bord. Les changements ne sont pas encore synchronisés avec la base de données."
            action={
              <SettingsEditToolbar
                editing={editing}
                isDirty={isDirty}
                onModify={enterEdit}
                onCancel={handleCancel}
                onSave={handleSave}
                onPreview={handlePreview}
              />
            }
          />
          <p className="mt-3 text-xs text-[var(--pro-text-muted)]">
            La persistance centralisée et la prévisualisation vitrine complète seront disponibles à l’étape suivante.
          </p>
          <div className="mt-4">
            <UnsavedChangesBar visible={editing && isDirty} />
          </div>
          <div className="mt-6 space-y-5">
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
