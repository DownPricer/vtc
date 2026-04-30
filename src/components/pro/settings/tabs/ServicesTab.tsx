"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableImageField } from "../editable/EditableImageField";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import type { IconKey, ServiceItem } from "@/config/tenant-settings.types";
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

function newServiceItem(): ServiceItem {
  return {
    id: `svc_${crypto.randomUUID()}`,
    num: "00",
    title: "Nouveau service",
    description: "",
    ctaLabel: "En savoir plus",
    href: "/contact",
    tags: [],
    iconKey: "car",
    enabled: true,
  };
}

export function ServicesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Hero page services" description="Bandeau supérieur de /services.">
        <EditableImageField
          label="Image"
          value={draft.services.pageHero.imageSrc}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              services: { ...d.services, pageHero: { ...d.services.pageHero, imageSrc: v } },
            }))
          }
          editing={editing}
          altPreview={draft.services.pageHero.imageAlt}
        />
        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          <EditableField
            label="Texte alternatif"
            value={draft.services.pageHero.imageAlt}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pageHero: { ...d.services.pageHero, imageAlt: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Sur-titre"
            value={draft.services.pageHero.eyebrow}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pageHero: { ...d.services.pageHero, eyebrow: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre (partie 1)"
            value={draft.services.pageHero.title}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pageHero: { ...d.services.pageHero, title: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre (mise en avant)"
            value={draft.services.pageHero.titleHighlight}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pageHero: { ...d.services.pageHero, titleHighlight: v } },
              }))
            }
            editing={editing}
          />
        </div>
        <EditableField
          label="Introduction"
          value={draft.services.pageHero.intro}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              services: { ...d.services, pageHero: { ...d.services.pageHero, intro: v } },
            }))
          }
          editing={editing}
        />
      </SettingsSectionCard>

      <SettingsSectionCard title="Liste des services" description="Cartes présentées sur /services.">
        <ul className="space-y-4">
          {draft.services.items.map((s, i) => (
            <li key={s.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <EditableSwitch
                  label="Service actif"
                  checked={s.enabled}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], enabled: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                />
                {editing ? (
                  <button
                    type="button"
                    className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        services: { ...d.services, items: d.services.items.filter((_, j) => j !== i) },
                      }))
                    }
                  >
                    Supprimer le service
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <EditableField
                  label="Numéro affiché"
                  value={s.num}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], num: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Titre"
                  value={s.title}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], title: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                />
              </div>
              <EditableField
                label="Description"
                value={s.description}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.services.items];
                    items[i] = { ...items[i], description: v };
                    return { ...d, services: { ...d.services, items } };
                  })
                }
                editing={editing}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <EditableField
                  label="CTA"
                  value={s.ctaLabel}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], ctaLabel: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Lien (href)"
                  value={s.href}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], href: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                  mono
                />
              </div>
              {editing ? (
                <label className="block text-xs font-medium text-[var(--pro-text-muted)]">
                  Icône
                  <select
                    value={s.iconKey}
                    onChange={(e) =>
                      setDraft((d) => {
                        const items = [...d.services.items];
                        items[i] = { ...items[i], iconKey: e.target.value as IconKey };
                        return { ...d, services: { ...d.services, items } };
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
                <p className="text-xs text-[var(--pro-text-muted)]">Icône : {s.iconKey}</p>
              )}
              <SimpleStringListEditor
                label="Tags"
                items={s.tags}
                onChange={(tags) =>
                  setDraft((d) => {
                    const items = [...d.services.items];
                    items[i] = { ...items[i], tags };
                    return { ...d, services: { ...d.services, items } };
                  })
                }
                editing={editing}
              />
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
                services: { ...d.services, items: [...d.services.items, newServiceItem()] },
              }))
            }
          >
            Ajouter un service
          </button>
        ) : null}
      </SettingsSectionCard>

      <SettingsSectionCard title="Bloc confort" description="Encart véhicule en bas de page.">
        <EditableField
          label="Sur-titre"
          value={draft.services.comfortBlock.eyebrow}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              services: { ...d.services, comfortBlock: { ...d.services.comfortBlock, eyebrow: v } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Véhicule"
          value={draft.services.comfortBlock.vehicleName}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              services: { ...d.services, comfortBlock: { ...d.services.comfortBlock, vehicleName: v } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Texte"
          value={draft.services.comfortBlock.bullets}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              services: { ...d.services, comfortBlock: { ...d.services.comfortBlock, bullets: v } },
            }))
          }
          editing={editing}
        />
        <SimpleStringListEditor
          label="Puces paiement"
          items={draft.services.comfortBlock.paymentChips}
          onChange={(paymentChips) =>
            setDraft((d) => ({
              ...d,
              services: { ...d.services, comfortBlock: { ...d.services.comfortBlock, paymentChips } },
            }))
          }
          editing={editing}
        />
      </SettingsSectionCard>
    </div>
  );
}
