"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableColorField } from "../editable/EditableColorField";
import { EditableImageField } from "../editable/EditableImageField";
import { LogoEditor } from "../editable/LogoEditor";
import type { SettingsTabsSharedProps } from "./context";

export function AppearanceTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const colorEntries = Object.entries(draft.branding.colors) as [keyof typeof draft.branding.colors, string][];

  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Logo" description="Affiché en haut de toutes les pages. Les autres images du site sont dans « Images du site ».">
        <LogoEditor draft={draft} setDraft={setDraft} editing={editing} />
      </SettingsSectionCard>
      <SettingsSectionCard title="Image de partage" description="Vignette affichée quand le lien du site est partagé (WhatsApp, Facebook, SMS…).">
        <EditableImageField
          label="Image de partage (Open Graph)"
          value={draft.branding.ogImageSrc}
          onChange={(v) => setDraft((d) => ({ ...d, branding: { ...d.branding, ogImageSrc: v } }))}
          editing={editing}
          altPreview="Open Graph"
          where={{ page: "Aperçu de lien", position: "vignette dans les messages et réseaux sociaux" }}
          recommended="1200 × 630 px"
        />
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
