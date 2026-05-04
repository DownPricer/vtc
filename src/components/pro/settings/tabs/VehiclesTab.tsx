"use client";

import Image from "next/image";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import { EditableImageField } from "../editable/EditableImageField";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import { proBtnDangerClass, proBtnSecondaryClass } from "../editable/proFieldStyles";
import type { SettingsTabsSharedProps } from "./context";

export function VehiclesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const v = draft.vehicles.featured;
  const mainPhoto = v.gallery[0];
  const isFeatured = draft.vehicles.featuredVehicleId === v.id;

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Véhicule vitrine"
        description="Carte unique du véhicule mis en avant sur l’accueil et les pages associées."
      >
        <div className="overflow-hidden rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--pro-border)] bg-[var(--pro-panel)]/90 p-4 md:flex-row md:items-stretch">
            <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-[var(--pro-border)] bg-black/20 md:h-auto md:w-44 md:min-h-[9rem]">
              {mainPhoto?.src?.trim() ? (
                <Image
                  key={mainPhoto.src}
                  src={mainPhoto.src}
                  alt={mainPhoto.alt || v.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 176px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center p-2 text-center text-xs text-[var(--pro-text-muted)]">
                  Aucune image principale
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-semibold text-[var(--pro-text)]">{v.name || "Sans nom"}</h4>
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--pro-text)]">
                  Actif sur le site
                </span>
                {isFeatured ? (
                  <span className="rounded-full border border-[var(--pro-accent)]/40 bg-[var(--pro-accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--pro-accent)]">
                    Véhicule mis en avant
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-[var(--pro-text-soft)]">{v.headline || "—"}</p>
            </div>
          </div>

          <div className="space-y-4 p-4">
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
            <div className="grid gap-3 sm:grid-cols-2">
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
              label="Description courte (accroche)"
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
              label="Équipements & confort (texte libre)"
              value={v.highlightText ?? ""}
              onChange={(highlightText) =>
                setDraft((d) => ({
                  ...d,
                  vehicles: { ...d.vehicles, featured: { ...d.vehicles.featured, highlightText } },
                }))
              }
              editing={editing}
              hint="Ex. bagages, climatisation, sièges — une phrase ou une liste courte."
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

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Photos</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {v.gallery.map((g, i) => (
                  <li
                    key={`${g.src}-${i}`}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)]/80 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--pro-text-muted)]">Photo {i + 1}</span>
                      {i === 0 ? (
                        <span className="rounded-md bg-[var(--pro-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--pro-accent)]">
                          Principale
                        </span>
                      ) : null}
                    </div>
                    <EditableImageField
                      label="Fichier"
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={proBtnDangerClass}
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
                          Supprimer la photo
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
              {editing ? (
                <button
                  type="button"
                  className={`${proBtnSecondaryClass} mt-3`}
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
            </div>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
