"use client";

import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

const itemCardClass =
  "space-y-4 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/70 p-4 shadow-sm";

export function CalculatorTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsCallout
        title="Ce que vous reglez ici"
        description="Cet onglet pilote surtout l affichage du formulaire public. Le montant final reste calcule par le moteur de calcul existant."
        caption="Les aides ci-dessous servent a mieux comprendre chaque bloc sans changer la logique actuelle."
      />

      <SettingsSectionCard
        title="Base chauffeur / depot"
        description="Cette adresse sert de point de depart du chauffeur pour calculer le trajet d approche et le retour depot."
      >
        <p className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--pro-text-soft)]">
          Renseignez une adresse complete et stable. Elle est reutilisee dans les calculs existants tels qu ils fonctionnent deja.
        </p>
        <EditableField
          label="Adresse de la base VTC"
          value={draft.calculatorDisplay.vtcBaseAddress}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              calculatorDisplay: { ...d.calculatorDisplay, vtcBaseAddress: v },
            }))
          }
          editing={editing}
          hint="Exemple : numero, rue, code postal, ville, pays."
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Types de prestation proposes"
        description="Ces options determinent les types de demandes visibles dans le formulaire public."
      >
        <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
          Chaque carte aide le client a choisir son besoin des le debut du formulaire.
        </p>
        <ul className="space-y-3">
          {draft.calculatorDisplay.serviceTypes.map((s, i) => (
            <li key={s.id} className={itemCardClass}>
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
                hint="Desactivez une option pour la retirer du formulaire sans la supprimer."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <EditableField
                  label="Libelle"
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
                  hint="Ajoutez une phrase courte pour aider le client a choisir."
                />
              </div>
            </li>
          ))}
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Passagers et bagages"
        description="Ces limites controlent les choix visibles pour le client. Elles ne changent pas les regles tarifaires avancees."
      >
        <div className="grid gap-3 sm:grid-cols-2">
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
            hint="Le client verra un choix de 1 a N passagers."
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
            hint="0 signifie aucun bagage propose dans la liste."
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Aeroports"
        description="Les aeroports actives sont proposes au client dans le formulaire de transfert aeroport."
      >
        <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
          Gardez des libelles clairs et une adresse exploitable pour vos transferts.
        </p>
        <ul className="space-y-3">
          {draft.calculatorDisplay.airports.map((a, i) => (
            <li key={a.code} className={itemCardClass}>
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
                  label="Nom affiche"
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
            </li>
          ))}
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Options extras"
        description="Les options activees apparaissent comme cases a cocher dans le formulaire public."
      >
        <ul className="space-y-3">
          {draft.calculatorDisplay.extrasOptions.map((e, i) => (
            <li key={e.id} className={itemCardClass}>
              <EditableSwitch
                label="Option proposee"
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
                label="Libelle"
                value={e.label}
                onChange={(v) =>
                  setDraft((d) => {
                    const extrasOptions = [...d.calculatorDisplay.extrasOptions];
                    extrasOptions[i] = { ...extrasOptions[i], label: v };
                    return { ...d, calculatorDisplay: { ...d.calculatorDisplay, extrasOptions } };
                  })
                }
                editing={editing}
                hint="Exemple : siege bebe, accueil pancarte, attente supplementaire."
              />
            </li>
          ))}
        </ul>
      </SettingsSectionCard>
    </div>
  );
}
