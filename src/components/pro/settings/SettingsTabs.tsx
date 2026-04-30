"use client";

export const SETTINGS_TAB_IDS = [
  "general",
  "appearance",
  "home",
  "calculator",
  "pricing",
  "services",
  "vehicles",
  "badges",
  "testimonials",
  "faq",
  "contact",
  "seo",
  "legal",
] as const;

export type SettingsTabId = (typeof SETTINGS_TAB_IDS)[number];

const TAB_LABELS: Record<SettingsTabId, string> = {
  general: "Général",
  appearance: "Apparence",
  home: "Accueil",
  calculator: "Calculateur",
  pricing: "Tarifs affichés",
  services: "Services",
  vehicles: "Véhicules",
  badges: "Badges",
  testimonials: "Témoignages",
  faq: "FAQ",
  contact: "Contact & e-mails",
  seo: "SEO",
  legal: "Légal",
};

type SettingsTabsProps = {
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
};

export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--pro-border)] pb-4">
      {SETTINGS_TAB_IDS.map((id) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              isActive
                ? "border border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
                : "border border-transparent text-[var(--pro-text-muted)] hover:border-[var(--pro-border)] hover:bg-[var(--pro-panel-muted)] hover:text-[var(--pro-text)]"
            }`}
          >
            {TAB_LABELS[id]}
          </button>
        );
      })}
    </div>
  );
}
