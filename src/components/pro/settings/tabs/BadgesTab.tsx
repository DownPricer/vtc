"use client";

import { useMemo } from "react";
import type { BadgePlacementId, IconKey } from "@/config/tenant-settings.types";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyListCard } from "../ReadonlyListCard";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import type { SettingsTabsSharedProps } from "./context";

const PLACEMENT_LABELS: Record<BadgePlacementId, string> = {
  home_about_atouts: "Accueil — encart « à propos » (atouts)",
  home_cta_guarantees: "Accueil — bloc CTA final (garanties)",
  pricing_page_guarantees: "Page vitrine /tarifs (pastilles)",
  calculator_hero_guarantees: "Calculateur — bandeau garanties (si affiché)",
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

export function BadgesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const badgeById = useMemo(() => new Map(draft.badges.library.map((b) => [b.id, b] as const)), [draft.badges.library]);

  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Bibliothèque" description="Texte, icône logique (clé), état.">
        <ul className="space-y-4">
          {draft.badges.library.map((b, i) => (
            <li key={b.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
              <p className="font-mono text-xs text-[var(--pro-text-muted)]">{b.id}</p>
              <EditableSwitch
                label="Activé"
                checked={b.enabled}
                onChange={(v) =>
                  setDraft((d) => {
                    const library = [...d.badges.library];
                    library[i] = { ...library[i], enabled: v };
                    return { ...d, badges: { ...d.badges, library } };
                  })
                }
                editing={editing}
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
              />
              {editing ? (
                <label className="block text-xs font-medium text-[var(--pro-text-muted)]">
                  Icône (key)
                  <select
                    value={b.iconKey}
                    onChange={(e) =>
                      setDraft((d) => {
                        const library = [...d.badges.library];
                        library[i] = { ...library[i], iconKey: e.target.value as IconKey };
                        return { ...d, badges: { ...d.badges, library } };
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)]"
                  >
                    {ICON_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-xs text-[var(--pro-text-muted)]">Icône : {b.iconKey}</p>
              )}
              <p className="text-xs text-[var(--pro-text-muted)]">Variant affichage : texte + icône (fixe vitrine)</p>
            </li>
          ))}
        </ul>
      </SettingsSectionCard>
      <SettingsSectionCard title="Placements" description="Lecture seule — ordre et associations sur la vitrine.">
        <div className="space-y-4">
          {(Object.keys(draft.badges.placements) as BadgePlacementId[]).map((pid) => (
            <ReadonlyListCard key={pid} title={PLACEMENT_LABELS[pid]} subtitle={pid}>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {draft.badges.placements[pid].map((item, idx) => {
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
}
