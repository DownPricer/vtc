"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyField } from "../ReadonlyField";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableTextarea } from "../editable/EditableTextarea";
import type { FaqItem, IconKey } from "@/config/tenant-settings.types";
import type { SettingsTabsSharedProps } from "./context";

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

function newFaqItem(): FaqItem {
  return {
    id: `f_${crypto.randomUUID()}`,
    question: "",
    answer: "",
    iconKey: "check",
    enabled: true,
  };
}

export function FaqTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Paramètres page" description="Bandeau / FAQ activée.">
        <EditableSwitch
          label="FAQ activée"
          checked={draft.faq.enabled}
          onChange={(v) => setDraft((d) => ({ ...d, faq: { ...d.faq, enabled: v } }))}
          editing={editing}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Sur-titre"
            value={draft.faq.pageHero.eyebrow}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, pageHero: { ...d.faq.pageHero, eyebrow: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre (partie 1)"
            value={draft.faq.pageHero.title}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, pageHero: { ...d.faq.pageHero, title: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre (mise en avant)"
            value={draft.faq.pageHero.titleHighlight}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, pageHero: { ...d.faq.pageHero, titleHighlight: v } },
              }))
            }
            editing={editing}
          />
        </div>
        <EditableField
          label="Intro (modèle)"
          value={draft.faq.pageHero.introTemplate}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              faq: { ...d.faq, pageHero: { ...d.faq.pageHero, introTemplate: v } },
            }))
          }
          editing={editing}
        />
      </SettingsSectionCard>
      <SettingsSectionCard title="Questions / réponses" description="Ordre = ordre de la liste.">
        <ul className="space-y-4">
          {draft.faq.items.map((f, i) => (
            <li key={f.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ReadonlyField label="Position" value={`#${i + 1}`} />
                <div className="flex flex-wrap gap-2">
                  <EditableSwitch
                    label="Entrée active"
                    checked={f.enabled}
                    onChange={(v) =>
                      setDraft((d) => {
                        const items = [...d.faq.items];
                        items[i] = { ...items[i], enabled: v };
                        return { ...d, faq: { ...d.faq, items } };
                      })
                    }
                    editing={editing}
                  />
                  {editing ? (
                    <>
                      <button
                        type="button"
                        className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-1.5 text-xs font-medium text-[var(--pro-text-soft)] disabled:opacity-40"
                        disabled={i === 0}
                        onClick={() =>
                          setDraft((d) => {
                            const items = [...d.faq.items];
                            [items[i - 1], items[i]] = [items[i], items[i - 1]];
                            return { ...d, faq: { ...d.faq, items } };
                          })
                        }
                      >
                        Monter
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-1.5 text-xs font-medium text-[var(--pro-text-soft)] disabled:opacity-40"
                        disabled={i === draft.faq.items.length - 1}
                        onClick={() =>
                          setDraft((d) => {
                            const items = [...d.faq.items];
                            [items[i + 1], items[i]] = [items[i], items[i + 1]];
                            return { ...d, faq: { ...d.faq, items } };
                          })
                        }
                      >
                        Descendre
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            faq: { ...d.faq, items: d.faq.items.filter((_, j) => j !== i) },
                          }))
                        }
                      >
                        Supprimer
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <EditableField
                label="Question"
                value={f.question}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.faq.items];
                    items[i] = { ...items[i], question: v };
                    return { ...d, faq: { ...d.faq, items } };
                  })
                }
                editing={editing}
              />
              <EditableTextarea
                label="Réponse"
                value={f.answer}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.faq.items];
                    items[i] = { ...items[i], answer: v };
                    return { ...d, faq: { ...d.faq, items } };
                  })
                }
                editing={editing}
                rows={4}
              />
              {editing ? (
                <label className="block text-xs font-medium text-[var(--pro-text-muted)]">
                  Icône
                  <select
                    value={f.iconKey}
                    onChange={(e) =>
                      setDraft((d) => {
                        const items = [...d.faq.items];
                        items[i] = { ...items[i], iconKey: e.target.value as IconKey };
                        return { ...d, faq: { ...d.faq, items } };
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
                <p className="text-xs text-[var(--pro-text-muted)]">Icône : {f.iconKey}</p>
              )}
            </li>
          ))}
        </ul>
        {editing ? (
          <button
            type="button"
            className="mt-3 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-2 text-sm font-medium text-[var(--pro-text-soft)]"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, items: [...d.faq.items, newFaqItem()] },
              }))
            }
          >
            Ajouter une question
          </button>
        ) : null}
      </SettingsSectionCard>
      <SettingsSectionCard title="CTA bas de page" description="Liens proposés après la liste.">
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Texte manquant"
            value={draft.faq.cta.missingAnswerText}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, cta: { ...d.faq.cta, missingAnswerText: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Bouton 1"
            value={draft.faq.cta.primaryLabel}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, cta: { ...d.faq.cta, primaryLabel: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Lien 1"
            value={draft.faq.cta.primaryHref}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, cta: { ...d.faq.cta, primaryHref: v } },
              }))
            }
            editing={editing}
            mono
          />
          <EditableField
            label="Bouton 2"
            value={draft.faq.cta.secondaryLabel}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, cta: { ...d.faq.cta, secondaryLabel: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Lien 2"
            value={draft.faq.cta.secondaryHref}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                faq: { ...d.faq, cta: { ...d.faq.cta, secondaryHref: v } },
              }))
            }
            editing={editing}
            mono
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
