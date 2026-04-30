"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyField } from "../ReadonlyField";
import { EditableField } from "../editable/EditableField";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import type { SettingsTabsSharedProps } from "./context";

export function GeneralTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Identité & zone" description="Informations visibles par vos clients sur la vitrine.">
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Nom commercial"
            value={draft.general.commercialName}
            onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, commercialName: v } }))}
            editing={editing}
          />
          <EditableField
            label="Raison sociale"
            value={draft.general.legalName}
            onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, legalName: v } }))}
            editing={editing}
          />
          <EditableField
            label="Tagline"
            value={draft.general.tagline}
            onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, tagline: v } }))}
            editing={editing}
          />
          <ReadonlyField label="Région (SEO / textes)" value={draft.general.regionLabel} hint="Éditable dans l’onglet SEO." />
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
            hint="Titre marketing de la zone couverte."
          />
          <div className="sm:col-span-2">
            <EditableField
              label="Description zone"
              value={draft.general.serviceAreas.description}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  general: { ...d.general, serviceAreas: { ...d.general.serviceAreas, description: v } },
                }))
              }
              editing={editing}
            />
          </div>
        </div>
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
          hint="Une ligne par entrée ; utilisez « Ajouter » pour en créer une nouvelle."
        />
      </SettingsSectionCard>
    </div>
  );
}
