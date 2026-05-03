"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { rgbString } from "@/lib/branding/colorUtils";

type SiteDraftPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  draft: TenantSettingsV1;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--pro-text-muted)] mb-3">{title}</h3>
      {children}
    </section>
  );
}

export function SiteDraftPreviewModal({ open, onClose, draft }: SiteDraftPreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const P = draft.branding.colors.primary;
  const pSoft = (a: number) => rgbString(P, a);
  const faqCount = draft.faq.items.filter((x) => x.enabled).length;
  const testimonialCount = draft.testimonials.items.filter((x) => x.enabled).length;
  const serviceCount = draft.services.items.filter((x) => x.enabled).length;
  const tp = draft.pricingDisplay.tarifsPage;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="site-draft-preview-title">
      <button type="button" className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" onClick={onClose} aria-label="Fermer l’aperçu" />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] shadow-2xl sm:rounded-2xl sm:max-h-[88vh]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--pro-border)] px-5 py-4">
          <div>
            <h2 id="site-draft-preview-title" className="text-base font-bold text-[var(--pro-text)]">
              Aperçu vitrine (brouillon)
            </h2>
            <p className="text-xs text-[var(--pro-text-muted)] mt-0.5">Données non enregistrées incluses · rendu indicatif</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--pro-text-muted)] hover:bg-white/5 hover:text-[var(--pro-text)]"
          >
            Fermer
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Section title="Identité & couleurs">
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/30">
                <Image src={draft.branding.logoSrc} alt={draft.branding.logoAlt} fill className="object-contain p-1" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--pro-text)] truncate">{draft.general.commercialName}</p>
                <p className="text-sm text-[var(--pro-text-muted)] truncate">{draft.general.tagline}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="h-6 w-10 rounded-md border border-white/10 shadow-inner" style={{ backgroundColor: pSoft(0.85) }} title="Primaire" />
                  <span
                    className="h-6 w-10 rounded-md border border-white/10 shadow-inner"
                    style={{ backgroundColor: rgbString(draft.branding.colors.accentHighlight, 0.9) }}
                    title="Accent"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Contact">
            <p className="text-sm text-[var(--pro-text)]">{draft.contact.phoneDisplay}</p>
            <p className="text-sm text-[var(--pro-text-muted)] truncate">{draft.contact.emailPublic}</p>
          </Section>

          <Section title="Hero accueil">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90 mb-1">{draft.home.hero.badgeText}</p>
            <p className="text-lg font-bold text-[var(--pro-text)] leading-snug">
              {draft.home.hero.titleLine1}{" "}
              <span style={{ color: pSoft(1) }}>{draft.home.hero.titleHighlight}</span>
            </p>
            <p className="mt-2 text-sm text-[var(--pro-text-muted)] line-clamp-3">{draft.home.hero.subtitle}</p>
          </Section>

          <Section title="À propos (aperçu)">
            <p className="text-sm font-medium text-[var(--pro-text)]">{draft.home.aboutPreview.driverDisplayName}</p>
            <p className="text-xs text-[var(--pro-text-muted)]">{draft.home.aboutPreview.roleLabel}</p>
            <p className="text-xs text-[var(--pro-text-muted)] mt-1">{draft.home.aboutPreview.vehicleLabel}</p>
          </Section>

          <Section title="Services">
            <p className="text-sm font-semibold text-[var(--pro-text)]">
              {draft.services.pageHero.title}{" "}
              <span className="text-primary">{draft.services.pageHero.titleHighlight}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--pro-text-muted)]">{serviceCount} carte(s) activée(s)</p>
          </Section>

          <Section title="FAQ">
            <p className="text-sm text-[var(--pro-text)]">{draft.faq.enabled ? `${faqCount} question(s) affichée(s)` : "Bloc FAQ désactivé"}</p>
            <p className="text-xs text-[var(--pro-text-muted)] line-clamp-2 mt-1">{draft.faq.pageHero.title}</p>
          </Section>

          <Section title="Témoignages">
            <p className="text-sm text-[var(--pro-text)]">
              {draft.testimonials.enabled ? `${testimonialCount} avis activé(s)` : "Bloc témoignages désactivé"}
            </p>
          </Section>

          <Section title="Page Tarifs (textes)">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90">{tp.heroBadge}</p>
            <p className="mt-1 text-base font-bold text-[var(--pro-text)]">
              {tp.heroTitle} <span className="text-primary">{tp.heroTitleHighlight}</span>
            </p>
            <p className="mt-2 text-xs text-[var(--pro-text-muted)] line-clamp-3">{tp.heroIntro}</p>
          </Section>

          <Section title="Calculateur (brouillon)">
            <p className="text-xs text-[var(--pro-text-muted)] mb-2">
              <span className="font-medium text-[var(--pro-text)]">Base / dépôt (vtcBaseAddress) :</span>{" "}
              {draft.calculatorDisplay.vtcBaseAddress?.trim() || "—"}
            </p>
            <p className="text-xs text-[var(--pro-text-muted)]">
              {draft.calculatorDisplay.serviceTypes.filter((s) => s.enabled).length} type(s) de prestation coché(s) dans les paramètres.
              Le tarif affiché sur le site vient du moteur côté serveur (API centrale) ; cette section résume seulement vos libellés et
              options du brouillon.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
