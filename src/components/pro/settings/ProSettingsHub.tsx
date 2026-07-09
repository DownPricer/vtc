"use client";

import Link from "next/link";
import { ProPanel, ProSectionHeader } from "@/components/pro/ProUi";

const SHORTCUTS = [
  {
    href: "/pro/site",
    title: "Site internet",
    description: "Identité, coordonnées, présentation, services, véhicules et SEO.",
    cta: "Modifier le site",
  },
  {
    href: "/pro/tarifs",
    title: "Tarifs",
    description: "Paramètres utilisés par le calculateur : trajets, aéroports, majorations.",
    cta: "Modifier les tarifs",
  },
  {
    href: "/pro/stripe",
    title: "Stripe / Paiements",
    description: "Compte connecté, acomptes et encaissements en ligne.",
    cta: "Ouvrir Stripe",
  },
] as const;

export function ProSettingsHub() {
  return (
    <ProPanel>
      <ProSectionHeader
        title="Raccourcis"
        description="Accédez rapidement aux réglages principaux de votre activité."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-5 transition hover:border-[var(--pro-accent)]/40 hover:bg-[var(--pro-panel-muted)]"
          >
            <p className="text-base font-semibold text-[var(--pro-text)]">{item.title}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--pro-text-muted)]">{item.description}</p>
            <span className="mt-4 text-sm font-semibold text-[var(--pro-accent)] group-hover:underline">{item.cta}</span>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--pro-text-muted)]">
        Besoin d’options plus techniques (badges, FAQ, juridique) ? Consultez la section « Réglages avancés » ci-dessous.
      </p>
    </ProPanel>
  );
}
