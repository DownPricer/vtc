"use client";

import { CollapsibleSettingsCard } from "@/components/pro/settings/CollapsibleSettingsCard";
import { EditableField } from "@/components/pro/settings/editable/EditableField";
import { EditableTextarea } from "@/components/pro/settings/editable/EditableTextarea";
import { EditableSwitch } from "@/components/pro/settings/editable/EditableSwitch";
import { SimpleStringListEditor } from "@/components/pro/settings/editable/SimpleStringListEditor";
import type { SettingsTabsSharedProps } from "@/components/pro/settings/tabs/context";

export function SiteIdentitySection({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <EditableField
        label="Nom commercial"
        value={draft.general.commercialName}
        onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, commercialName: v } }))}
        editing={editing}
      />
      <EditableField
        label="Nom légal"
        value={draft.general.legalName}
        onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, legalName: v } }))}
        editing={editing}
      />
      <EditableField
        label="Slogan / tagline"
        value={draft.general.tagline}
        onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, tagline: v } }))}
        editing={editing}
      />
      <EditableField
        label="Région / zone"
        value={draft.general.regionLabel}
        onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, regionLabel: v } }))}
        editing={editing}
      />
      <EditableField
        label="Zone d’intervention (titre)"
        value={draft.general.serviceAreas.headline}
        onChange={(v) =>
          setDraft((d) => ({
            ...d,
            general: { ...d.general, serviceAreas: { ...d.general.serviceAreas, headline: v } },
          }))
        }
        editing={editing}
      />
      <div className="sm:col-span-2">
        <EditableTextarea
          label="Description zone"
          value={draft.general.serviceAreas.description}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              general: { ...d.general, serviceAreas: { ...d.general.serviceAreas, description: v } },
            }))
          }
          editing={editing}
          rows={3}
        />
      </div>
      <div className="sm:col-span-2">
        <SimpleStringListEditor
          label="Villes / zones desservies"
          items={draft.general.serviceAreas.cities}
          onChange={(cities) =>
            setDraft((d) => ({
              ...d,
              general: { ...d.general, serviceAreas: { ...d.general.serviceAreas, cities } },
            }))
          }
          editing={editing}
        />
      </div>
    </div>
  );
}

export function SitePresentationSection({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-4">
      <CollapsibleSettingsCard title="Héros d’accueil" subtitle="Titre, sous-titre et texte principal." defaultOpen editing={editing}>
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Titre (ligne 1)"
            value={draft.home.hero.titleLine1}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, titleLine1: v } } }))}
            editing={editing}
          />
          <EditableField
            label="Titre (mise en avant)"
            value={draft.home.hero.titleHighlight}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, titleHighlight: v } } }))}
            editing={editing}
          />
          <div className="sm:col-span-2">
            <EditableField
              label="Sous-titre"
              value={draft.home.hero.subtitle}
              onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, subtitle: v } } }))}
              editing={editing}
            />
          </div>
          <div className="sm:col-span-2">
            <EditableTextarea
              label="Puces / promesse"
              value={draft.home.hero.bullets}
              onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, bullets: v } } }))}
              editing={editing}
              rows={2}
            />
          </div>
        </div>
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard title="Présentation chauffeur" subtitle="Bloc « à propos » sur l’accueil." defaultOpen={false} editing={editing}>
        <EditableField
          label="Paragraphe principal"
          value={draft.home.aboutPreview.leadParagraph}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              home: { ...d.home, aboutPreview: { ...d.home.aboutPreview, leadParagraph: v } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Paragraphe secondaire"
          value={draft.home.aboutPreview.secondaryParagraph}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              home: { ...d.home, aboutPreview: { ...d.home.aboutPreview, secondaryParagraph: v } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Histoire (page À propos)"
          value={draft.aboutPage.storyLead}
          onChange={(v) => setDraft((d) => ({ ...d, aboutPage: { ...d.aboutPage, storyLead: v } }))}
          editing={editing}
        />
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard title="Moyens de paiement affichés" subtitle="Bloc visible sur la page d’accueil." defaultOpen={false} editing={editing}>
        <EditableSwitch
          label="Bloc activé"
          checked={draft.home.paymentMethods.enabled}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, enabled: v } },
            }))
          }
          editing={editing}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Sur-titre"
            value={draft.home.paymentMethods.eyebrow}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, eyebrow: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre"
            value={draft.home.paymentMethods.title}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, title: v } },
              }))
            }
            editing={editing}
          />
        </div>
        <ul className="mt-4 space-y-2">
          {draft.home.paymentMethods.items.map((item, i) => (
            <li key={item.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4">
              <EditableSwitch
                label={`Afficher « ${item.label} »`}
                checked={item.enabled}
                onChange={(en) =>
                  setDraft((d) => {
                    const items = [...d.home.paymentMethods.items];
                    items[i] = { ...items[i], enabled: en };
                    return { ...d, home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, items } } };
                  })
                }
                editing={editing}
              />
              <EditableField
                label="Libellé"
                value={item.label}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.home.paymentMethods.items];
                    items[i] = { ...items[i], label: v };
                    return { ...d, home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, items } } };
                  })
                }
                editing={editing}
              />
            </li>
          ))}
        </ul>
      </CollapsibleSettingsCard>
    </div>
  );
}
