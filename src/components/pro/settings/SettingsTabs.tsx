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
  calculator: "Tarifs / Calculateur",
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
  const activeLabel = TAB_LABELS[active];
  return (
    <div className="space-y-4">
      <div className="md:hidden">
        <label htmlFor="settings-section-select" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">
          Choisir une section
        </label>
        <select
          id="settings-section-select"
          value={active}
          onChange={(event) => onChange(event.target.value as SettingsTabId)}
          className="w-full rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2.5 text-sm font-medium text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none"
        >
          {SETTINGS_TAB_IDS.map((id) => (
            <option key={id} value={id}>
              {TAB_LABELS[id]}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Section active : {activeLabel}</p>
      </div>

      <div className="hidden rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-3 md:block">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {SETTINGS_TAB_IDS.map((id) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={`rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
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
      </div>
    </div>
  );
}
