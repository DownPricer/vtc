"use client";

import { useMemo, useState } from "react";
import type { SiteConfig } from "@/config/site.config";
import type { BadgePlacementId, TenantSettingsV1 } from "@/config/tenant-settings.types";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import { ComingSoonToolbar } from "./ComingSoonToolbar";
import { HelpTooltip } from "./HelpTooltip";
import { ReadonlyBadgeList } from "./ReadonlyBadgeList";
import { ReadonlyField } from "./ReadonlyField";
import { ReadonlyImagePreview } from "./ReadonlyImagePreview";
import { ReadonlyListCard } from "./ReadonlyListCard";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { type SettingsTabId, SettingsTabs } from "./SettingsTabs";
import type { ProSettingsMailMeta } from "./types";

const PLACEMENT_LABELS: Record<BadgePlacementId, string> = {
  home_about_atouts: "Accueil — encart « à propos » (atouts)",
  home_cta_guarantees: "Accueil — bloc CTA final (garanties)",
  pricing_page_guarantees: "Page vitrine /tarifs (pastilles)",
  calculator_hero_guarantees: "Calculateur — bandeau garanties (si affiché)",
};

type ProSettingsClientProps = {
  tenant: TenantSettingsV1;
  mailMeta: ProSettingsMailMeta;
  siteFeatures: SiteConfig["features"];
};

function ColorSwatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2">
      <span className="h-9 w-9 shrink-0 rounded-lg border border-white/15 shadow-inner" style={{ backgroundColor: hex }} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--pro-text)]">{label}</p>
        <p className="truncate font-mono text-[11px] text-[var(--pro-text-muted)]">{hex}</p>
      </div>
    </div>
  );
}

