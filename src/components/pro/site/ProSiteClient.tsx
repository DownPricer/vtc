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
import { SiteSectionNav, type SiteSectionLink } from "./SiteSectionNav";
import { SiteIdentitySection, SitePresentationSection } from "./SiteSettingsSections";

const EMPTY_MAIL_META = {
  mailTo: null,
  mailToCopy: null,
  mailReplyTo: null,
  customerConfirmationEnv: "",
  customerConfirmationEffective: false,
};

const SECTIONS: SiteSectionLink[] = [
  { id: "identite", label: "Identité" },
  { id: "coordonnees", label: "Coordonnées" },
  { id: "presentation", label: "Présentation" },
  { id: "services", label: "Services" },
  { id: "vehicules", label: "Véhicules" },
  { id: "seo", label: "SEO" },
  { id: "apercu", label: "Aperçu" },
];

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
        <SiteSectionNav sections={SECTIONS} />

        <ProPanel id="identite" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="Identité" description="Nom commercial, raison sociale et zone d’intervention." />
          <div>
            <SiteIdentitySection {...shared} />
          </div>
        </ProPanel>

        <ProPanel id="coordonnees" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="Coordonnées" description="Téléphone, e-mail et adresse affichés sur le site." />
          <div>
            <ContactTab {...shared} hideMailRouting />
          </div>
        </ProPanel>

        <ProPanel id="presentation" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="Présentation" description="Textes d’accueil et moyens de paiement visibles." />
          <div>
            <SitePresentationSection {...shared} />
          </div>
        </ProPanel>

        <ProPanel id="services" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="Services" description="Prestations affichées sur la page Services." />
          <div>
            <ServicesTab {...shared} />
          </div>
        </ProPanel>

        <ProPanel id="vehicules" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="Véhicules" description="Flotte et véhicule mis en avant sur la vitrine." />
          <div>
            <VehiclesTab {...shared} />
          </div>
        </ProPanel>

        <ProPanel id="seo" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="SEO" description="Titres, descriptions et mots-clés pour le référencement." />
          <div>
            <SeoTab {...shared} />
          </div>
        </ProPanel>

        <ProPanel id="apercu" className="scroll-mt-36">
          <ProSectionHeader level="panel" title="Aperçu" description="Liens utiles — lecture seule." />
          <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 text-sm">
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
                <dd className="mt-2 text-[var(--pro-text)]">
                  {draft.branding.logoSrc ? (
                    <span className="inline-flex items-center gap-3 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={draft.branding.logoSrc} alt="Logo actuel du site" className="h-12 w-auto max-w-[160px] object-contain" />
                    </span>
                  ) : (
                    "Aucun logo défini"
                  )}
                </dd>
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
              Pour changer le logo ou les couleurs, rendez-vous dans{" "}
              <Link href="/pro/parametres" className="font-medium text-[var(--pro-accent)] hover:underline">
                Paramètres → Apparence
              </Link>
              .
            </p>
          </div>
        </ProPanel>
      </ProTenantEditorChrome>
    </ProGuard>
  );
}
