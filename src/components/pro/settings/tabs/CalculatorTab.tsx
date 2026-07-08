"use client";

import Link from "next/link";
import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import type { TenantPricingAirport, TenantPricingCityRule } from "@/config/tenant-settings.types";
import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { ReadonlyField } from "../ReadonlyField";
import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import { proBtnDangerClass, proBtnSecondaryClass } from "../editable/proFieldStyles";
import type { SettingsTabsSharedProps } from "./context";

const SECTION_ITEMS = [
  { id: "resume", label: "Résumé" },
  { id: "base-vtc", label: "Base VTC" },
  { id: "trajets-classiques", label: "Trajets classiques" },
  { id: "aeroports", label: "Aéroports" },
  { id: "mise-a-disposition", label: "Mise à disposition" },
  { id: "majorations", label: "Majorations" },
  { id: "remises", label: "Remises" },
  { id: "villes-speciales", label: "Villes spéciales" },
  { id: "test-calcul", label: "Test de calcul" },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatMoney(value: number) {
  return `${value.toFixed(0)} EUR`;
}

function formatRate(value: number) {
  return `${value.toFixed(2)} EUR/km`;
}

function formatStatus(enabled: boolean) {
  return enabled ? "Active" : "Inactive";
}

function badgeClass(enabled: boolean) {
  return enabled
    ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-600"
    : "border-slate-300/60 bg-slate-500/10 text-[var(--pro-text-muted)]";
}

function SummaryCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <article className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-accent)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--pro-text)]">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--pro-text-muted)]">{hint}</p>
    </article>
  );
}

