"use client";

import { useMemo } from "react";
import type { BadgePlacementId, IconKey } from "@/config/tenant-settings.types";
import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyListCard } from "../ReadonlyListCard";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import type { SettingsTabsSharedProps } from "./context";

const PLACEMENT_LABELS: Record<BadgePlacementId, string> = {
  home_about_atouts: "Accueil - encart a propos",
  home_cta_guarantees: "Accueil - bloc CTA final",
  pricing_page_guarantees: "Page Tarifs - garanties",
  calculator_hero_guarantees: "Calculateur - bandeau garanties",
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
  shield_check: "border-emerald-300/70 bg-emerald-50 text-emerald-700",
  luggage_check: "border-sky-300/70 bg-sky-50 text-sky-700",
  sparkle: "border-orange-300/70 bg-orange-50 text-orange-700",
  plane: "border-violet-300/70 bg-violet-50 text-violet-700",
  cash: "border-amber-300/70 bg-amber-50 text-amber-700",
  credit_card: "border-blue-300/70 bg-blue-50 text-blue-700",
  bank: "border-slate-300/70 bg-slate-50 text-slate-700",
  ban: "border-red-300/70 bg-red-50 text-red-700",
};

const iconGlyphByKey: Record<IconKey, string> = {
  id_card: "ID",
  car: "VTC",
  credit_card: "CB",
  globe: "WEB",
  clock: "24h",
  luggage_check: "BG",
  shield_check: "OK",
  home: "HQ",
  check: "OK",
  user_badge: "PRO",
  users: "VIP",
  building: "BUS",
  refresh: "A/R",
  calendar: "CAL",
  plane: "AIR",
  sparkle: "PRE",
  bank: "BAN",
  cash: "EUR",
  document: "DOC",
  ban: "NO",
};

function getPreviewTone(iconKey: IconKey) {
  return previewToneByIcon[iconKey] ?? "border-orange-300/70 bg-orange-50 text-orange-700";
}

export function BadgesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const badgeById = useMemo(() => new Map(draft.badges.library.map((b) => [b.id, b] as const)), [draft.badges.library]);

  return (
    <div className="space-y-6">
      <SettingsCallout
        title="Bibliotheque des badges"
        description="Chaque badge peut etre reutilise sur plusieurs zones du site. La previsualisation ci-dessous aide a voir le rendu general avant sauvegarde."
        caption="Cette passe reste purement visuelle : aucun placement ni comportement n est modifie ici."
      />

      <SettingsSectionCard title="Bibliotheque" description="Texte, icone logique et etat d activation de chaque badge.">
        <ul className="space-y-4">
          {draft.badges.library.map((b, i) => (
            <li key={b.id} className="space-y-4 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/70 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-[var(--pro-text-muted)]">{b.id}</p>
                  <p className="text-sm text-[var(--pro-text-soft)]">Apercu du badge sur la vitrine</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium shadow-sm ${getPreviewTone(b.iconKey)}`}>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/70 px-2 text-[11px] font-bold tracking-wide">
                    {iconGlyphByKey[b.iconKey]}
                  </span>
                  <span>{b.text || "Texte du badge"}</span>
                </div>
              </div>

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
                hint="Un badge inactif reste reference mais n est plus propose visuellement."
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
                hint="Choisissez une promesse courte, facile a lire en un coup d oeil."
              />

              {editing ? (
                <label className="block text-xs font-medium text-[var(--pro-text-muted)]">
                  Icone
                  <select
                    value={b.iconKey}
                    onChange={(e) =>
                      setDraft((d) => {
                        const library = [...d.badges.library];
                        library[i] = { ...library[i], iconKey: e.target.value as IconKey };
                        return { ...d, badges: { ...d.badges, library } };
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] shadow-sm"
                  >
                    {ICON_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-xs text-[var(--pro-text-muted)]">Icone : {b.iconKey}</p>
              )}

              <p className="text-xs leading-relaxed text-[var(--pro-text-muted)]">
                Variante d affichage : pastille texte + repere visuel. La previsualisation sert de guide rapide.
              </p>
            </li>
          ))}
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard title="Placements" description="Lecture seule - ordre et associations des badges sur la vitrine.">
        <div className="space-y-4">
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
                        <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${getPreviewTone(iconKey)}`}>
                          <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
                            {iconGlyphByKey[iconKey]}
                          </span>
                          {label}
                        </span>
                        <span className="text-[var(--pro-text-muted)]">ref. {item.badgeId}</span>
                      </div>
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
