"use client";

import { EditableField } from "./editable/EditableField";
import { EditableImageField } from "./editable/EditableImageField";
import { LogoEditor } from "./editable/LogoEditor";
import { SettingsCallout, SettingsSectionCard } from "./SettingsSectionCard";
import { getAtPath, setAtPath, SITE_IMAGE_PAGES, SITE_IMAGE_SLOTS } from "./siteImageSlots";
import type { SettingsTabsSharedProps } from "./tabs/context";

/** Un seul endroit pour toutes les images du site, chacune avec la page et l’emplacement où elle s’affiche. */
export function SiteImagesPanel({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const setPath = (path: string, value: string) => setDraft((d) => setAtPath(d, path, value));

  return (
    <div className="space-y-6">
      <SettingsCallout
        title="Toutes les images du site au même endroit"
        description="Chaque image indique la page et l’emplacement où elle apparaît, avec un lien pour la voir sur le site."
        caption="Les photos des véhicules se modifient dans la section Véhicules."
      />

      <SettingsSectionCard title="Logo" description="Affiché en haut de toutes les pages.">
        <LogoEditor draft={draft} setDraft={setDraft} editing={editing} />
      </SettingsSectionCard>

      {SITE_IMAGE_PAGES.map((page) => {
        const slots = SITE_IMAGE_SLOTS.filter((s) => s.page === page);
        return (
          <SettingsSectionCard key={page} title={page} description={`${slots.length} image${slots.length > 1 ? "s" : ""} sur cette page.`}>
            <div className="grid gap-4 xl:grid-cols-2">
              {slots.map((slot) => (
                <div key={slot.id} className="space-y-3">
                  <EditableImageField
                    label={slot.label}
                    value={getAtPath(draft, slot.srcPath)}
                    onChange={(v) => setPath(slot.srcPath, v)}
                    editing={editing}
                    altPreview={slot.altPath ? getAtPath(draft, slot.altPath) : slot.label}
                    where={{ page: slot.page, position: slot.position, href: slot.href }}
                    recommended={slot.recommended}
                  />
                  {slot.altPath ? (
                    <EditableField
                      label="Description de l’image (accessibilité et SEO)"
                      value={getAtPath(draft, slot.altPath)}
                      onChange={(v) => setPath(slot.altPath as string, v)}
                      editing={editing}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </SettingsSectionCard>
        );
      })}

      <SettingsSectionCard title="Partage sur les réseaux" description="Image affichée quand le lien du site est partagé (WhatsApp, Facebook, SMS…).">
        <EditableImageField
          label="Image de partage"
          value={draft.branding.ogImageSrc}
          onChange={(v) => setDraft((d) => ({ ...d, branding: { ...d.branding, ogImageSrc: v } }))}
          editing={editing}
          altPreview="Image de partage"
          where={{ page: "Aperçu de lien", position: "vignette dans les messages et réseaux sociaux" }}
          recommended="1200 × 630 px"
        />
      </SettingsSectionCard>
    </div>
  );
}