function InlineBadge({ enabled, text }: { enabled: boolean; text: string }) {
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(enabled)}`}>{text}</span>;
}

function AirportPreview({ airport }: { airport: TenantPricingAirport }) {
  return (
    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] text-center shadow-sm">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">AIR</span>
      <span className="mt-1 text-sm font-semibold text-[var(--pro-text)]">{airport.code || "--"}</span>
    </div>
  );
}

function CityRulePreview({ rule }: { rule: TenantPricingCityRule }) {
  const typeLabel =
    rule.type === "discount" ? "Remise" : rule.type === "fixed_price" ? "Fixe" : rule.type === "surcharge" ? "Maj." : "Exclue";

  return (
    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] text-center shadow-sm">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">VILLE</span>
      <span className="mt-1 text-xs font-semibold text-[var(--pro-text)]">{typeLabel}</span>
    </div>
  );
}

export function CalculatorTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const pricing = draft.pricing;
  const activeAirports = pricing.airportTransfers.airports.filter((airport) => airport.enabled);
  const activeAirportCodes = activeAirports.map((airport) => airport.code).filter(Boolean).join(" / ") || "Aucun";
  const activeSurcharges = [
    pricing.surcharges.nightPercent > 0 ? "Nuit" : null,
    pricing.surcharges.eveningPercent > 0 ? "Soirée" : null,
    pricing.surcharges.weekendPercent > 0 ? "Week-end" : null,
    pricing.surcharges.holidayPercent > 0 ? "Férié" : null,
  ]
    .filter(Boolean)
    .join(", ") || "Aucune";
  const activeCityRules = pricing.cityRules.filter((rule) => rule.enabled).length;

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
        cityRules: d.pricing.cityRules.filter((rule) => rule.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[var(--pro-border)] bg-[linear-gradient(135deg,var(--pro-accent-soft),transparent_58%)] shadow-sm">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--pro-accent)]/25 bg-[var(--pro-panel)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-accent)]">
                Tarifs & calculateur
              </span>
              <span className="rounded-full border border-sky-300/50 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700">
                Les demandes existantes ne sont pas recalculées
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--pro-text)] md:text-3xl">
                Configurez les règles utilisées pour les nouveaux calculs.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--pro-text-soft)]">
                Cette zone rassemble la base chauffeur, les trajets classiques, les aéroports, la mise à disposition,
                les majorations, les remises et les villes spéciales dans une vue admin plus claire.
              </p>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-md">
            <SummaryCard
              title="Base actuelle"
              value={draft.calculatorDisplay.vtcBaseAddress?.trim() || "Non renseignée"}
              hint="Utilisée pour l'approche chauffeur et le retour dépôt."
            />
            <SummaryCard
              title="Classique"
              value={`${pricing.classicTrip.oneWayPricePerKm} / ${pricing.classicTrip.roundTripPricePerKm}`}
              hint="Prix/km aller simple et aller-retour."
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <SettingsSectionCard title="Navigation interne" description="Accédez rapidement à chaque groupe de règles.">
            <div className="grid gap-2">
              {SECTION_ITEMS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3.5 py-3 text-left text-sm font-medium text-[var(--pro-text)] shadow-sm transition hover:border-[var(--pro-accent)]/35 hover:bg-[var(--pro-accent-soft)]"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </SettingsSectionCard>

          <SettingsCallout
            title="Aide rapide"
            description="Vous modifiez la présentation et les valeurs transmises au moteur existant. L'algorithme de pricing n'est pas changé dans cette refonte."
            caption="Le bouton Enregistrer du header principal conserve le même fonctionnement qu'avant."
          />
        </aside>

        <div className="space-y-6">
          <section id="resume" className="scroll-mt-24">
            <SettingsSectionCard title="Résumé" description="Vue synthèse des réglages les plus importants avant modification.">
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                <SummaryCard title="Base VTC" value={draft.calculatorDisplay.vtcBaseAddress || "Non renseignée"} hint="Adresse de départ du chauffeur." />
                <SummaryCard
                  title="Minimum classique"
                  value={formatMoney(pricing.classicTrip.minimumPrice)}
                  hint={`Aller simple ${formatRate(pricing.classicTrip.oneWayPricePerKm)}`}
                />
                <SummaryCard title="Aéroports actifs" value={String(activeAirports.length)} hint={activeAirportCodes} />
                <SummaryCard
                  title="Mise à disposition"
                  value={pricing.hourlyHire.enabled ? formatMoney(pricing.hourlyHire.hourlyRate) : "Inactive"}
                  hint={`Minimum ${formatMoney(pricing.hourlyHire.minimumTotal)}`}
                />
                <SummaryCard title="Majorations" value={activeSurcharges} hint={`Minimum ${formatMoney(pricing.surcharges.minimumAmount)}`} />
                <SummaryCard
                  title="Remise aller-retour"
                  value={pricing.discounts.roundTripEnabled ? "Active" : "Inactive"}
                  hint="La règle exacte reste définie par le moteur."
                />
                <SummaryCard title="Retour dépôt" value={formatStatus(pricing.classicTrip.returnToBaseEnabled)} hint="Applicable aux trajets classiques." />
                <SummaryCard title="Villes spéciales" value={String(activeCityRules)} hint="Règles actives stockées et transmises." />
              </div>
            </SettingsSectionCard>
          </section>

          <section id="base-vtc" className="scroll-mt-24">
            <SettingsSectionCard
              title="Base VTC"
              description="Adresse de référence du chauffeur, utilisée pour calculer l'approche et le retour dépôt."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className="space-y-4">
                  {editing ? (
                    <AddressAutocomplete
                      appearance="pro"
                      label="Adresse de la base VTC"
                      value={draft.calculatorDisplay.vtcBaseAddress}
                      placeholder="Tapez au moins 3 caractères pour des suggestions..."
                      onChange={(next) => {
                        const value = typeof next === "string" ? next : next.formatted;
                        setDraft((d) => ({
                          ...d,
                          calculatorDisplay: { ...d.calculatorDisplay, vtcBaseAddress: value },
                        }));
                      }}
                    />
                  ) : (
                    <ReadonlyField label="Adresse de la base VTC" value={draft.calculatorDisplay.vtcBaseAddress} />
                  )}
                </div>
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">À quoi sert cette adresse ?</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--pro-text-soft)]">
                    Cette adresse sert de point de départ du chauffeur pour calculer le trajet d’approche et le retour dépôt.
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--pro-text-muted)]">
                    Aucun géocodage supplémentaire n’est ajouté dans cette passe. Vous gardez le même comportement de calcul qu’aujourd’hui.
                  </p>
                </div>
              </div>
            </SettingsSectionCard>
          </section>

          <section id="trajets-classiques" className="scroll-mt-24">
            <SettingsSectionCard
              title="Trajets classiques"
              description="Réglez les trajets standards : activation, prix au kilomètre, minimum, approche chauffeur et retour dépôt."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div className="space-y-4">
                  <EditableSwitch
                    label="Section activée"
                    checked={pricing.classicTrip.enabled}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, enabled: value } } }))
                    }
                    editing={editing}
                    hint="Désactivez uniquement si vous ne souhaitez plus proposer les trajets classiques."
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <EditableNumberField
                      label="Prix/km aller simple"
                      value={pricing.classicTrip.oneWayPricePerKm}
                      onChange={(value) =>
                        setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, oneWayPricePerKm: value } } }))
                      }
                      editing={editing}
                      min={0}
                      step={0.01}
                      suffix="EUR/km"
                    />
                    <EditableNumberField
                      label="Prix/km aller-retour"
                      value={pricing.classicTrip.roundTripPricePerKm}
                      onChange={(value) =>
                        setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, roundTripPricePerKm: value } } }))
                      }
                      editing={editing}
                      min={0}
                      step={0.01}
                      suffix="EUR/km"
                    />
                    <EditableNumberField
                      label="Prix minimum"
                      value={pricing.classicTrip.minimumPrice}
                      onChange={(value) =>
                        setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, minimumPrice: value } } }))
                      }
                      editing={editing}
                      min={0}
                      suffix="EUR"
                    />
                    <EditableNumberField
                      label="Approche chauffeur"
                      value={pricing.classicTrip.approachPricePerKm}
                      onChange={(value) =>
                        setDraft((d) => ({ ...d, pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, approachPricePerKm: value } } }))
                      }
                      editing={editing}
                      min={0}
                      step={0.01}
                      suffix="EUR/km"
                    />
                    <EditableSwitch
                      label="Retour dépôt activé"
                      checked={pricing.classicTrip.returnToBaseEnabled}
                      onChange={(value) =>
                        setDraft((d) => ({
                          ...d,
                          pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, returnToBaseEnabled: value } },
                        }))
                      }
                      editing={editing}
                    />
                    <EditableNumberField
                      label="Multiplicateur hors zone"
                      value={pricing.classicTrip.outOfZoneMultiplier}
                      onChange={(value) =>
                        setDraft((d) => ({
                          ...d,
                          pricing: { ...d.pricing, classicTrip: { ...d.pricing.classicTrip, outOfZoneMultiplier: value } },
                        }))
                      }
                      editing={editing}
                      min={0}
                      step={0.01}
                      suffix="x"
                    />
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Ce que vous modifiez ici</p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--pro-text-soft)]">
                    <li>Le prix au kilomètre du trajet classique.</li>
                    <li>Le minimum facturé si le calcul brut est trop faible.</li>
                    <li>Le coût d’approche chauffeur.</li>
                    <li>Le retour dépôt et le multiplicateur hors zone.</li>
                  </ul>
                </div>
              </div>
            </SettingsSectionCard>
          </section>

          <section id="aeroports" className="scroll-mt-24">
            <SettingsSectionCard
              title="Aéroports"
              description="Chaque aéroport dispose de sa propre carte, avec un résumé rapide puis un détail éditable."
            >
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <SummaryCard title="Section" value={formatStatus(pricing.airportTransfers.enabled)} hint="Active ou inactive pour les nouveaux calculs." />
                  <SummaryCard title="Aéroports actifs" value={String(activeAirports.length)} hint={activeAirportCodes} />
                  <SummaryCard title="Premier repère" value={pricing.airportTransfers.airports[0]?.code || "--"} hint="Codes habituellement attendus : ORY, CDG, BVA, CC." />
                </div>

                <EditableSwitch
                  label="Section activée"
                  checked={pricing.airportTransfers.enabled}
                  onChange={(value) =>
                    setDraft((d) => ({
                      ...d,
                      pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, enabled: value } },
                    }))
                  }
                  editing={editing}
                />

                <ul className="space-y-3">
                  {pricing.airportTransfers.airports.map((airport, index) => (
                    <li key={`airport-row-${index}`}>
                      <CollapsibleSettingsCard
                        title={`${airport.code || "Aéroport"} - ${airport.name || "Sans nom"}`}
                        subtitle={`Minimum AS ${formatMoney(airport.oneWayMinimumPrice)} · Minimum AR ${formatMoney(
                          airport.roundTripMinimumPrice
                        )} · ${formatRate(airport.pricePerKm)}`}
                        defaultOpen={activeAirports.length <= 2 && index === 0}
                        editing={editing}
                        badge={<InlineBadge enabled={airport.enabled} text={airport.enabled ? "Active" : "Inactive"} />}
                        preview={<AirportPreview airport={airport} />}
                      >
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                              <EditableField
                                label="Code"
                                value={airport.code}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const airports = [...d.pricing.airportTransfers.airports];
                                    airports[index] = { ...airports[index], code: value };
                                    return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                  })
                                }
                                editing={editing}
                                mono
                              />
                              <EditableField
                                label="Nom"
                                value={airport.name}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const airports = [...d.pricing.airportTransfers.airports];
                                    airports[index] = { ...airports[index], name: value };
                                    return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                  })
                                }
                                editing={editing}
                              />
                            </div>

                            <EditableField
                              label="Adresse"
                              value={airport.address}
                              onChange={(value) =>
                                setDraft((d) => {
                                  const airports = [...d.pricing.airportTransfers.airports];
                                  airports[index] = { ...airports[index], address: value };
                                  return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                })
                              }
                              editing={editing}
                            />

                            <div className="grid gap-3 md:grid-cols-2">
                              <EditableNumberField
                                label="Minimum aller simple"
                                value={airport.oneWayMinimumPrice}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const airports = [...d.pricing.airportTransfers.airports];
                                    airports[index] = { ...airports[index], oneWayMinimumPrice: value };
                                    return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                  })
                                }
                                editing={editing}
                                min={0}
                                suffix="EUR"
                              />
                              <EditableNumberField
                                label="Minimum aller-retour"
                                value={airport.roundTripMinimumPrice}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const airports = [...d.pricing.airportTransfers.airports];
                                    airports[index] = { ...airports[index], roundTripMinimumPrice: value };
                                    return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                  })
                                }
                                editing={editing}
                                min={0}
                                suffix="EUR"
                              />
                              <EditableNumberField
                                label="Prix/km"
                                value={airport.pricePerKm}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const airports = [...d.pricing.airportTransfers.airports];
                                    airports[index] = { ...airports[index], pricePerKm: value };
                                    return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                  })
                                }
                                editing={editing}
                                min={0}
                                step={0.01}
                                suffix="EUR/km"
                              />
                              <EditableSwitch
                                label="Aéroport activé"
                                checked={airport.enabled}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const airports = [...d.pricing.airportTransfers.airports];
                                    airports[index] = { ...airports[index], enabled: value };
                                    return { ...d, pricing: { ...d.pricing, airportTransfers: { ...d.pricing.airportTransfers, airports } } };
                                  })
                                }
                                editing={editing}
                              />
                            </div>
                          </div>

                          <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                            <p className="text-sm font-semibold text-[var(--pro-text)]">Résumé rapide</p>
                            <div className="mt-3 grid gap-3">
                              <ReadonlyField label="Code" value={airport.code} />
                              <ReadonlyField label="Minimum aller simple" value={airport.oneWayMinimumPrice} suffix="EUR" />
                              <ReadonlyField label="Minimum aller-retour" value={airport.roundTripMinimumPrice} suffix="EUR" />
                              <ReadonlyField label="Prix/km" value={airport.pricePerKm} suffix="EUR/km" />
                            </div>
                          </div>
                        </div>
                      </CollapsibleSettingsCard>
                    </li>
                  ))}
                </ul>
              </div>
            </SettingsSectionCard>
          </section>

          <section id="mise-a-disposition" className="scroll-mt-24">
            <SettingsSectionCard
              title="Mise à disposition"
              description="Carte dédiée aux tarifs horaires et au minimum appliqué pour la mise à disposition."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <EditableSwitch
                    label="Section activée"
                    checked={pricing.hourlyHire.enabled}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, hourlyHire: { ...d.pricing.hourlyHire, enabled: value } } }))
                    }
                    editing={editing}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <EditableNumberField
                      label="Tarif horaire"
                      value={pricing.hourlyHire.hourlyRate}
                      onChange={(value) =>
                        setDraft((d) => ({ ...d, pricing: { ...d.pricing, hourlyHire: { ...d.pricing.hourlyHire, hourlyRate: value } } }))
                      }
                      editing={editing}
                      min={0}
                      suffix="EUR/h"
                    />
                    <EditableNumberField
                      label="Minimum"
                      value={pricing.hourlyHire.minimumTotal}
                      onChange={(value) =>
                        setDraft((d) => ({ ...d, pricing: { ...d.pricing, hourlyHire: { ...d.pricing.hourlyHire, minimumTotal: value } } }))
                      }
                      editing={editing}
                      min={0}
                      suffix="EUR"
                    />
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Lecture métier</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--pro-text-soft)]">
                    Cette section sert à régler la mise à disposition : tarif horaire, activation et minimum facturé.
                  </p>
                </div>
              </div>
            </SettingsSectionCard>
          </section>

          <section id="majorations" className="scroll-mt-24">
            <SettingsSectionCard
              title="Majorations"
              description="Ces pourcentages sont appliqués selon le créneau détecté par le moteur."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-3 md:grid-cols-2">
                  <EditableNumberField
                    label="Nuit"
                    value={pricing.surcharges.nightPercent}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, nightPercent: value } } }))
                    }
                    editing={editing}
                    min={0}
                    suffix="%"
                  />
                  <EditableNumberField
                    label="Soirée"
                    value={pricing.surcharges.eveningPercent}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, eveningPercent: value } } }))
                    }
                    editing={editing}
                    min={0}
                    suffix="%"
                  />
                  <EditableNumberField
                    label="Week-end"
                    value={pricing.surcharges.weekendPercent}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, weekendPercent: value } } }))
                    }
                    editing={editing}
                    min={0}
                    suffix="%"
                  />
                  <EditableNumberField
                    label="Férié"
                    value={pricing.surcharges.holidayPercent}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, holidayPercent: value } } }))
                    }
                    editing={editing}
                    min={0}
                    suffix="%"
                  />
                  <EditableNumberField
                    label="Minimum majoration"
                    value={pricing.surcharges.minimumAmount}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, surcharges: { ...d.pricing.surcharges, minimumAmount: value } } }))
                    }
                    editing={editing}
                    min={0}
                    suffix="EUR"
                  />
                </div>
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Aide contextuelle</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--pro-text-soft)]">
                    Ces pourcentages sont appliqués selon le créneau détecté par le moteur.
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--pro-text-muted)]">
                    Le minimum majoration permet d’éviter une hausse trop faible sur certains trajets.
                  </p>
                </div>
              </div>
            </SettingsSectionCard>
          </section>

          <section id="remises" className="scroll-mt-24">
            <SettingsSectionCard
              title="Remises"
              description="Activez ou désactivez la remise aller-retour. La règle exacte reste définie côté moteur."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <EditableSwitch
                    label="Activer la remise aller-retour"
                    checked={pricing.discounts.roundTripEnabled}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, pricing: { ...d.pricing, discounts: { ...d.pricing.discounts, roundTripEnabled: value } } }))
                    }
                    editing={editing}
                  />
                  <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
                      La règle exacte est définie côté moteur. Cette interface vous permet seulement d’activer ou de désactiver la remise aller-retour.
                    </p>
                  </div>
                </div>
                <SummaryCard
                  title="Etat"
                  value={pricing.discounts.roundTripEnabled ? "Remise active" : "Remise inactive"}
                  hint="Les transferts aéroport ne sont pas concernés."
                />
              </div>
            </SettingsSectionCard>
          </section>

          <section id="villes-speciales" className="scroll-mt-24">
            <SettingsSectionCard
              title="Villes spéciales"
              description="Ces règles sont stockées et transmises. Leur application dépend du support moteur."
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--pro-text)]">Règles ville</p>
                    <p className="text-sm text-[var(--pro-text-soft)]">
                      Ajoutez, modifiez ou désactivez des comportements spécifiques par ville ou code postal.
                    </p>
                  </div>
                  <button type="button" onClick={addCityRule} className={proBtnSecondaryClass}>
                    Ajouter une ville spéciale
                  </button>
                </div>

                {pricing.cityRules.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-8 text-center text-sm text-[var(--pro-text-muted)]">
                    Aucune ville spéciale configurée.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {pricing.cityRules.map((rule, index) => (
                      <li key={rule.id}>
                        <CollapsibleSettingsCard
                          title={rule.city || `Ville speciale ${index + 1}`}
                          subtitle={`${rule.type} ${typeof rule.value === "number" ? `· ${rule.value}` : ""}`}
                          defaultOpen={index === 0}
                          editing={editing}
                          badge={<InlineBadge enabled={rule.enabled} text={rule.enabled ? "Active" : "Inactive"} />}
                          preview={<CityRulePreview rule={rule} />}
                        >
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                              <EditableField
                                label="ID"
                                value={rule.id}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const cityRules = [...d.pricing.cityRules];
                                    cityRules[index] = { ...cityRules[index], id: value };
                                    return { ...d, pricing: { ...d.pricing, cityRules } };
                                  })
                                }
                                editing={editing}
                                hint="Identifiant technique conserve pour la structure API."
                              />
                              <EditableField
                                label="Ville"
                                value={rule.city}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const cityRules = [...d.pricing.cityRules];
                                    cityRules[index] = { ...cityRules[index], city: value };
                                    return { ...d, pricing: { ...d.pricing, cityRules } };
                                  })
                                }
                                editing={editing}
                              />
                              <EditableField
                                label="Code postal"
                                value={rule.postalCode ?? ""}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const cityRules = [...d.pricing.cityRules];
                                    cityRules[index] = { ...cityRules[index], postalCode: value || undefined };
                                    return { ...d, pricing: { ...d.pricing, cityRules } };
                                  })
                                }
                                editing={editing}
                              />
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pro-text-muted)]">Type de regle</label>
                                {editing ? (
                                  <select
                                    value={rule.type}
                                    onChange={(event) =>
                                      setDraft((d) => {
                                        const cityRules = [...d.pricing.cityRules];
                                        cityRules[index] = { ...cityRules[index], type: event.target.value as typeof rule.type };
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
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const cityRules = [...d.pricing.cityRules];
                                    cityRules[index] = { ...cityRules[index], value };
                                    return { ...d, pricing: { ...d.pricing, cityRules } };
                                  })
                                }
                                editing={editing}
                                min={0}
                              />
                              <EditableSwitch
                                label="Regle active"
                                checked={rule.enabled}
                                onChange={(value) =>
                                  setDraft((d) => {
                                    const cityRules = [...d.pricing.cityRules];
                                    cityRules[index] = { ...cityRules[index], enabled: value };
                                    return { ...d, pricing: { ...d.pricing, cityRules } };
                                  })
                                }
                                editing={editing}
                              />
                            </div>
                            <EditableField
                              label="Note interne"
                              value={rule.note ?? ""}
                              onChange={(value) =>
                                setDraft((d) => {
                                  const cityRules = [...d.pricing.cityRules];
                                  cityRules[index] = { ...cityRules[index], note: value || undefined };
                                  return { ...d, pricing: { ...d.pricing, cityRules } };
                                })
                              }
                              editing={editing}
                            />
                            <button type="button" onClick={() => removeCityRule(rule.id)} className={proBtnDangerClass}>
                              Supprimer cette regle
                            </button>
                          </div>
                        </CollapsibleSettingsCard>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SettingsSectionCard>
          </section>

          <section id="test-calcul" className="scroll-mt-24">
            <SettingsSectionCard
              title="Test de calcul"
              description="Espace reserve a un test rapide de tarif sans quitter l univers admin."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/55 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Emplacement prepare</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--pro-text-soft)]">
                    Cette passe se concentre sur la clarte de la configuration tarifaire. Le module de test inline peut etre ajoute ensuite
                    sans changer la structure de cette page.
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--pro-text-muted)]">
                    En attendant, vous pouvez verifier le calcul sur le calculateur public avec la configuration actuelle.
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel)] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Acces rapide</p>
                  <Link
                    href="/calculateur"
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--pro-accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                  >
                    Ouvrir le calculateur public
                  </Link>
                  <p className="text-xs leading-relaxed text-[var(--pro-text-muted)]">
                    Le calculateur public n est pas modifie par cette refonte UX admin.
                  </p>
                </div>
              </div>
            </SettingsSectionCard>
          </section>
        </div>
      </div>
    </div>
  );
}
