"use client";

import { useState } from "react";
import type { VehicleListItem } from "@/config/tenant-settings.types";
import { normalizeTenantVehicles } from "@/lib/tenantVehiclesNormalize";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import { EditableImageField } from "../editable/EditableImageField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { SimpleStringListEditor } from "../editable/SimpleStringListEditor";
import { proBtnDangerClass, proBtnSecondaryClass } from "../editable/proFieldStyles";
import type { SettingsTabsSharedProps } from "./context";

function VehicleThumb({ src, alt }: { src?: string; alt?: string }) {
  const s = src?.trim();
  const [broken, setBroken] = useState(false);
  if (!s || broken) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel)] text-[10px] text-[var(--pro-text-muted)]">
        Photo
      </div>
    );
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- aperçu paramètres (uploads + statiques) */}
      <img
        src={s}
        alt={alt || ""}
        className="h-14 w-14 shrink-0 rounded-xl border border-[var(--pro-border)] object-cover"
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </>
  );
}

function newVehicleItem(from: VehicleListItem): VehicleListItem {
  const v = structuredClone(from);
  v.id = `veh_${crypto.randomUUID()}`;
  v.name = "Nouveau véhicule";
  v.enabled = true;
  v.headline = "";
  v.highlightText = "";
  v.baggageLabel = "";
  v.gallery = [{ src: "", alt: "", tag: "Photo" }];
  return v;
}

