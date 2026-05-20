"use client";

import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { ReadonlyField } from "../ReadonlyField";
import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

export function CalculatorTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const pricing = draft.pricing;

  const addCityRule = () => {
    setDraft((d) => ({
      ...d,
      pricing: {
        ...d.pricing,
        cityRules: [
          ...d.pricing.cityRules,
          {
            id: `city-${Date.now()}`,
            city: "",
            type: "discount",
            enabled: true,
          },
        ],
      },
    }));
  };

  const removeCityRule = (id: string) => {
    setDraft((d) => ({
      ...d,
      pricing: {
        ...d.pricing,
        cityRules: d.pricing.cityRules.filter((r) => r.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-4">
      <SettingsCallout
        title="Tarifs / Calculateur"
        description="Ces tarifs sont utilisés pour les prochains calculs."
        caption="Les demandes déjà créées ne sont pas recalculées automatiquement."
      />

      <SettingsSectionCard title="Tarification métier" description="Ajustez les tarifs sans modifier l’algorithme API.">
        <div className="space-y-4">
          <CollapsibleSettingsCard
            title="Base chauffeur / dépôt"
            subtitle="Adresse utilisée côté serveur pour l’approche et le retour dépôt."
            defaultOpen
            editing={editing}
          >
            {editing ? (
              <AddressAutocomplete
                appearance="pro"
                label="Adresse de la base VTC"
                value={draft.calculatorDisplay.vtcBaseAddress}
                placeholder="Tapez au moins 3 caractères pour des suggestions…"
                onChange={(next) => {
                  const v = typeof next === "string" ? next : next.formatted;
                  setDraft((d) => ({
                    ...d,
                    calculatorDisplay: { ...d.calculatorDisplay, vtcBaseAddress: v },
                  }));
                }}
              />
            ) : (
              <ReadonlyField label="Adresse de la base VTC" value={draft.calculatorDisplay.vtcBaseAddress} />
            )}
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Trajets classiques"
            subtitle="Prix au km, minimum et règles hors zone."
            defaultOpen={false}
            editing={editing}
          >
            <EditableSwitch
              label="Section activée"
              checked={pricing.classicTrip.enabled}
              onChange={(v) =>
                setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, enabled: v } } }))
              }
              editing={editing}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <EditableNumberField
                label="Prix/km aller simple"
                value={pricing.classicTrip.oneWayPricePerKm}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, oneWayPricePerKm: v } } }))
                }
                editing={editing}
                min={0}
                step={0.01}
              />
              <EditableNumberField
                label="Prix/km aller-retour"
                value={pricing.classicTrip.roundTripPricePerKm}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, roundTripPricePerKm: v } } }))
                }
                editing={editing}
                min={0}
                step={0.01}
              />
              <EditableNumberField
                label="Prix minimum"
                value={pricing.classicTrip.minimumPrice}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, minimumPrice: v } } }))
                }
                editing={editing}
                min={0}
              />
              <EditableNumberField
                label="Approche chauffeur (EUR/km)"
                value={pricing.classicTrip.approachPricePerKm}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, approachPricePerKm: v } } }))
                }
                editing={editing}
                min={0}
                step={0.01}
              />
              <EditableSwitch
                label="Retour dépôt activé"
                checked={pricing.classicTrip.returnToBaseEnabled}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, returnToBaseEnabled: v } },
                  }))
                }
                editing={editing}
              />
              <EditableNumberField
                label="Multiplicateur hors zone"
                value={pricing.classicTrip.outOfZoneMultiplier}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, outOfZoneMultiplier: v } },
                  }))
                }
                editing={editing}
                min={0}
                step={0.01}
              />
            </div>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Transferts aéroports"
            subtitle="Chaque aéroport peut avoir ses propres minimums."
            defaultOpen={false}
            editing={editing}
          >
            <EditableSwitch
              label="Section activée"
              checked={pricing.airportTransfers.enabled}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, enabled: v } },
                }))
              }
              editing={editing}
            />
            <ul className="mt-4 space-y-3">
              {pricing.airportTransfers.airports.map((a, i) => (
                <li key={`airport-row-${i}`}>
                  <CollapsibleSettingsCard
                    title={`${a.code} - ${a.name || "Sans nom"}`}
                    subtitle="Code, nom, adresse et grilles minimum."
                    defaultOpen={false}
                    editing={editing}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EditableField
                        label="Code"
                        value={a.code}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.pricing.airportTransfers.airports];
                            airports[i] = { ...airports[i], code: v };
                            return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                          })
                        }
                        editing={editing}
                        mono
                      />
                      <EditableField
                        label="Nom"
                        value={a.name}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.pricing.airportTransfers.airports];
                            airports[i] = { ...airports[i], name: v };
                            return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                          })
                        }
                        editing={editing}
                      />
                    </div>
                    <EditableField
                      label="Adresse"
                      value={a.address}
                      onChange={(v) =>
                        setDraft((d) => {
                          const airports = [...d.pricing.airportTransfers.airports];
                          airports[i] = { ...airports[i], address: v };
                          return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                        })
                      }
                      editing={editing}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EditableNumberField
                        label="Prix minimum aller simple"
                        value={a.oneWayMinimumPrice}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.pricing.airportTransfers.airports];
                            airports[i] = { ...airports[i], oneWayMinimumPrice: v };
                            return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                          })
                        }
                        editing={editing}
                        min={0}
                      />
                      <EditableNumberField
                        label="Prix minimum aller-retour"
                        value={a.roundTripMinimumPrice}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.pricing.airportTransfers.airports];
                            airports[i] = { ...airports[i], roundTripMinimumPrice: v };
                            return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                          })
                        }
                        editing={editing}
                        min={0}
                      />
                      <EditableNumberField
                        label="Prix/km"
                        value={a.pricePerKm}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.pricing.airportTransfers.airports];
                            airports[i] = { ...airports[i], pricePerKm: v };
                            return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                          })
                        }
                        editing={editing}
                        min={0}
                        step={0.01}
                      />
                      <EditableSwitch
                        label="Activé"
                        checked={a.enabled}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.pricing.airportTransfers.airports];
                            airports[i] = { ...airports[i], enabled: v };
                            return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                          })
                        }
                        editing={editing}
                      />
                    </div>
                  </CollapsibleSettingsCard>
                </li>
              ))}
            </ul>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Mise à disposition"
            subtitle="Tarif horaire et minimum total."
            defaultOpen={false}
            editing={editing}
          >
            <EditableSwitch
              label="Section activée"
              checked={pricing.hourlyHire.enabled}
              onChange={(v) =>
                setDraft((d) => ({ ...d, pricing: { ...d.pricing, hourlyHire: { ...d.pricing.hourlyHire, enabled: v } } }))
              }
              editing={editing}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <EditableNumberField
                label="Tarif horaire"
                value={pricing.hourlyHire.hourlyRate}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, hourlyHire: { ...d.pricing.hourlyHire, hourlyRate: v } } }))
                }
                editing={editing}
                min={0}
              />
              <EditableNumberField
                label="Minimum"
                value={pricing.hourlyHire.minimumTotal}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, hourlyHire: { ...d.pricing.hourlyHire, minimumTotal: v } } }))
                }
                editing={editing}
                min={0}
              />
            </div>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard title="Majorations" subtitle="Pourcentages appliqués selon le créneau." defaultOpen={false} editing={editing}>
            <div className="grid gap-3 sm:grid-cols-2">
              <EditableNumberField
                label="Nuit %"
                value={pricing.surcharges.nightPercent}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, nightPercent: v } } }))
                }
                editing={editing}
                min={0}
              />
              <EditableNumberField
                label="Soiree %"
                value={pricing.surcharges.eveningPercent}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, eveningPercent: v } } }))
                }
                editing={editing}
                min={0}
              />
              <EditableNumberField
                label="Week-end %"
                value={pricing.surcharges.weekendPercent}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, weekendPercent: v } } }))
                }
                editing={editing}
                min={0}
              />
              <EditableNumberField
                label="Ferie %"
                value={pricing.surcharges.holidayPercent}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, holidayPercent: v } } }))
                }
                editing={editing}
                min={0}
              />
              <EditableNumberField
                label="Minimum majoration"
                value={pricing.surcharges.minimumAmount}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, minimumAmount: v } } }))
                }
                editing={editing}
                min={0}
              />
            </div>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard title="Remises" subtitle="Réglages de remise aller-retour." defaultOpen={false} editing={editing}>
            <EditableSwitch
              label="Activer la remise aller-retour"
              checked={pricing.discounts.roundTripEnabled}
              onChange={(v) =>
                setDraft((d) => ({ ...d, pricing: { ...d.pricing, discounts: { ...d.pricing.discounts, roundTripEnabled: v } } }))
              }
              editing={editing}
            />
            <p className="text-sm text-[var(--pro-text-soft)]">
              Applique une remise de 5&nbsp;% sur le trajet classique aller-retour (avant majorations et minimum).
              Les transferts aéroport ne sont pas concernés. Le pourcentage n’est pas encore réglable ici (activation oui/non uniquement).
            </p>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Villes speciales"
            subtitle="Transport des regles ville vers pricingConfig (application moteur selon support API)."
            defaultOpen={false}
            editing={editing}
          >
            <p className="text-sm text-[var(--pro-text-soft)]">
              Ajouter, modifier ou desactiver vos regles. Si le moteur API ne les applique pas encore, elles restent stockees et transmises.
            </p>
            <button
              type="button"
              onClick={addCityRule}
              className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2 text-sm font-semibold text-[var(--pro-text)]"
            >
              Ajouter une ville speciale
            </button>
            <ul className="space-y-3">
              {pricing.cityRules.map((rule, i) => (
                <li key={rule.id}>
                  <CollapsibleSettingsCard
                    title={rule.city || `Ville speciale ${i + 1}`}
                    subtitle={rule.type}
                    defaultOpen={false}
                    editing={editing}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EditableField
                        label="ID"
                        value={rule.id}
                        onChange={(v) =>
                          setDraft((d) => {
                            const cityRules = [...d.pricing.cityRules];
                            cityRules[i] = { ...cityRules[i], id: v };
                            return { ...d, pricing: { ...d.pricing, cityRules } };
                          })
                        }
                        editing={editing}
                      />
                      <EditableField
                        label="Ville"
                        value={rule.city}
                        onChange={(v) =>
                          setDraft((d) => {
                            const cityRules = [...d.pricing.cityRules];
                            cityRules[i] = { ...cityRules[i], city: v };
                            return { ...d, pricing: { ...d.pricing, cityRules } };
                          })
                        }
                        editing={editing}
                      />
                      <EditableField
                        label="Code postal (optionnel)"
                        value={rule.postalCode ?? ""}
                        onChange={(v) =>
                          setDraft((d) => {
                            const cityRules = [...d.pricing.cityRules];
                            cityRules[i] = { ...cityRules[i], postalCode: v || undefined };
                            return { ...d, pricing: { ...d.pricing, cityRules } };
                          })
                        }
                        editing={editing}
                      />
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pro-text-muted)]">Type</label>
                        {editing ? (
                          <select
                            value={rule.type}
                            onChange={(event) =>
                              setDraft((d) => {
                                const cityRules = [...d.pricing.cityRules];
                                cityRules[i] = { ...cityRules[i], type: event.target.value as typeof rule.type };
                                return { ...d, pricing: { ...d.pricing, cityRules } };
                              })
                            }
                            className="w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)]"
                          >
                            <option value="discount">Remise</option>
                            <option value="fixed_price">Prix fixe</option>
                            <option value="surcharge">Supplement</option>
                            <option value="excluded">Exclue</option>
                          </select>
                        ) : (
                          <p className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)]">
                            {rule.type}
                          </p>
                        )}
                      </div>
                      <EditableNumberField
                        label="Valeur"
                        value={rule.value ?? 0}
                        onChange={(v) =>
                          setDraft((d) => {
                            const cityRules = [...d.pricing.cityRules];
                            cityRules[i] = { ...cityRules[i], value: v };
                            return { ...d, pricing: { ...d.pricing, cityRules } };
                          })
                        }
                        editing={editing}
                        min={0}
                      />
                      <EditableSwitch
                        label="Active"
                        checked={rule.enabled}
                        onChange={(v) =>
                          setDraft((d) => {
                            const cityRules = [...d.pricing.cityRules];
                            cityRules[i] = { ...cityRules[i], enabled: v };
                            return { ...d, pricing: { ...d.pricing, cityRules } };
                          })
                        }
                        editing={editing}
                      />
                    </div>
                    <EditableField
                      label="Note"
                      value={rule.note ?? ""}
                      onChange={(v) =>
                        setDraft((d) => {
                          const cityRules = [...d.pricing.cityRules];
                          cityRules[i] = { ...cityRules[i], note: v || undefined };
                          return { ...d, pricing: { ...d.pricing, cityRules } };
                        })
                      }
                      editing={editing}
                    />
                    <button
                      type="button"
                      onClick={() => removeCityRule(rule.id)}
                      className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200"
                    >
                      Supprimer
                    </button>
                  </CollapsibleSettingsCard>
                </li>
              ))}
            </ul>
          </CollapsibleSettingsCard>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
