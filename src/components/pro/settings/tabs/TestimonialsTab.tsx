"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableTextarea } from "../editable/EditableTextarea";
import { EditableStarRating } from "../editable/EditableStarRating";
import { proBtnDangerClass } from "../editable/proFieldStyles";
import type { TestimonialItem } from "@/config/tenant-settings.types";
import type { SettingsTabsSharedProps } from "./context";

function newTestimonial(): TestimonialItem {
  return {
    id: `t_${crypto.randomUUID()}`,
    text: "",
    author: "",
    trajet: "",
    rating: 5,
    date: "",
    enabled: true,
  };
}

export function TestimonialsTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="En-tête section" description="Titres affichés sur l’accueil.">
        <EditableSwitch
          label="Section activée"
          checked={draft.testimonials.enabled}
          onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, enabled: v } }))}
          editing={editing}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Sur-titre"
            value={draft.testimonials.eyebrow}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, eyebrow: v } }))}
            editing={editing}
          />
          <EditableField
            label="Titre (partie 1)"
            value={draft.testimonials.title}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, title: v } }))}
            editing={editing}
          />
          <EditableField
            label="Titre (mise en avant)"
            value={draft.testimonials.titleHighlight}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, titleHighlight: v } }))}
            editing={editing}
          />
          <EditableField
            label="Note affichée"
            value={draft.testimonials.ratingValueText}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, ratingValueText: v } }))}
            editing={editing}
          />
          <EditableField
            label="Libellé note"
            value={draft.testimonials.ratingLabel}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, ratingLabel: v } }))}
            editing={editing}
          />
          <EditableField
            label="Libellé compteur"
            value={draft.testimonials.ratingCountLabel}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, ratingCountLabel: v } }))}
            editing={editing}
          />
          <EditableField
            label="Lien avis (URL)"
            value={draft.testimonials.reviewsUrl ?? ""}
            onChange={(v) => setDraft((d) => ({ ...d, testimonials: { ...d.testimonials, reviewsUrl: v || undefined } }))}
            editing={editing}
            type="url"
          />
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard title="Avis" description="Cartes défilantes.">
        <ul className="space-y-4">
          {draft.testimonials.items.map((t, i) => (
            <li key={t.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <EditableSwitch
                  label="Avis actif"
                  checked={t.enabled}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.testimonials.items];
                      items[i] = { ...items[i], enabled: v };
                      return { ...d, testimonials: { ...d.testimonials, items } };
                    })
                  }
                  editing={editing}
                />
                {editing ? (
                  <button
                    type="button"
                    className={proBtnDangerClass}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        testimonials: { ...d.testimonials, items: d.testimonials.items.filter((_, j) => j !== i) },
                      }))
                    }
                  >
                    Supprimer
                  </button>
                ) : null}
              </div>
              <EditableField
                label="Auteur"
                value={t.author}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.testimonials.items];
                    items[i] = { ...items[i], author: v };
                    return { ...d, testimonials: { ...d.testimonials, items } };
                  })
                }
                editing={editing}
              />
              <EditableStarRating
                label="Note"
                value={t.rating}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.testimonials.items];
                    items[i] = { ...items[i], rating: Math.min(5, Math.max(1, v)) };
                    return { ...d, testimonials: { ...d.testimonials, items } };
                  })
                }
                editing={editing}
                min={1}
                max={5}
              />
              <EditableTextarea
                label="Texte"
                value={t.text}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.testimonials.items];
                    items[i] = { ...items[i], text: v };
                    return { ...d, testimonials: { ...d.testimonials, items } };
                  })
                }
                editing={editing}
                rows={3}
              />
              <EditableField
                label="Date affichée"
                value={t.date ?? ""}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.testimonials.items];
                    items[i] = { ...items[i], date: v || undefined };
                    return { ...d, testimonials: { ...d.testimonials, items } };
                  })
                }
                editing={editing}
              />
              <EditableField
                label="Trajet / contexte"
                value={t.trajet ?? ""}
                onChange={(v) =>
                  setDraft((d) => {
                    const items = [...d.testimonials.items];
                    items[i] = { ...items[i], trajet: v || undefined };
                    return { ...d, testimonials: { ...d.testimonials, items } };
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
                testimonials: { ...d.testimonials, items: [...d.testimonials.items, newTestimonial()] },
              }))
            }
          >
            Ajouter un témoignage
          </button>
        ) : null}
      </SettingsSectionCard>
    </div>
  );
}
