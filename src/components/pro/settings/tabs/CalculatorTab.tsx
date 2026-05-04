"use client";

import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import { ReadonlyField } from "../ReadonlyField";
import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

export function CalculatorTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-4">
      <SettingsCallout
        title="Ce que vous réglez ici"
        description="Cet onglet pilote surtout l’affichage du formulaire public. Le montant final reste calculé par le moteur de calcul existant."
        caption="Les aides ci-dessous servent à mieux comprendre chaque bloc sans changer la logique actuelle."
      />

      <SettingsSectionCard title="Calculateur vitrine" description="Ouvrez uniquement la section à modifier.">
        <div className="space-y-4">
          <CollapsibleSettingsCard
            title="Base chauffeur / dépôt"
            subtitle="Adresse utilisée pour calculer l’approche et le retour dépôt."
            defaultOpen
            editing={editing}
          >
            <p className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--pro-text-soft)]">
              Cette adresse sert de point de départ du chauffeur pour calculer le trajet d’approche et le retour dépôt. Elle est
              réutilisée dans les calculs existants tels qu’ils fonctionnent déjà. Vous pouvez la saisir librement ou choisir une
              suggestion (sans appeler le calculateur de distance ici).
            </p>
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
            title="Types de prestations"
            subtitle="Choisissez les types de demandes visibles dans le formulaire public."
            defaultOpen={false}
            editing={editing}
          >
            <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
              Chaque carte aide le client à choisir son besoin dès le début du formulaire.
            </p>
            <ul className="mt-3 space-y-3">
              {draft.calculatorDisplay.serviceTypes.map((s, i) => (
                <li key={s.id}>
                  <CollapsibleSettingsCard
                    title={s.label || `Prestation ${i + 1}`}
                    subtitle={s.sublabel || "Sous-titre affiché sur la carte."}
                    defaultOpen={false}
                    editing={editing}
                    badge={
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          s.enabled
                            ? "border-emerald-400/35 bg-emerald-500/10 text-[var(--pro-text)]"
                            : "border-white/15 bg-[var(--pro-panel-muted)] text-[var(--pro-text-muted)]"
                        }`}
                      >
                        {s.enabled ? "Visible" : "Masqué"}
                      </span>
                    }
                  >
                    <EditableSwitch
                      label="Option visible"
                      checked={s.enabled}
                      onChange={(v) =>
                        setDraft((d) => {
                          const serviceTypes = [...d.calculatorDisplay.serviceTypes];
                          serviceTypes[i] = { ...serviceTypes[i], enabled: v };
                          return { ...d, calculatorDisplay: { ...d.calculatorDisplay, serviceTypes } };
                        })
                      }
                      editing={editing}
                      hint="Désactivez une option pour la retirer du formulaire sans la supprimer."
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EditableField
                        label="Libellé"
                        value={s.label}
                        onChange={(v) =>
                          setDraft((d) => {
                            const serviceTypes = [...d.calculatorDisplay.serviceTypes];
                            serviceTypes[i] = { ...serviceTypes[i], label: v };
                            return { ...d, calculatorDisplay: { ...d.calculatorDisplay, serviceTypes } };
                          })
                        }
                        editing={editing}
                      />
                      <EditableField
                        label="Sous-titre"
                        value={s.sublabel}
                        onChange={(v) =>
                          setDraft((d) => {
                            const serviceTypes = [...d.calculatorDisplay.serviceTypes];
                            serviceTypes[i] = { ...serviceTypes[i], sublabel: v };
                            return { ...d, calculatorDisplay: { ...d.calculatorDisplay, serviceTypes } };
                          })
                        }
                        editing={editing}
                        hint="Phrase courte pour aider le client à choisir."
                      />
                    </div>
                  </CollapsibleSettingsCard>
                </li>
              ))}
            </ul>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Passagers et bagages"
            subtitle="Limites affichées dans le formulaire client."
            defaultOpen={false}
            editing={editing}
          >
            <p className="text-sm text-[var(--pro-text-soft)]">
              Ces limites contrôlent les choix visibles pour le client. Elles ne changent pas les règles tarifaires avancées.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <EditableNumberField
                label="Passagers maximum"
                value={draft.calculatorDisplay.maxPassengers}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    calculatorDisplay: { ...d.calculatorDisplay, maxPassengers: Math.max(1, Math.floor(v)) },
                  }))
                }
                editing={editing}
                min={1}
                hint="Le client verra un choix de 1 à N passagers."
              />
              <EditableNumberField
                label="Bagages maximum"
                value={draft.calculatorDisplay.maxBaggageIndex}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    calculatorDisplay: { ...d.calculatorDisplay, maxBaggageIndex: Math.max(0, Math.floor(v)) },
                  }))
                }
                editing={editing}
                min={0}
                hint="0 signifie aucun bagage proposé dans la liste."
              />
            </div>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Aéroports proposés"
            subtitle="Aéroports visibles dans le formulaire de transfert aéroport."
            defaultOpen={false}
            editing={editing}
          >
            <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
              Gardez des libellés clairs et une adresse exploitable pour vos transferts.
            </p>
            <ul className="mt-3 space-y-3">
              {draft.calculatorDisplay.airports.map((a, i) => (
                <li key={`airport-row-${i}`}>
                  <CollapsibleSettingsCard
                    title={`${a.code} — ${a.label || "Sans nom"}`}
                    subtitle="Code IATA ou repère · nom affiché"
                    defaultOpen={false}
                    editing={editing}
                    preview={
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] font-mono text-xs font-bold text-[var(--pro-accent)]">
                        {a.code}
                      </div>
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EditableField
                        label="Code"
                        value={a.code}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.calculatorDisplay.airports];
                            airports[i] = { ...airports[i], code: v };
                            return { ...d, calculatorDisplay: { ...d.calculatorDisplay, airports } };
                          })
                        }
                        editing={editing}
                        mono
                      />
                      <EditableField
                        label="Nom affiché"
                        value={a.label}
                        onChange={(v) =>
                          setDraft((d) => {
                            const airports = [...d.calculatorDisplay.airports];
                            airports[i] = { ...airports[i], label: v };
                            return { ...d, calculatorDisplay: { ...d.calculatorDisplay, airports } };
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
                          const airports = [...d.calculatorDisplay.airports];
                          airports[i] = { ...airports[i], address: v };
                          return { ...d, calculatorDisplay: { ...d.calculatorDisplay, airports } };
                        })
                      }
                      editing={editing}
                    />
                  </CollapsibleSettingsCard>
                </li>
              ))}
            </ul>
          </CollapsibleSettingsCard>

          <CollapsibleSettingsCard
            title="Options extras"
            subtitle="Options proposées au client sous forme de cases à cocher."
            defaultOpen={false}
            editing={editing}
          >
            <ul className="space-y-3">
              {draft.calculatorDisplay.extrasOptions.map((e, i) => (
                <li key={e.id}>
                  <CollapsibleSettingsCard
                    title={e.label || `Option ${i + 1}`}
                    subtitle="Case à cocher dans le formulaire public"
                    defaultOpen={false}
                    editing={editing}
                    badge={
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          e.enabled
                            ? "border-emerald-400/35 bg-emerald-500/10 text-[var(--pro-text)]"
                            : "border-white/15 bg-[var(--pro-panel-muted)] text-[var(--pro-text-muted)]"
                        }`}
                      >
                        {e.enabled ? "Proposée" : "Masquée"}
                      </span>
                    }
                  >
                    <EditableSwitch
                      label="Option proposée"
                      checked={e.enabled}
                      onChange={(v) =>
                        setDraft((d) => {
                          const extrasOptions = [...d.calculatorDisplay.extrasOptions];
                          extrasOptions[i] = { ...extrasOptions[i], enabled: v };
                          return { ...d, calculatorDisplay: { ...d.calculatorDisplay, extrasOptions } };
                        })
                      }
                      editing={editing}
                    />
                    <EditableField
                      label="Libellé"
                      value={e.label}
                      onChange={(v) =>
                        setDraft((d) => {
                          const extrasOptions = [...d.calculatorDisplay.extrasOptions];
                          extrasOptions[i] = { ...extrasOptions[i], label: v };
                          return { ...d, calculatorDisplay: { ...d.calculatorDisplay, extrasOptions } };
                        })
                      }
                      editing={editing}
                      hint="Exemple : siège bébé, accueil pancarte, attente supplémentaire."
                    />
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
