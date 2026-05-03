"use client";

import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
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

const cardClass = "space-y-4 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/70 p-4 shadow-sm";

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
      <SettingsCallout
        title="Services affiches sur la vitrine"
        description="Ces services sont affiches sur la page Services et peuvent aussi etre repris sur la page d accueil."
        caption="L objectif ici est surtout de clarifier le contenu commercial pour vos visiteurs."
      />

      <SettingsSectionCard title="Hero page services" description="Bandeau superieur de la page Services.">
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
        <div className="grid gap-3 sm:grid-cols-2">
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
            label="Titre principal"
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
            label="Titre mis en avant"
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

      <SettingsSectionCard
        title="Liste des services"
        description="Chaque carte represente un service visible sur la page Services."
      >
        <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
          Gardez un titre clair, une description courte, quelques tags utiles et un appel a l action simple.
        </p>
        <ul className="space-y-4">
          {draft.services.items.map((s, i) => (
            <li key={s.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pro-accent)]">Service {i + 1}</p>
                  <p className="text-sm text-[var(--pro-text-soft)]">Activez ou desactivez cette carte sans changer son contenu.</p>
                </div>
                {editing ? (
                  <button
                    type="button"
                    className={proBtnDangerClass}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        services: { ...d.services, items: d.services.items.filter((_, j) => j !== i) },
                      }))
                    }
                  >
                    Supprimer
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
                hint="Un service inactif ne sera plus propose sur la vitrine."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <EditableField
                  label="Numero affiche"
                  value={s.num}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], num: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                  hint="Petit repere visuel affiche sur la carte si votre design l utilise."
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
                  hint="Le titre doit resumer le service en quelques mots."
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
                hint="Expliquez en une ou deux phrases ce que le client gagne."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <EditableField
                  label="Texte du CTA"
                  value={s.ctaLabel}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.services.items];
                      items[i] = { ...items[i], ctaLabel: v };
                      return { ...d, services: { ...d.services, items } };
                    })
                  }
                  editing={editing}
                  hint="Exemple : En savoir plus, Demander un devis, Nous contacter."
                />
                <EditableField
                  label="Lien du CTA"
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
                  hint="Chemin interne ou URL utilise par le bouton."
                />
              </div>

              {editing ? (
                <label className="block text-xs font-medium text-[var(--pro-text-muted)]">
                  Icone
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
                <p className="text-xs text-[var(--pro-text-muted)]">Icone : {s.iconKey}</p>
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
            className={proBtnSecondaryClass}
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

      <SettingsSectionCard title="Bloc confort" description="Encart vehicule presente en bas de la page Services.">
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
            label="Vehicule"
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
          hint="Resumez le confort, la capacite ou l experience proposee."
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
