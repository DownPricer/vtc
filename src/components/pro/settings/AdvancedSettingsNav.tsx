"use client";

import { ProIcon } from "@/components/pro/ProIcons";
import type { SettingsTabId } from "./SettingsTabs";
import { ADVANCED_SECTION_GROUPS, ADVANCED_SECTIONS } from "./advancedSections";

type SectionStatus = {
  dirty: boolean;
  error: boolean;
};

type AdvancedSettingsNavProps = {
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
  statusById: Partial<Record<SettingsTabId, SectionStatus>>;
};

function StatusDot({ status }: { status?: SectionStatus }) {
  if (status?.error) {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" title="Erreur à corriger" aria-label="Erreur à corriger" />;
  }
  if (status?.dirty) {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Modifié, non enregistré" aria-label="Modifié, non enregistré" />;
  }
  return null;
}

/** Navigation des réglages avancés : liste groupée collante (desktop) / pastilles défilantes (mobile). */
export function AdvancedSettingsNav({ active, onChange, statusById }: AdvancedSettingsNavProps) {
  return (
    <nav aria-label="Sections des réglages avancés">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden" role="tablist" aria-orientation="horizontal">
        {ADVANCED_SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(section.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
                  : "border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text-muted)] hover:text-[var(--pro-text)]"
              }`}
            >
              {section.label}
              <StatusDot status={statusById[section.id]} />
            </button>
          );
        })}
      </div>

      <div className="hidden space-y-5 lg:block">
        {ADVANCED_SECTION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">{group.label}</p>
            <ul className="space-y-1" role="tablist" aria-orientation="vertical">
              {group.sections.map((section) => {
                const isActive = section.id === active;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => onChange(section.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)] ${
                        isActive
                          ? "border-[var(--pro-accent)]/60 bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
                          : "border-transparent text-[var(--pro-text-muted)] hover:bg-[var(--pro-panel-muted)] hover:text-[var(--pro-text)]"
                      }`}
                    >
                      <ProIcon name={section.icon} className="h-[18px] w-[18px] shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{section.label}</span>
                      <StatusDot status={statusById[section.id]} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

type AdvancedSettingsOverviewProps = {
  onSelect: (id: SettingsTabId) => void;
};

/** Vue repliée : cartes cliquables qui ouvrent directement la bonne section. */
export function AdvancedSettingsOverview({ onSelect }: AdvancedSettingsOverviewProps) {
  return (
    <div className="mt-6 space-y-6">
      {ADVANCED_SECTION_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">{group.label}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className="group flex items-start gap-3 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 text-left transition hover:border-[var(--pro-accent)]/40 hover:bg-[var(--pro-panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]">
                  <ProIcon name={section.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--pro-text)] group-hover:text-[var(--pro-accent)]">{section.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[var(--pro-text-muted)]">{section.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
