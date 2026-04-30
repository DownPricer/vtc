"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableField } from "../editable/EditableField";
import { EditableTextarea } from "../editable/EditableTextarea";
import type { SettingsTabsSharedProps } from "./context";

export function LegalTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Société & obligations" description="Informations affichées aux mentions légales.">
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Nom affiché"
            value={draft.legal.displayName}
            onChange={(v) => setDraft((d) => ({ ...d, legal: { ...d.legal, displayName: v } }))}
            editing={editing}
          />
          <EditableField
            label="Représentant légal"
            value={draft.legal.legalRepresentative}
            onChange={(v) => setDraft((d) => ({ ...d, legal: { ...d.legal, legalRepresentative: v } }))}
            editing={editing}
          />
          <EditableField
            label="SIRET"
            value={draft.legal.siret}
            onChange={(v) => setDraft((d) => ({ ...d, legal: { ...d.legal, siret: v } }))}
            editing={editing}
          />
          <EditableField
            label="Licence VTC"
            value={draft.legal.vtcLicenseNumber}
            onChange={(v) => setDraft((d) => ({ ...d, legal: { ...d.legal, vtcLicenseNumber: v } }))}
            editing={editing}
          />
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard title="Hébergeur" description="Prestataire d’hébergement du site.">
        <EditableField
          label="Nom"
          value={draft.legal.hosting.name}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              legal: { ...d.legal, hosting: { ...d.legal.hosting, name: v } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Adresse"
          value={draft.legal.hosting.address}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              legal: { ...d.legal, hosting: { ...d.legal.hosting, address: v } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Site web"
          value={draft.legal.hosting.website}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              legal: { ...d.legal, hosting: { ...d.legal.hosting, website: v } },
            }))
          }
          editing={editing}
          mono
          type="url"
        />
      </SettingsSectionCard>
      <SettingsSectionCard title="Confidentialité (résumé)" description="Texte court — à compléter juridiquement.">
        <EditableTextarea
          label="Résumé"
          value={draft.legal.privacySummary}
          onChange={(v) => setDraft((d) => ({ ...d, legal: { ...d.legal, privacySummary: v } }))}
          editing={editing}
          rows={6}
        />
      </SettingsSectionCard>
    </div>
  );
}