export function VehiclesTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const items = draft.vehicles.items;

  const patch = (next: typeof draft) => normalizeTenantVehicles(next);

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Flotte"
        description="Gérez plusieurs véhicules : un seul est « mis en avant » sur l’accueil (carte principale). Les véhicules inactifs restent masqués sur le site public."
      >
        <ul className="space-y-4">
          {items.map((veh, i) => {
            const mainPhoto = veh.gallery[0];
            const isSpotlight = draft.vehicles.featuredVehicleId === veh.id;
            const subtitleParts = [
              `${veh.passengerMax} passager(s) max.`,
              veh.baggageLabel?.trim() ? `Bagages : ${veh.baggageLabel.trim()}` : null,
            ].filter(Boolean);

            return (
              <li key={veh.id}>
                <CollapsibleSettingsCard
                  title={veh.name?.trim() || "Sans nom"}
                  subtitle={subtitleParts.join(" · ")}
                  defaultOpen={i === 0}
                  editing={editing}
                  preview={<VehicleThumb src={mainPhoto?.src} alt={mainPhoto?.alt || veh.name} />}
                  badge={
                    <>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          veh.enabled
                            ? "border-emerald-400/35 bg-emerald-500/10 text-[var(--pro-text)]"
                            : "border-white/15 bg-[var(--pro-panel-muted)] text-[var(--pro-text-muted)]"
                        }`}
                      >
                        {veh.enabled ? "Actif" : "Inactif"}
                      </span>
                      {isSpotlight ? (
                        <span className="rounded-full border border-[var(--pro-accent)]/40 bg-[var(--pro-accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--pro-accent)]">
                          Mis en avant
                        </span>
                      ) : null}
                    </>
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {editing ? (
                      <button
                        type="button"
                        className={proBtnDangerClass}
                        onClick={() => {
                          if (!window.confirm("Supprimer ce véhicule ?")) return;
                          setDraft((d) =>
                            patch({
                              ...d,
                              vehicles: {
                                ...d.vehicles,
                                items: d.vehicles.items.filter((_, j) => j !== i),
                              },
                            })
                          );
                        }}
                      >
                        Supprimer le véhicule
                      </button>
                    ) : null}
                  </div>

                  <EditableSwitch
                    label="Afficher sur le site"
                    checked={veh.enabled}
                    onChange={(v) =>
                      setDraft((d) => {
                        const nextItems = [...d.vehicles.items];
                        nextItems[i] = { ...nextItems[i], enabled: v };
                        return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                      })
                    }
                    editing={editing}
                    hint="Désactivé : le véhicule n’apparaît plus sur les pages publiques."
                  />

                  {!isSpotlight && veh.enabled && editing ? (
                    <button
                      type="button"
                      className={proBtnSecondaryClass}
                      onClick={() =>
                        setDraft((d) => patch({ ...d, vehicles: { ...d.vehicles, featuredVehicleId: veh.id } }))
                      }
                    >
                      Mettre en avant sur le site
                    </button>
                  ) : null}

                  <details className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 px-3 py-2 text-sm">
                    <summary className="cursor-pointer font-medium text-[var(--pro-text-soft)]">Référence interne (avancé)</summary>
                    <EditableField
                      label="ID véhicule"
                      value={veh.id}
                      onChange={(id) =>
                        setDraft((d) => {
                          const nextItems = [...d.vehicles.items];
                          nextItems[i] = { ...nextItems[i], id };
                          let fv = d.vehicles.featuredVehicleId;
                          if (fv === veh.id) fv = id;
                          return patch({
                            ...d,
                            vehicles: { ...d.vehicles, featuredVehicleId: fv, items: nextItems },
                          });
                        })
                      }
                      editing={editing}
                      mono
                      hint="À ne changer que si vous savez pourquoi (liens, intégrations)."
                    />
                  </details>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <EditableField
                      label="Nom"
                      value={veh.name}
                      onChange={(name) =>
                        setDraft((d) => {
                          const nextItems = [...d.vehicles.items];
                          nextItems[i] = { ...nextItems[i], name };
                          return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                        })
                      }
                      editing={editing}
                    />
                    <EditableNumberField
                      label="Passagers max."
                      value={veh.passengerMax}
                      onChange={(passengerMax) =>
                        setDraft((d) => {
                          const nextItems = [...d.vehicles.items];
                          nextItems[i] = { ...nextItems[i], passengerMax: Math.max(1, passengerMax) };
                          return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                        })
                      }
                      editing={editing}
                      min={1}
                    />
                  </div>

                  <EditableField
                    label="Bagages (texte court)"
                    value={veh.baggageLabel ?? ""}
                    onChange={(baggageLabel) =>
                      setDraft((d) => {
                        const nextItems = [...d.vehicles.items];
                        nextItems[i] = { ...nextItems[i], baggageLabel };
                        return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                      })
                    }
                    editing={editing}
                    hint="Ex. « 3 grandes valises » — affichage vitrine."
                  />

                  <EditableField
                    label="Description courte (accroche)"
                    value={veh.headline}
                    onChange={(headline) =>
                      setDraft((d) => {
                        const nextItems = [...d.vehicles.items];
                        nextItems[i] = { ...nextItems[i], headline };
                        return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                      })
                    }
                    editing={editing}
                  />
                  <EditableField
                    label="Équipements & confort (texte libre)"
                    value={veh.highlightText ?? ""}
                    onChange={(highlightText) =>
                      setDraft((d) => {
                        const nextItems = [...d.vehicles.items];
                        nextItems[i] = { ...nextItems[i], highlightText };
                        return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                      })
                    }
                    editing={editing}
                    hint="Ex. climatisation, Wi‑Fi, sièges — une phrase ou une liste courte."
                  />
                  <SimpleStringListEditor
                    label="Paiements affichés (puces)"
                    items={veh.paymentChips}
                    onChange={(paymentChips) =>
                      setDraft((d) => {
                        const nextItems = [...d.vehicles.items];
                        nextItems[i] = { ...nextItems[i], paymentChips };
                        return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                      })
                    }
                    editing={editing}
                  />

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Photos</p>
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {veh.gallery.map((g, gi) => (
                        <li
                          key={`${veh.id}-g-${gi}`}
                          className="flex flex-col gap-3 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)]/80 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[var(--pro-text-muted)]">Photo {gi + 1}</span>
                            {gi === 0 ? (
                              <span className="rounded-md bg-[var(--pro-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--pro-accent)]">
                                Principale
                              </span>
                            ) : null}
                          </div>
                          <EditableImageField
                            label="Image"
                            value={g.src}
                            onChange={(src) =>
                              setDraft((d) => {
                                const nextItems = [...d.vehicles.items];
                                const gallery = [...nextItems[i].gallery];
                                gallery[gi] = { ...gallery[gi], src };
                                nextItems[i] = { ...nextItems[i], gallery };
                                return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
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
                                const nextItems = [...d.vehicles.items];
                                const gallery = [...nextItems[i].gallery];
                                gallery[gi] = { ...gallery[gi], alt };
                                nextItems[i] = { ...nextItems[i], gallery };
                                return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                              })
                            }
                            editing={editing}
                          />
                          <EditableField
                            label="Légende (tag)"
                            value={g.tag}
                            onChange={(tag) =>
                              setDraft((d) => {
                                const nextItems = [...d.vehicles.items];
                                const gallery = [...nextItems[i].gallery];
                                gallery[gi] = { ...gallery[gi], tag };
                                nextItems[i] = { ...nextItems[i], gallery };
                                return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
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
                                  setDraft((d) => {
                                    const nextItems = [...d.vehicles.items];
                                    const gallery = nextItems[i].gallery.filter((_, j) => j !== gi);
                                    nextItems[i] = { ...nextItems[i], gallery };
                                    return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                                  })
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
                          setDraft((d) => {
                            const nextItems = [...d.vehicles.items];
                            nextItems[i] = {
                              ...nextItems[i],
                              gallery: [...nextItems[i].gallery, { src: "", alt: "", tag: "Photo" }],
                            };
                            return patch({ ...d, vehicles: { ...d.vehicles, items: nextItems } });
                          })
                        }
                      >
                        Ajouter une photo
                      </button>
                    ) : null}
                  </div>
                </CollapsibleSettingsCard>
              </li>
            );
          })}
        </ul>

        {editing ? (
          <button
            type="button"
            className={`${proBtnSecondaryClass} mt-2`}
            onClick={() =>
              setDraft((d) => {
                const template: VehicleListItem =
                  d.vehicles.items.length > 0
                    ? d.vehicles.items[d.vehicles.items.length - 1]!
                    : { ...d.vehicles.featured, enabled: true, baggageLabel: "" };
                return patch({
                  ...d,
                  vehicles: { ...d.vehicles, items: [...d.vehicles.items, newVehicleItem(template)] },
                });
              })
            }
          >
            Ajouter un véhicule
          </button>
        ) : null}
      </SettingsSectionCard>
    </div>
  );
}
