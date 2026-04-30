"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import { EditableImageField } from "../editable/EditableImageField";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import type { SettingsTabsSharedProps } from "./context";

export function VehiclesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const v = draft.vehicles.featured;

  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Véhicule mis en avant" description="Référencé sur la vitrine (galerie, textes).">
        <EditableField
          label="ID interne (référence)"
          value={draft.vehicles.featuredVehicleId}
          onChange={(id) =>
            setDraft((d) => ({
              ...d,
              vehicles: {
                ...d.vehicles,
                featuredVehicleId: id,
                featured: { ...d.vehicles.featured, id },
              },
            }))
          }
          editing={editing}
          mono
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Nom"
            value={v.name}
            onChange={(name) =>
              setDraft((d) => ({
                ...d,
                vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, name } },
              }))
            }
            editing={editing}
          />
          <EditableNumberField
            label="Passagers max."
            value={v.passengerMax}
            onChange={(passengerMax) =>
              setDraft((d) => ({
                ...d,
                vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, passengerMax: Math.max(1, passengerMax) } },
              }))
            }
            editing={editing}
            min={1}
          />
        </div>
        <EditableField
          label="Accroche (ligne principale)"
          value={v.headline}
          onChange={(headline) =>
            setDraft((d) => ({
              ...d,
              vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, headline } },
            }))
          }
          editing={editing}
        />
        <EditableField
          label="Détail / équipements (texte)"
          value={v.highlightText ?? ""}
          onChange={(highlightText) =>
            setDraft((d) => ({
              ...d,
              vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, highlightText } },
            }))
          }
          editing={editing}
        />
        <SimpleStringListEditor
          label="Paiements affichés (puces)"
          items={v.paymentChips}
          onChange={(paymentChips) =>
            setDraft((d) => ({
              ...d,
              vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, paymentChips } },
            }))
          }
          editing={editing}
        />
        <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Photos</p>
        <ul className="space-y-6">
          {v.gallery.map((g, i) => (
            <li key={`${g.src}-${i}`} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 space-y-3">
              <EditableImageField
                label={`Photo ${i + 1}`}
                value={g.src}
                onChange={(src) =>
                  setDraft((d) => {
                    const gallery = [...d.vehicles.featured.gallery];
                    gallery[i] = { ...gallery[i], src };
                    return { ...d, vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, gallery } } };
                  })
                }
                editing={editing}
                altPreview={g.alt}
              />
              <EditableField
                label="Texte alternatif"
                value={g.alt}
                onChange={(alt) =>
                  setDraft((d) => {
                    const gallery = [...d.vehicles.featured.gallery];
                    gallery[i] = { ...gallery[i], alt };
                    return { ...d, vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, gallery } } };
                  })
                }
                editing={editing}
              />
              <EditableField
                label="Légende (tag)"
                value={g.tag}
                onChange={(tag) =>
                  setDraft((d) => {
                    const gallery = [...d.vehicles.featured.gallery];
                    gallery[i] = { ...gallery[i], tag };
                    return { ...d, vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, gallery } } };
                  })
                }
                editing={editing}
              />
              {editing ? (
                <button
                  type="button"
                  className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      vehicles: {
                        ...d.vehicles,
                        featured: {
                          ...d.vehicles.featured,
                          gallery: d.vehicles.featured.gallery.filter((_, j) => j !== i),
                        },
                      },
                    }))
                  }
                >
                  Retirer cette photo
                </button>
              ) : null}
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
                vehicles: {
                  ...d.vehicles,
                  featured: {
                    ...d.vehicles.featured,
                    gallery: [...d.vehicles.featured.gallery, { src: "", alt: "", tag: "Photo" }],
                  },
                },
              }))
            }
          >
            Ajouter une photo
          </button>
        ) : null}
      </SettingsSectionCard>
    </div>
  );
}
