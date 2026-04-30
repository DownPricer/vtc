"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

export function CalculatorTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <p className="font-medium">Édition locale uniquement</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
          Ces champs modifient la copie locale de la configuration vitrine. Le calculateur public, le moteur de tarification et les
          appels API ne sont pas branchés sur cet écran.
        </p>
      </div>
      <SettingsSectionCard title="Types de prestation proposés" description="Cartes de choix du type de service (affichage).">
        <ul className="space-y-3">
          {draft.calculatorDisplay.serviceTypes.map((s, i) => (
            <li key={s.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
              <EditableSwitch
                label="Activé"
                checked={s.enabled}
                onChange={(v) =>
                  setDraft((d) => {
                    const serviceTypes = [...d.calculatorDisplay.serviceTypes];
                    serviceTypes[i] = { ...serviceTypes[i], enabled: v };
                    return { ...d, calculatorDisplay: { ...d.calculatorDisplay, serviceTypes } };
                  })
                }
                editing={editing}
              />
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
              />
            </li>
          ))}
        </ul>
      </SettingsSectionCard>
      <SettingsSectionCard title="Limites passagers & bagages" description="Contraintes du stepper / listes du formulaire.">
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableNumberField
            label="Passagers max."
            value={draft.calculatorDisplay.maxPassengers}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                calculatorDisplay: { ...d.calculatorDisplay, maxPassengers: Math.max(1, Math.floor(v)) },
              }))
            }
            editing={editing}
            min={1}
            hint="Correspond au stepper « Nombre de passagers » (1 à N)."
          />
          <EditableNumberField
            label="Bagages max. (indice)"
            value={draft.calculatorDisplay.maxBaggageIndex}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                calculatorDisplay: { ...d.calculatorDisplay, maxBaggageIndex: Math.max(0, Math.floor(v)) },
              }))
            }
            editing={editing}
            min={0}
            hint="0 = aucun, jusqu’à N bagages inclus (liste déroulante)."
          />
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard title="Aéroports configurés" description="Libellés et adresses (affichage calculateur).">
        <ul className="space-y-3">
          {draft.calculatorDisplay.airports.map((a, i) => (
            <li key={a.code} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
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
            </li>
          ))}
        </ul>
      </SettingsSectionCard>
      <SettingsSectionCard title="Options extras" description="Cases à cocher « besoins spécifiques ».">
        <ul className="space-y-3">
          {draft.calculatorDisplay.extrasOptions.map((e, i) => (
            <li key={e.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
              <EditableSwitch
                label="Proposée"
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
              />
            </li>
          ))}
        </ul>
      </SettingsSectionCard>
    </div>
  );
}
