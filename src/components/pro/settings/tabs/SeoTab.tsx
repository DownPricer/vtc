"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableField } from "../editable/EditableField";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import type { SettingsTabsSharedProps } from "./context";

export function SeoTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Métadonnées" description="Champs SEO principaux de la configuration centrale.">
        <EditableField
          label="Titre par défaut"
          value={draft.seo.defaultTitle}
          onChange={(v) => setDraft((d) => ({ ...d, seo: { ...d.seo, defaultTitle: v } }))}
          editing={editing}
        />
        <EditableField
          label="Modèle de titre"
          value={draft.seo.titleTemplate}
          onChange={(v) => setDraft((d) => ({ ...d, seo: { ...d.seo, titleTemplate: v } }))}
          editing={editing}
          hint="Ex. « %s | Ma marque »"
        />
        <EditableField
          label="Description par défaut"
          value={draft.seo.defaultDescription}
          onChange={(v) => setDraft((d) => ({ ...d, seo: { ...d.seo, defaultDescription: v } }))}
          editing={editing}
        />
        <EditableField
          label="Locale Open Graph"
          value={draft.seo.openGraphLocale}
          onChange={(v) => setDraft((d) => ({ ...d, seo: { ...d.seo, openGraphLocale: v } }))}
          editing={editing}
        />
        <EditableField
          label="Catégorie"
          value={draft.seo.category}
          onChange={(v) => setDraft((d) => ({ ...d, seo: { ...d.seo, category: v } }))}
          editing={editing}
        />
        <EditableField
          label="Région (libellé)"
          value={draft.general.regionLabel}
          onChange={(v) => setDraft((d) => ({ ...d, general: { ...d.general, regionLabel: v } }))}
          editing={editing}
          hint="Utilisé dans plusieurs textes et SEO."
        />
        <SimpleStringListEditor
          label="Mots-clés"
          items={draft.seo.keywords}
          onChange={(keywords) => setDraft((d) => ({ ...d, seo: { ...d.seo, keywords } }))}
          editing={editing}
          hint="Liste meta keywords / cohérence rédactionnelle."
        />
      </SettingsSectionCard>
    </div>
  );
}
