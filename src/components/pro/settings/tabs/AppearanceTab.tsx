"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableField } from "../editable/EditableField";
import { EditableColorField } from "../editable/EditableColorField";
import { EditableImageField } from "../editable/EditableImageField";
import type { SettingsTabsSharedProps } from "./context";

export function AppearanceTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const colorEntries = Object.entries(draft.branding.colors) as [keyof typeof draft.branding.colors, string][];

  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Médias" description="Logo et image Open Graph utilisés pour le partage social.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <EditableImageField
              label="Logo"
              value={draft.branding.logoSrc}
              onChange={(v) => setDraft((d) => ({ ...d, branding: { ...d.branding, logoSrc: v } }))}
              editing={editing}
              altPreview={draft.branding.logoAlt}
            />
            <EditableField
              label="Texte alternatif logo"
              value={draft.branding.logoAlt}
              onChange={(v) => setDraft((d) => ({ ...d, branding: { ...d.branding, logoAlt: v } }))}
              editing={editing}
            />
          </div>
          <EditableImageField
            label="Image Open Graph"
            value={draft.branding.ogImageSrc}
            onChange={(v) => setDraft((d) => ({ ...d, branding: { ...d.branding, ogImageSrc: v } }))}
            editing={editing}
            altPreview="Open Graph"
          />
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard title="Couleurs" description="Palette injectée en variables CSS sur la vitrine.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {colorEntries.map(([key, hex]) => (
            <EditableColorField
              key={key}
              label={key}
              value={hex}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  branding: { ...d.branding, colors: { ...d.branding.colors, [key]: v } },
                }))
              }
              editing={editing}
            />
          ))}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