export function ProSettingsClient({ tenant, mailMeta, siteFeatures }: ProSettingsClientProps) {
  const [tab, setTab] = useState<SettingsTabId>("general");

  const badgeById = useMemo(() => new Map(tenant.badges.library.map((b) => [b.id, b] as const)), [tenant.badges.library]);

  const panel = (() => {
    switch (tab) {
      case "general":
        return (
          <div className="space-y-6">
            <SettingsSectionCard
              title="Identité & zone"
              description="Informations visibles par vos clients sur la vitrine."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Nom commercial" value={tenant.general.commercialName} />
                <ReadonlyField label="Raison sociale" value={tenant.general.legalName} />
                <ReadonlyField label="Tagline" value={tenant.general.tagline} />
                <ReadonlyField label="Région (SEO / textes)" value={tenant.general.regionLabel} />
                <ReadonlyField
                  label="Zone d’intervention (titre)"
                  value={tenant.general.serviceAreas.headline}
                  hint="Titre marketing de la zone couverte."
                />
                <ReadonlyField label="Description zone" value={tenant.general.serviceAreas.description} />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Villes / zones desservies</p>
                <ReadonlyBadgeList items={tenant.general.serviceAreas.cities.map((c) => ({ label: c, active: true }))} />
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Médias" description="Logo et image Open Graph utilisés pour le partage social.">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ReadonlyField label="Logo (chemin)" value={tenant.branding.logoSrc} mono />
                  <ReadonlyField label="Texte alternatif logo" value={tenant.branding.logoAlt} />
                  <ReadonlyImagePreview src={tenant.branding.logoSrc} alt={tenant.branding.logoAlt} caption="Aperçu logo" />
                </div>
                <div>
                  <ReadonlyField label="Image Open Graph" value={tenant.branding.ogImageSrc} mono />
                  <ReadonlyImagePreview src={tenant.branding.ogImageSrc} alt="Open Graph" caption="Aperçu image OG" />
                </div>
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Couleurs" description="Palette injectée en variables CSS sur la vitrine.">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(tenant.branding.colors).map(([key, hex]) => (
                  <ColorSwatch key={key} label={key} hex={hex} />
                ))}
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "home":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Fonctionnalités site (hors contenu page d’accueil)" description="Interrupteurs globaux — impactent d’autres pages.">
              <ReadonlyBadgeList
                items={[
                  { label: `Écran d’intro : ${siteFeatures.introScreen ? "activé" : "désactivé"}` },
                  { label: `Mini-jeu : ${siteFeatures.miniGame ? "activé" : "désactivé"}` },
                  { label: `Page radio : ${siteFeatures.radioPage ? "activée" : "désactivée"}` },
                  { label: `Section radio (accueil) : ${siteFeatures.radioHomeSection ? "activée" : "désactivée"}` },
                  { label: `Bouton radio flottant : ${siteFeatures.floatingRadioButton ? "activé" : "désactivé"}` },
                  { label: `PayPal (réservation) : ${siteFeatures.payPal ? "activé" : "désactivé"}` },
                ]}
              />
            </SettingsSectionCard>
            <SettingsSectionCard title="Hero" description="Bloc principal en tête de la page d’accueil.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Image de fond" value={tenant.home.hero.backgroundImageSrc} mono />
                <ReadonlyField label="Texte alternatif image" value={tenant.home.hero.imageAlt} />
                <ReadonlyField label="Badge" value={tenant.home.hero.badgeText} />
                <ReadonlyField label="Titre (ligne 1)" value={tenant.home.hero.titleLine1} />
                <ReadonlyField label="Titre (mise en avant)" value={tenant.home.hero.titleHighlight} />
                <ReadonlyField label="Sous-titre" value={tenant.home.hero.subtitle} />
                <ReadonlyField label="Puces / promesse" value={tenant.home.hero.bullets} />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Call-to-action</p>
                <ul className="space-y-2">
                  {tenant.home.hero.ctas.map((c) => (
                    <li key={c.id}>
                      <ReadonlyListCard title={c.label} subtitle={c.href} meta={c.enabled ? "Actif" : "Inactif"}>
                        <p className="text-xs text-[var(--pro-text-muted)]">Identifiant interne : {c.id}</p>
                      </ReadonlyListCard>
                    </li>
                  ))}
                </ul>
              </div>
              <ReadonlyImagePreview src={tenant.home.hero.backgroundImageSrc} alt={tenant.home.hero.imageAlt} caption="Aperçu hero" />
            </SettingsSectionCard>
            <SettingsSectionCard title="Sections page d’accueil" description="Blocs de contenu configurés dans la config centrale.">
              <ReadonlyBadgeList
                items={[
                  { label: `Bloc « engagements » : ${tenant.home.commitments.items.some((i) => i.enabled) ? "affiché" : "vide"}` },
                  { label: `Vidéo promo : ${tenant.home.video.enabled ? "activée" : "désactivée"}` },
                  { label: `Moyens de paiement : ${tenant.home.paymentMethods.enabled ? "affichés" : "masqués"}` },
                  { label: `CTA final : ${tenant.home.ctaFinal.enabled ? "affiché" : "masqué"}` },
                  { label: `Témoignages (section) : ${tenant.testimonials.enabled ? "activés" : "désactivés"}` },
                  { label: `Transferts populaires (accueil) : ${tenant.pricingDisplay.highlights.popularTransfersEnabled ? "oui" : "non"}` },
                  { label: `Mise à disposition (encart accueil) : ${tenant.pricingDisplay.highlights.madEnabled ? "oui" : "non"}` },
                ]}
              />
            </SettingsSectionCard>
            <SettingsSectionCard title="Vidéo" description="Lecteur et messages associés.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Sous-titre (eyebrow)" value={tenant.home.video.eyebrow} />
                <ReadonlyField label="Titre (préfixe)" value={tenant.home.video.titlePrefix} />
                <ReadonlyField label="Affiche marque dans le titre" value={tenant.home.video.titleBrand} />
                <ReadonlyField label="Description" value={tenant.home.video.description} />
                <ReadonlyField label="Poster" value={tenant.home.video.posterSrc} mono />
                <ReadonlyField label="Fichier vidéo" value={tenant.home.video.videoSrc} mono />
              </div>
              <ReadonlyImagePreview src={tenant.home.video.posterSrc} alt="Poster vidéo" />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Marqueurs sous la vidéo</p>
                <div className="grid gap-2 md:grid-cols-3">
                  {tenant.home.video.markers
                    .filter((m) => m.enabled)
                    .map((m) => (
                      <ReadonlyListCard key={m.id} title={m.label} subtitle={m.sub} meta={`Icône : ${m.iconKey}`}>
                        <p className="text-xs text-[var(--pro-text-muted)]">ID : {m.id}</p>
                      </ReadonlyListCard>
                    ))}
                </div>
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Mise à disposition (accueil)" description="Encart tarifaire sur la page d’accueil.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Prix à partir de (€/h)" value={tenant.pricingDisplay.highlights.madHourlyFrom} />
                <ReadonlyField label="Sous-titre" value={tenant.pricingDisplay.highlights.madSubtitle} />
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Paiements (accueil)" description="Cartes moyens de paiement.">
              <ReadonlyField label="Bloc activé" value={tenant.home.paymentMethods.enabled} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Sur-titre" value={tenant.home.paymentMethods.eyebrow} />
                <ReadonlyField label="Titre" value={tenant.home.paymentMethods.title} />
                <ReadonlyField label="Sous-titre" value={tenant.home.paymentMethods.subtitle} />
              </div>
              <ul className="space-y-2">
                {tenant.home.paymentMethods.items.map((p) => (
                  <li key={p.id}>
                    <ReadonlyListCard title={p.label} subtitle={p.sub} meta={p.enabled ? "Actif" : "Inactif"}>
                      <p className="text-xs text-[var(--pro-text-muted)]">Icône : {p.iconKey}</p>
                    </ReadonlyListCard>
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
            <SettingsSectionCard title="CTA final" description="Dernière section avant pied de page.">
              <ReadonlyField label="Bloc activé" value={tenant.home.ctaFinal.enabled} />
              <ReadonlyField label="Image de fond" value={tenant.home.ctaFinal.backgroundImageSrc} mono />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Sur-titre" value={tenant.home.ctaFinal.eyebrow} />
                <ReadonlyField label="Titre" value={tenant.home.ctaFinal.title} />
                <ReadonlyField label="Titre (mise en avant)" value={tenant.home.ctaFinal.titleHighlight} />
                <ReadonlyField label="Sous-titre" value={tenant.home.ctaFinal.subtitle} />
                <ReadonlyField label="Libellé téléphone" value={tenant.home.ctaFinal.phoneLabel} />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Boutons</p>
                <ul className="space-y-2">
                  {tenant.home.ctaFinal.ctas.map((c) => (
                    <li key={c.id}>
                      <ReadonlyListCard title={c.label} subtitle={c.href} meta={c.enabled ? "Actif" : "Inactif"} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Garanties (références badges)</p>
                <ReadonlyBadgeList
                  items={tenant.home.ctaFinal.guarantees.map((g) => ({
                    label: g.badgeId,
                    active: g.enabled,
                  }))}
                />
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "calculator":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <p className="font-medium">Lecture seule</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
                Ces paramètres décrivent le formulaire calculateur tel qu’il est exposé aujourd’hui. Le moteur de tarification, les appels API et les
                charges utiles ne sont pas modifiés depuis cet écran.
              </p>
            </div>
            <SettingsSectionCard title="Types de prestation proposés" description="Cartes de choix du type de service.">
              <ul className="space-y-2">
                {tenant.calculatorDisplay.serviceTypes.map((s) => (
                  <li key={s.id}>
                    <ReadonlyListCard title={s.label} subtitle={s.sublabel} meta={s.enabled ? "Actif" : "Inactif"} />
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
            <SettingsSectionCard title="Limites passagers & bagages" description="Contraintes du stepper / listes du formulaire.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField
                  label="Passagers max."
                  value={tenant.calculatorDisplay.maxPassengers}
                  hint="Correspond au stepper « Nombre de passagers » (1 à N)."
                />
                <ReadonlyField
                  label="Bagages max. (indice)"
                  value={tenant.calculatorDisplay.maxBaggageIndex}
                  hint="0 = aucun, jusqu’à N bagages inclus (liste déroulante)."
                />
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Aéroports configurés (liste calculateur)" description="Libellés et adresses utilisés dans le sélecteur.">
              <ul className="space-y-2">
                {tenant.calculatorDisplay.airports.map((a) => (
                  <li key={a.code}>
                    <ReadonlyListCard title={a.label} subtitle={`Code : ${a.code}`}>
                      <p className="text-xs leading-relaxed text-[var(--pro-text-muted)]">{a.address}</p>
                    </ReadonlyListCard>
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
            <SettingsSectionCard title="Options extras" description="Cases à cocher « besoins spécifiques ».">
              <ul className="space-y-2">
                {tenant.calculatorDisplay.extrasOptions.map((e) => (
                  <li key={e.id}>
                    <ReadonlyListCard title={e.label} meta={e.enabled ? "Proposée" : "Masquée"}>
                      <p className="text-xs text-[var(--pro-text-muted)]">ID : {e.id}</p>
                    </ReadonlyListCard>
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Transferts populaires (accueil)" description="Grille « Nos transferts les plus demandés ».">
              <ReadonlyField label="Section activée" value={tenant.pricingDisplay.highlights.popularTransfersEnabled} />
              <ul className="space-y-2">
                {tenant.pricingDisplay.highlights.popularTransfers
                  .filter((t) => t.enabled)
                  .map((t) => (
                    <li key={t.id}>
                      <ReadonlyListCard
                        title={`${t.depart} → ${t.destination}`}
                        subtitle={`Code ${t.code} · ${t.duree}`}
                        meta={t.featured ? "Mis en avant" : ""}
                      >
                        <p className="text-xs text-[var(--pro-text-muted)]">
                          Aller : {t.prixAller} € · A/R : {t.prixAR} €
                        </p>
                      </ReadonlyListCard>
                    </li>
                  ))}
              </ul>
            </SettingsSectionCard>
            <SettingsSectionCard title="Page /tarifs (vitrine)" description="Cartes indicatives — hors moteur de calcul.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Badge hero" value={tenant.pricingDisplay.tarifsPage.heroBadge} />
                <ReadonlyField label="Titre" value={`${tenant.pricingDisplay.tarifsPage.heroTitle} ${tenant.pricingDisplay.tarifsPage.heroTitleHighlight}`} />
              </div>
              <ReadonlyField label="Introduction" value={tenant.pricingDisplay.tarifsPage.heroIntro} />
              <ReadonlyField label="Mise à disposition — titre" value={tenant.pricingDisplay.tarifsPage.madTitle} />
              <ReadonlyField label="Mise à disposition — sous-titre" value={tenant.pricingDisplay.tarifsPage.madSubtitle} />
              <ReadonlyField label="Mise à disposition — véhicule (texte)" value={tenant.pricingDisplay.tarifsPage.madVehicleHint} />
              <ReadonlyField label="Mise à disposition — €/h (affiché)" value={tenant.pricingDisplay.tarifsPage.madHourlyFrom} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="CTA primaire" value={tenant.pricingDisplay.tarifsPage.ctaPrimaryLabel} />
                <ReadonlyField label="CTA secondaire" value={tenant.pricingDisplay.tarifsPage.ctaSecondaryLabel} />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Transferts (cartes)</p>
                <ul className="space-y-2">
                  {tenant.pricingDisplay.tarifsPage.transfers
                    .filter((t) => t.enabled)
                    .map((t) => (
                      <li key={t.id}>
                        <ReadonlyListCard
                          title={`${t.depart} → ${t.destination}`}
                          subtitle={`${t.km} · ${t.duree}`}
                          meta={t.featured ? "Populaire" : ""}
                        >
                          <p className="text-xs text-[var(--pro-text-muted)]">
                            Aller {t.prixAller} € · A/R {t.prixAR} € · Code {t.code}
                          </p>
                        </ReadonlyListCard>
                      </li>
                    ))}
                </ul>
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Garanties (page /tarifs)" description="Pastilles sous le hero — références aux badges.">
              <ReadonlyBadgeList
                items={tenant.pricingDisplay.tarifsPage.guarantees.map((g) => ({
                  label: `${g.badgeId}${g.enabled ? "" : " (off)"}`,
                  active: g.enabled,
                }))}
              />
            </SettingsSectionCard>
            <SettingsSectionCard title="Couleurs pastilles codes aéroports" description="Classes Tailwind utilisées pour ORY/CDG/…">
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(tenant.pricingDisplay.codeColors).map(([code, cls]) => (
                  <ReadonlyField key={code} label={code} value={`${cls.bg} · ${cls.text} · ${cls.dot}`} mono />
                ))}
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "services":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Hero page services" description="Bandeau supérieur de /services.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Image" value={tenant.services.pageHero.imageSrc} mono />
                <ReadonlyField label="Texte alternatif" value={tenant.services.pageHero.imageAlt} />
                <ReadonlyField label="Sur-titre" value={tenant.services.pageHero.eyebrow} />
                <ReadonlyField label="Titre" value={`${tenant.services.pageHero.title} ${tenant.services.pageHero.titleHighlight}`} />
              </div>
              <ReadonlyField label="Introduction" value={tenant.services.pageHero.intro} />
              <ReadonlyImagePreview src={tenant.services.pageHero.imageSrc} alt={tenant.services.pageHero.imageAlt} />
            </SettingsSectionCard>
            <SettingsSectionCard title="Liste des services" description="Cartes présentées sur /services.">
              <ul className="space-y-3">
                {tenant.services.items.map((s) => (
                  <li key={s.id}>
                    <ReadonlyListCard title={`${s.num} — ${s.title}`} subtitle={s.href} meta={s.enabled ? "Actif" : "Inactif"}>
                      <p className="text-sm leading-relaxed">{s.description}</p>
                      <p className="mt-2 text-xs text-[var(--pro-text-muted)]">CTA : {s.ctaLabel}</p>
                      <div className="mt-2">
                        <ReadonlyBadgeList items={s.tags.map((t) => ({ label: t }))} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Icône : {s.iconKey}</p>
                    </ReadonlyListCard>
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
            <SettingsSectionCard title="Bloc confort" description="Encart véhicule en bas de page.">
              <ReadonlyField label="Sur-titre" value={tenant.services.comfortBlock.eyebrow} />
              <ReadonlyField label="Véhicule" value={tenant.services.comfortBlock.vehicleName} />
              <ReadonlyField label="Texte" value={tenant.services.comfortBlock.bullets} />
              <ReadonlyBadgeList items={tenant.services.comfortBlock.paymentChips.map((c) => ({ label: c }))} />
            </SettingsSectionCard>
          </div>
        );

      case "vehicles":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Véhicule mis en avant" description="Référencé sur la vitrine (galerie, textes).">
              <ReadonlyField label="ID interne" value={tenant.vehicles.featuredVehicleId} mono />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Nom" value={tenant.vehicles.featured.name} />
                <ReadonlyField label="Passagers max." value={tenant.vehicles.featured.passengerMax} />
              </div>
              <ReadonlyField label="Accroche" value={tenant.vehicles.featured.headline} />
              <ReadonlyField label="Équipements / détail" value={tenant.vehicles.featured.highlightText ?? "—"} />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Paiements affichés (puces)</p>
                <ReadonlyBadgeList items={tenant.vehicles.featured.paymentChips.map((c) => ({ label: c }))} />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Photos</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tenant.vehicles.featured.gallery.map((g, i) => (
                    <ReadonlyImagePreview key={`${g.src}-${i}`} src={g.src} alt={g.alt} caption={g.tag} />
                  ))}
                </div>
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "badges":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Bibliothèque" description="Texte, icône logique (clé), état.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--pro-border)] text-xs uppercase tracking-wide text-[var(--pro-text-muted)]">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Texte</th>
                      <th className="py-2 pr-3">Icône (key)</th>
                      <th className="py-2 pr-3">Variant</th>
                      <th className="py-2">Actif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenant.badges.library.map((b) => (
                      <tr key={b.id} className="border-b border-[var(--pro-border)]/70">
                        <td className="py-2 pr-3 font-mono text-xs">{b.id}</td>
                        <td className="py-2 pr-3">{b.text}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{b.iconKey}</td>
                        <td className="py-2 pr-3 text-[var(--pro-text-muted)]">Texte + icône</td>
                        <td className="py-2">{b.enabled ? "Oui" : "Non"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Placements" description="Où les badges sont réutilisés sur la vitrine.">
              <div className="space-y-4">
                {(Object.keys(tenant.badges.placements) as BadgePlacementId[]).map((pid) => (
                  <ReadonlyListCard key={pid} title={PLACEMENT_LABELS[pid]} subtitle={pid}>
                    <ol className="list-decimal space-y-1 pl-5 text-sm">
                      {tenant.badges.placements[pid].map((item, idx) => {
                        const base = badgeById.get(item.badgeId);
                        const label = item.textOverride ?? base?.text ?? item.badgeId;
                        return (
                          <li key={`${pid}-${idx}`}>
                            <span className="font-medium">{label}</span>
                            <span className="text-[var(--pro-text-muted)]"> · ref. {item.badgeId}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </ReadonlyListCard>
                ))}
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "testimonials":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="En-tête section" description="Titres affichés sur l’accueil.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Section activée" value={tenant.testimonials.enabled} />
                <ReadonlyField label="Sur-titre" value={tenant.testimonials.eyebrow} />
                <ReadonlyField label="Titre" value={`${tenant.testimonials.title} ${tenant.testimonials.titleHighlight}`} />
                <ReadonlyField label="Note affichée" value={tenant.testimonials.ratingValueText} />
                <ReadonlyField label="Libellé note" value={tenant.testimonials.ratingLabel} />
                <ReadonlyField label="Libellé compteur" value={tenant.testimonials.ratingCountLabel} />
                <ReadonlyField label="Lien avis (URL)" value={tenant.testimonials.reviewsUrl ?? "—"} />
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Avis" description="Cartes défilantes.">
              <ul className="space-y-3">
                {tenant.testimonials.items.map((t) => (
                  <li key={t.id}>
                    <ReadonlyListCard title={t.author} subtitle={t.trajet ?? ""} meta={`${t.rating}/5 · ${t.enabled ? "actif" : "inactif"}`}>
                      <p className="text-sm leading-relaxed">« {t.text} »</p>
                      <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Date affichée : {t.date ?? "—"}</p>
                    </ReadonlyListCard>
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
          </div>
        );

      case "faq":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Paramètres page" description="Bandeau / FAQ activée.">
              <ReadonlyField label="FAQ activée" value={tenant.faq.enabled} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Sur-titre" value={tenant.faq.pageHero.eyebrow} />
                <ReadonlyField label="Titre" value={`${tenant.faq.pageHero.title} ${tenant.faq.pageHero.titleHighlight}`} />
              </div>
              <ReadonlyField label="Intro (modèle)" value={tenant.faq.pageHero.introTemplate} />
            </SettingsSectionCard>
            <SettingsSectionCard title="Questions / réponses" description="Ordre = ordre du tableau (1, 2, 3…).">
              <ul className="space-y-3">
                {tenant.faq.items.map((f, index) => (
                  <li key={f.id}>
                    <ReadonlyListCard title={`#${index + 1} — ${f.question}`} meta={f.enabled ? "Actif" : "Inactif"}>
                      <p className="text-sm leading-relaxed">{f.answer}</p>
                      <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Icône : {f.iconKey}</p>
                    </ReadonlyListCard>
                  </li>
                ))}
              </ul>
            </SettingsSectionCard>
            <SettingsSectionCard title="CTA bas de page" description="Liens proposés après la liste.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Texte manquant" value={tenant.faq.cta.missingAnswerText} />
                <ReadonlyField label="Bouton 1" value={tenant.faq.cta.primaryLabel} />
                <ReadonlyField label="Lien 1" value={tenant.faq.cta.primaryHref} mono />
                <ReadonlyField label="Bouton 2" value={tenant.faq.cta.secondaryLabel} />
                <ReadonlyField label="Lien 2" value={tenant.faq.cta.secondaryHref} mono />
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Coordonnées publiques (vitrine)" description="Affichées sur contact, pied de page, etc.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Téléphone affiché" value={tenant.contact.phoneDisplay} />
                <ReadonlyField label="Téléphone E.164" value={tenant.contact.phoneE164} mono />
                <ReadonlyField label="WhatsApp (chiffres)" value={tenant.contact.whatsappDigits ?? "—"} mono />
                <ReadonlyField label="E-mail public" value={tenant.contact.emailPublic} />
              </div>
              <ReadonlyField label="Préremplissage WhatsApp" value={tenant.contact.whatsappPrefillText} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Adresse — rue" value={tenant.contact.address.street} />
                <ReadonlyField label="Code postal" value={tenant.contact.address.postalCode} />
                <ReadonlyField label="Ville" value={tenant.contact.address.city} />
                <ReadonlyField label="Pays" value={tenant.contact.address.country} />
                <ReadonlyField label="Latitude" value={tenant.contact.address.latitude} />
                <ReadonlyField label="Longitude" value={tenant.contact.address.longitude} />
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard
              title="Routage e-mails (hébergement)"
              description="Variables d’environnement côté serveur. Aucun mot de passe ni secret n’est affiché."
            >
              <ReadonlyField
                label="MAIL_TO (réception opérateur)"
                value={mailMeta.mailTo ?? "—"}
                hint="Destinataire principal des formulaires. Peut être différent de l’e-mail public."
              />
              <ReadonlyField label="MAIL_TO_COPY (copie)" value={mailMeta.mailToCopy ?? "—"} />
              <ReadonlyField label="MAIL_REPLY_TO" value={mailMeta.mailReplyTo ?? "—"} />
              <ReadonlyField label="MAIL_SEND_CUSTOMER_CONFIRMATION (brut)" value={mailMeta.customerConfirmationEnv || "—"} mono />
              <ReadonlyField label="Accusé client au voyageur (effectif)" value={mailMeta.customerConfirmationEffective} />
              <ReadonlyField
                label="Préférence site (repli)"
                value={siteFeatures.sendCustomerConfirmationEmail}
                hint="Utilisée si la variable d’environnement n’est pas positionnée."
              />
            </SettingsSectionCard>
          </div>
        );

      case "seo":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Métadonnées" description="Champs SEO principaux de la configuration centrale.">
              <ReadonlyField label="Titre par défaut" value={tenant.seo.defaultTitle} />
              <ReadonlyField label="Modèle de titre" value={tenant.seo.titleTemplate} />
              <ReadonlyField label="Description par défaut" value={tenant.seo.defaultDescription} />
              <ReadonlyField label="Locale Open Graph" value={tenant.seo.openGraphLocale} />
              <ReadonlyField label="Catégorie" value={tenant.seo.category} />
              <ReadonlyField label="Région (libellé)" value={tenant.general.regionLabel} hint="Utilisé dans plusieurs textes et SEO." />
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">
                  Mots-clés
                  <HelpTooltip text="Liste utilisée pour les balises meta keywords et la cohérence des textes." />
                </p>
                <ReadonlyBadgeList items={tenant.seo.keywords.map((k) => ({ label: k }))} />
              </div>
            </SettingsSectionCard>
          </div>
        );

      case "legal":
        return (
          <div className="space-y-6">
            <SettingsSectionCard title="Société & obligations" description="Informations affichées aux mentions légales.">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField label="Nom affiché" value={tenant.legal.displayName} />
                <ReadonlyField label="Représentant légal" value={tenant.legal.legalRepresentative} />
                <ReadonlyField label="SIRET" value={tenant.legal.siret} />
                <ReadonlyField label="Licence VTC" value={tenant.legal.vtcLicenseNumber} />
              </div>
            </SettingsSectionCard>
            <SettingsSectionCard title="Hébergeur" description="Prestataire d’hébergement du site.">
              <ReadonlyField label="Nom" value={tenant.legal.hosting.name} />
              <ReadonlyField label="Adresse" value={tenant.legal.hosting.address} />
              <ReadonlyField label="Site web" value={tenant.legal.hosting.website} mono />
            </SettingsSectionCard>
            <SettingsSectionCard title="Confidentialité (résumé)" description="Texte court — à compléter juridiquement.">
              <p className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm leading-relaxed text-[var(--pro-text-soft)]">
                {tenant.legal.privacySummary}
              </p>
            </SettingsSectionCard>
          </div>
        );

      default:
        return null;
    }
  })();

  return (
    <ProGuard>
      <ProShell>
        <ProNav />
        <ProPanel>
          <ProSectionHeader
            eyebrow="Configuration"
            title="Paramètres du site"
            description="Vue lecture seule des contenus centralisés. L’édition et la sauvegarde arriveront dans une prochaine étape."
            action={<ComingSoonToolbar />}
          />
          <div className="mt-6 space-y-5">
            <SettingsTabs active={tab} onChange={setTab} />
            <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 md:p-6">{panel}</div>
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
