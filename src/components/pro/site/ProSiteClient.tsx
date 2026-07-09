"use client";

import Link from "next/link";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProReadOnlyBadge } from "@/components/pro/ProReadOnlyBadge";
import { ProActionLink, ProDescriptionList, ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { useProTenantSettings } from "@/hooks/useProTenantSettings";

function formatAddress(address: TenantSettingsV1["contact"]["address"]): string {
  const parts = [address.street, `${address.postalCode} ${address.city}`.trim(), address.country].filter(Boolean);
  return parts.join(", ");
}

function displayValue(value: string | null | undefined, emptyLabel = "Non renseigné") {
  const trimmed = value?.trim();
  if (!trimmed) return <span className="text-[var(--pro-text-muted)]">{emptyLabel}</span>;
  return trimmed;
}

type ProSiteClientProps = {
  defaults: TenantSettingsV1;
};

export function ProSiteClient({ defaults }: ProSiteClientProps) {
  const { tenant, loadState, loadMessage } = useProTenantSettings(defaults);
  const enabledServices = tenant.services.items.filter((item) => item.enabled);
  const enabledVehicles = tenant.vehicles.items.filter((item) => item.enabled);

  return (
    <ProGuard>
      <ProPanel>
        <ProSectionHeader
          title="Site internet"
          description="Consultation de la configuration actuelle du site vitrine. L’édition complète se fait dans Paramètres."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ProReadOnlyBadge />
              <ProActionLink href="/pro/parametres">Modifier dans Paramètres</ProActionLink>
            </div>
          }
        />
        {loadState === "loading" ? (
          <p className="mt-4 text-sm text-[var(--pro-text-muted)]">Chargement de la configuration…</p>
        ) : null}
        {loadMessage ? (
          <p className="mt-4 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text-muted)]">
            {loadMessage}
          </p>
        ) : null}
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Identité" description="Nom commercial, raison sociale et positionnement." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              { label: "Nom commercial", value: displayValue(tenant.general.commercialName) },
              { label: "Nom légal", value: displayValue(tenant.general.legalName) },
              { label: "Accroche", value: displayValue(tenant.general.tagline) },
              { label: "Région / zone", value: displayValue(tenant.general.regionLabel) },
              { label: "Zone principale", value: displayValue(tenant.general.serviceAreas.headline) },
            ]}
          />
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Coordonnées" description="Informations de contact affichées sur le site." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              { label: "Téléphone affiché", value: displayValue(tenant.contact.phoneDisplay) },
              { label: "Téléphone (E.164)", value: displayValue(tenant.contact.phoneE164) },
              { label: "E-mail public", value: displayValue(tenant.contact.emailPublic) },
              { label: "Adresse", value: displayValue(formatAddress(tenant.contact.address)) },
            ]}
          />
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Présentation" description="Textes d’accueil et contenu principal." />
        <div className="mt-6 space-y-4">
          <ProDescriptionList
            rows={[
              {
                label: "Titre accueil",
                value: displayValue(`${tenant.home.hero.titleLine1} ${tenant.home.hero.titleHighlight}`.trim()),
              },
              { label: "Sous-titre accueil", value: displayValue(tenant.home.hero.subtitle) },
              { label: "Présentation chauffeur", value: displayValue(tenant.home.aboutPreview.leadParagraph) },
              { label: "Histoire (à propos)", value: displayValue(tenant.aboutPage.storyLead) },
            ]}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--pro-text-muted)]">Services activés ({enabledServices.length})</p>
            {enabledServices.length > 0 ? (
              <ul className="divide-y divide-[var(--pro-border)] rounded-xl border border-[var(--pro-border)]">
                {enabledServices.map((service) => (
                  <li key={service.id} className="px-4 py-3 text-sm text-[var(--pro-text)]">
                    <span className="font-medium">{service.title}</span>
                    {service.description ? (
                      <span className="mt-1 block text-[var(--pro-text-muted)]">{service.description}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--pro-text-muted)]">Aucun service activé.</p>
            )}
          </div>
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Véhicules" description="Flotte et véhicule mis en avant." />
        <div className="mt-6 space-y-4">
          <ProDescriptionList
            rows={[
              { label: "Véhicule vitrine", value: displayValue(tenant.vehicles.featured.name) },
              { label: "Accroche", value: displayValue(tenant.vehicles.featured.headline) },
              { label: "Places max.", value: String(tenant.vehicles.featured.passengerMax ?? "—") },
            ]}
          />
          {enabledVehicles.length > 0 ? (
            <ul className="divide-y divide-[var(--pro-border)] rounded-xl border border-[var(--pro-border)]">
              {enabledVehicles.map((vehicle) => (
                <li key={vehicle.id} className="px-4 py-3 text-sm text-[var(--pro-text)]">
                  <span className="font-medium">{vehicle.name}</span>
                  <span className="mt-1 block text-[var(--pro-text-muted)]">
                    {[vehicle.headline, vehicle.passengerMax ? `${vehicle.passengerMax} places max.` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="SEO" description="Balises et référencement." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              { label: "Titre par défaut", value: displayValue(tenant.seo.defaultTitle) },
              { label: "Modèle de titre", value: displayValue(tenant.seo.titleTemplate) },
              { label: "Description", value: displayValue(tenant.seo.defaultDescription) },
              {
                label: "Mots-clés",
                value:
                  tenant.seo.keywords.length > 0 ? (
                    tenant.seo.keywords.join(", ")
                  ) : (
                    <span className="text-[var(--pro-text-muted)]">Non renseignés</span>
                  ),
              },
            ]}
          />
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Aperçu site" description="Liens utiles vers la vitrine publique." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              {
                label: "URL site",
                value: (
                  <Link href="/" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--pro-accent)] hover:underline">
                    Voir la vitrine publique
                  </Link>
                ),
              },
              {
                label: "Logo",
                value: displayValue(tenant.branding.logoSrc),
              },
              {
                label: "Couleur principale",
                value: (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-4 rounded border border-[var(--pro-border)]"
                      style={{ backgroundColor: tenant.branding.colors.primary }}
                    />
                    {tenant.branding.colors.primary}
                  </span>
                ),
              },
              {
                label: "Administration",
                value: <ProActionLink href="/pro/parametres">Ouvrir les paramètres</ProActionLink>,
              },
            ]}
          />
        </div>
      </ProPanel>
    </ProGuard>
  );
}
