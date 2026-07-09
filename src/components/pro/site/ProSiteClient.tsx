"use client";

import Link from "next/link";
import { useState } from "react";
import type { SiteConfig } from "@/config/site.config";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import { ProTenantEditorChrome } from "@/components/pro/ProTenantEditorChrome";
import { ContactTab } from "@/components/pro/settings/tabs/ContactTab";
import { SeoTab } from "@/components/pro/settings/tabs/SeoTab";
import { ServicesTab } from "@/components/pro/settings/tabs/ServicesTab";
import { VehiclesTab } from "@/components/pro/settings/tabs/VehiclesTab";
import { SiteDraftPreviewModal } from "@/components/pro/settings/SiteDraftPreviewModal";
import { validateContactSection } from "@/components/pro/settings/contactValidation";
import { useProTenantEditor } from "@/hooks/useProTenantEditor";
import { SiteIdentitySection, SitePresentationSection } from "./SiteSettingsSections";

const EMPTY_MAIL_META = {
  mailTo: null,
  mailToCopy: null,
  mailReplyTo: null,
  customerConfirmationEnv: "",
  customerConfirmationEffective: false,
};

type ProSiteClientProps = {
  defaults: TenantSettingsV1;
  siteFeatures: SiteConfig["features"];
};

export function ProSiteClient({ defaults, siteFeatures }: ProSiteClientProps) {
  const editor = useProTenantEditor(defaults);
  const { draft, setDraft, editing, enterEdit, cancelEdit, isDirty, loadState, loadMessage, saving, feedback, save } = editor;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    const err = validateContactSection(draft.contact);
    setContactErrors(err);
    const errors = Object.values(err);
    await save({ validate: () => (errors.length > 0 ? errors : null) });
  };

  const shared = { draft, setDraft, editing, siteFeatures, mailMeta: EMPTY_MAIL_META, contactErrors };

  return (
    <ProGuard>
      <SiteDraftPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} draft={draft} />
      <ProTenantEditorChrome
        title="Site internet"
        description="Modifiez l’identité, les coordonnées, la présentation et le contenu affiché sur votre vitrine."
        editing={editing}
        isDirty={isDirty}
        saving={saving}
        loadState={loadState}
        loadMessage={loadMessage}
        feedback={feedback}
        onModify={enterEdit}
        onCancel={() => {
          setContactErrors({});
          cancelEdit();
        }}
        onSave={handleSave}
        showPreview
        onPreview={() => setPreviewOpen(true)}
      >
        <ProPanel>
          <ProSectionHeader title="Identité" description="Nom commercial, raison sociale et zone d’intervention." />
          <div className="mt-6">
            <SiteIdentitySection {...shared} />
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader title="Coordonnées" description="Téléphone, e-mail et adresse affichés sur le site." />
          <div className="mt-6">
            <ContactTab {...shared} hideMailRouting />
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader title="Présentation" description="Textes d’accueil et moyens de paiement visibles." />
          <div className="mt-6">
            <SitePresentationSection {...shared} />
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader title="Services" description="Prestations affichées sur la page Services." />
          <div className="mt-6">
            <ServicesTab {...shared} />
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader title="Véhicules" description="Flotte et véhicule mis en avant sur la vitrine." />
          <div className="mt-6">
            <VehiclesTab {...shared} />
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader title="SEO" description="Titres, descriptions et mots-clés pour le référencement." />
          <div className="mt-6">
            <SeoTab {...shared} />
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader title="Aperçu" description="Liens utiles — lecture seule." />
          <div className="mt-6 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 text-sm">
            <dl className="space-y-3">
              <div>
                <dt className="font-medium text-[var(--pro-text-muted)]">Vitrine publique</dt>
                <dd className="mt-1">
                  <Link href="/" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--pro-accent)] hover:underline">
                    Ouvrir le site dans un nouvel onglet
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--pro-text-muted)]">Logo actuel</dt>
                <dd className="mt-1 text-[var(--pro-text)]">{draft.branding.logoSrc || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--pro-text-muted)]">Couleur principale</dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-[var(--pro-text)]">
                  <span
                    className="inline-block h-4 w-4 rounded border border-[var(--pro-border)]"
                    style={{ backgroundColor: draft.branding.colors.primary }}
                  />
                  {draft.branding.colors.primary}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-[var(--pro-text-muted)]">
              Logo et couleurs avancées : section « Apparence » dans Paramètres → Réglages avancés.
            </p>
          </div>
        </ProPanel>
      </ProTenantEditorChrome>
    </ProGuard>
  );
}
