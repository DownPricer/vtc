"use client";

import { useMemo } from "react";
import type { BadgePlacementId, IconKey } from "@/config/tenant-settings.types";
import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { ReadonlyListCard } from "../ReadonlyListCard";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { ProBadgeIcon } from "../editable/proBadgeIcon";
import type { SettingsTabsSharedProps } from "./context";

const PLACEMENT_LABELS: Record<BadgePlacementId, string> = {
  home_about_atouts: "Accueil — encart à propos",
  home_cta_guarantees: "Accueil — bloc CTA final",
  pricing_page_guarantees: "Page Tarifs — garanties",
  calculator_hero_guarantees: "Calculateur — bandeau garanties",
};

const ICON_OPTIONS: IconKey[] = [
  "id_card",
  "car",
  "credit_card",
  "globe",
  "clock",
  "luggage_check",
  "shield_check",
  "home",
  "check",
  "user_badge",
  "users",
  "building",
  "refresh",
  "calendar",
  "plane",
  "sparkle",
  "bank",
  "cash",
  "document",
  "ban",
];

const previewToneByIcon: Partial<Record<IconKey, string>> = {
  shield_check: "border-emerald-400/40 bg-emerald-500/12 text-[var(--pro-text)]",
  luggage_check: "border-sky-400/40 bg-sky-500/12 text-[var(--pro-text)]",
  sparkle: "border-orange-400/45 bg-orange-500/14 text-[var(--pro-text)]",
  plane: "border-violet-400/40 bg-violet-500/12 text-[var(--pro-text)]",
  cash: "border-amber-400/45 bg-amber-500/14 text-[var(--pro-text)]",
  credit_card: "border-blue-400/40 bg-blue-500/12 text-[var(--pro-text)]",
  bank: "border-slate-400/40 bg-slate-500/14 text-[var(--pro-text)]",
  ban: "border-red-400/45 bg-red-500/12 text-[var(--pro-text)]",
};

function getPreviewTone(iconKey: IconKey) {
  return previewToneByIcon[iconKey] ?? "border-orange-400/45 bg-orange-500/14 text-[var(--pro-text)]";
}

export function BadgesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const badgeById = useMemo(() => new Map(draft.badges.library.map((b) => [b.id, b] as const)), [draft.badges.library]);

  return (
    <div className="space-y-6">
      <SettingsCallout
        title="Bibliothèque des badges"
        description="Chaque badge peut être réutilisé sur plusieurs zones du site. Aperçu visuel ci-dessous."
        caption="Les emplacements précis restent dans la section avancée en bas de page."
      />

      <SettingsSectionCard title="Badges" description="Texte, icône et activation.">
        <ul className="space-y-4">
          {draft.badges.library.map((b, i) => (
            <li key={b.id}>
              <CollapsibleSettingsCard
                title={b.text?.trim() || "Badge sans texte"}
                subtitle="Pastille telle qu’affichée sur le site"
                defaultOpen={false}
                editing={editing}
                preview={
                  <div
                    className={`flex max-h-16 max-w-[10rem] items-center gap-2 rounded-full border px-2.5 py-2 text-xs font-medium shadow-sm ${getPreviewTone(b.iconKey)}`}
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-accent)]">
                      <ProBadgeIcon iconKey={b.iconKey} className="h-4 w-4" />
                    </span>
                  </div>
                }
                badge={
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      b.enabled
                        ? "border-emerald-400/35 bg-emerald-500/10 text-[var(--pro-text)]"
                        : "border-white/15 bg-[var(--pro-panel-muted)] text-[var(--pro-text-muted)]"
                    }`}
                  >
                    {b.enabled ? "Actif" : "Inactif"}
                  </span>
                }
              >
                <details className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 px-3 py-2 text-xs">
                  <summary className="cursor-pointer font-medium text-[var(--pro-text-soft)]">Identifiant technique (avancé)</summary>
                  <p className="mt-2 font-mono text-[11px] text-[var(--pro-text-muted)]">{b.id}</p>
                </details>

                <EditableSwitch
                  label="Badge actif"
                  checked={b.enabled}
                  onChange={(v) =>
                    setDraft((d) => {
                      const library = [...d.badges.library];
                      library[i] = { ...library[i], enabled: v };
                      return { ...d, badges: { ...d.badges, library } };
                    })
                  }
                  editing={editing}
                  hint="Inactif : masqué partout où la bibliothèque est filtrée."
                />

                <EditableField
                  label="Texte"
                  value={b.text}
                  onChange={(v) =>
                    setDraft((d) => {
                      const library = [...d.badges.library];
                      library[i] = { ...library[i], text: v };
                      return { ...d, badges: { ...d.badges, library } };
                    })
                  }
                  editing={editing}
                  hint="Promesse courte, lisible en un coup d’œil."
                />

                {editing ? (
                  <div>
                    <p className="mb-2 text-xs font-medium text-[var(--pro-text-muted)]">Icône</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {ICON_OPTIONS.map((k) => {
                        const selected = b.iconKey === k;
                        return (
                          <button
                            key={k}
                            type="button"
                            title={k}
                            onClick={() =>
                              setDraft((d) => {
                                const library = [...d.badges.library];
                                library[i] = { ...library[i], iconKey: k };
                                return { ...d, badges: { ...d.badges, library } };
                              })
                            }
                            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
                              selected
                                ? "border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
                                : "border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text-muted)] hover:border-[var(--pro-accent)]/40 hover:text-[var(--pro-text)]"
                            }`}
                          >
                            <ProBadgeIcon iconKey={k} className="h-6 w-6 text-current" />
                            <span className="w-full truncate text-[10px] font-medium leading-tight">{k}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[var(--pro-text-muted)]">
                    <ProBadgeIcon iconKey={b.iconKey} />
                    <span>Icône sélectionnée (voir mode édition pour changer).</span>
                  </div>
                )}
              </CollapsibleSettingsCard>
            </li>
          ))}
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard title="Emplacements" description="Où chaque badge apparaît sur le site (lecture seule).">
        <details className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--pro-text)]">Avancé — placements par zone</summary>
          <div className="mt-4 space-y-4">
            {(Object.keys(draft.badges.placements) as BadgePlacementId[]).map((pid) => (
              <ReadonlyListCard key={pid} title={PLACEMENT_LABELS[pid]} subtitle={pid}>
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  {draft.badges.placements[pid].map((item, idx) => {
                    const base = badgeById.get(item.badgeId);
                    const label = item.textOverride ?? base?.text ?? item.badgeId;
                    const iconKey = base?.iconKey ?? "check";
                    return (
                      <li key={`${pid}-${idx}`} className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${getPreviewTone(iconKey)}`}
                          >
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-accent)]">
                              <ProBadgeIcon iconKey={iconKey} className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 break-words">{label}</span>
                          </span>
                          <span className="font-mono text-[10px] text-[var(--pro-text-muted)]">{item.badgeId}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </ReadonlyListCard>
            ))}
          </div>
        </details>
      </SettingsSectionCard>
    </div>
  );
}
