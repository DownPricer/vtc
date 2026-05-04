"use client";

import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { EditableImageField } from "../editable/EditableImageField";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import { proBtnDangerClass, proBtnSecondaryClass } from "../editable/proFieldStyles";
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

function ServiceNumPreview({ num }: { num: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--pro-border)] bg-[var(--pro-accent-soft)] text-lg font-black text-[var(--pro-accent)]">
      {num || "—"}
    </div>
  );
}

export function ServicesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const hero = draft.services.pageHero;

  return (
    <div className="space-y-6">
      <SettingsCallout
        title="Services sur la vitrine"
        description="Ces services sont affichés sur la page Services et peuvent être repris sur la page d’accueil."
        caption="Objectif : un contenu clair pour vos visiteurs, sans réglages techniques inutiles."
      />

      <SettingsSectionCard title="Page Services" description="Bandeau d’en-tête et liste des prestations.">
        <CollapsibleSettingsCard
          title="Hero page Services"
          subtitle={`${hero.eyebrow} · ${hero.title} ${hero.titleHighlight}`.trim()}
          defaultOpen={false}
          editing={editing}
        >
          <EditableImageField
            label="Image de fond"
            value={hero.imageSrc}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pageHero: { ...d.services.pageHero, imageSrc: v } },
              }))
            }
            editing={editing}
            altPreview={hero.imageAlt}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <EditableField
              label="Texte alternatif (image)"
              value={hero.imageAlt}
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
              value={hero.eyebrow}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  services: { ...d.services, pageHero: { ...d.services.pageHero, eyebrow: v } },
                }))
              }
              editing={editing}
            />
            <EditableField
              label="Titre principal"
              value={hero.title}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  services: { ...d.services, pageHero: { ...d.services.pageHero, title: v } },
                }))
              }
              editing={editing}
            />
            <EditableField
              label="Titre mis en avant"
              value={hero.titleHighlight}
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
            value={hero.intro}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                services: { ...d.services, pageHero: { ...d.services.pageHero, intro: v } },
              }))
            }
            editing={editing}
          />
        </CollapsibleSettingsCard>

        <p className="mt-6 text-sm leading-relaxed text-[var(--pro-text-soft)]">
          Chaque carte ci-dessous correspond à un bloc sur la page Services : titre court, description, tags et bouton d’action.
        </p>
        <ul className="mt-4 space-y-4">
          {draft.services.items.map((s, i) => {
            const tagLine = s.tags.slice(0, 4).join(" · ");
            const descShort = s.description.length > 120 ? `${s.description.slice(0, 120)}…` : s.description;
            return (
              <li key={s.id}>
                <CollapsibleSettingsCard
                  title={s.title?.trim() || `Service ${i + 1}`}
                  subtitle={[descShort, tagLine].filter(Boolean).join(" — ")}
                  defaultOpen={false}
                  editing={editing}
                  preview={<ServiceNumPreview num={s.num} />}
                  badge={
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        s.enabled
                          ? "border-emerald-400/35 bg-emerald-500/10 text-[var(--pro-text)]"
                          : "border-white/15 bg-[var(--pro-panel-muted)] text-[var(--pro-text-muted)]"
                      }`}
                    >
                      {s.enabled ? "Actif" : "Inactif"}
                    </span>
                  }
                >
                  <div className="flex flex-wrap justify-end gap-2">
                    {editing ? (
                      <button
                        type="button"
                        className={proBtnDangerClass}
                        onClick={() => {
                          if (!window.confirm("Supprimer ce service ?")) return;
                          setDraft((d) => ({
                            ...d,
                            services: { ...d.services, items: d.services.items.filter((_, j) => j !== i) },
                          }));
                        }}
                      >
                        Supprimer le service
                      </button>
                    ) : null}
                  </div>

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
                    hint="Inactif : masqué sur la page Services."
                  />

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
                      hint="Repère visuel sur la carte."
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
                      label="Texte du bouton (CTA)"
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
                      label="Lien du bouton"
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
                      hint="Page interne (ex. /contact) ou URL complète."
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
                    <p className="text-xs text-[var(--pro-text-muted)]">Icône sélectionnée (réglage avancé).</p>
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
                </CollapsibleSettingsCard>
              </li>
            );
          })}
        </ul>

        {editing ? (
          <button
            type="button"
            className={`${proBtnSecondaryClass} mt-4`}
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

      <SettingsSectionCard title="Bloc confort" description="Encart en bas de la page Services.">
        <CollapsibleSettingsCard
          title="Texte confort & véhicule"
          subtitle={draft.services.comfortBlock.vehicleName}
          defaultOpen={false}
          editing={editing}
        >
          <div className="grid gap-3 sm:grid-cols-2">
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
              label="Véhicule (libellé)"
              value={draft.services.comfortBlock.vehicleName}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  services: { ...d.services, comfortBlock: { ...d.services.comfortBlock, vehicleName: v } },
                }))
              }
              editing={editing}
            />
          </div>
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
            hint="Confort, capacité ou expérience proposée."
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
        </CollapsibleSettingsCard>
      </SettingsSectionCard>
    </div>
  );
}
