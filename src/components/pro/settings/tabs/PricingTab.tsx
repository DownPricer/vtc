"use client";

import { useState } from "react";
import { SettingsCallout, SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyBadgeList } from "../ReadonlyBadgeList";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

const transferCardClass =
  "space-y-4 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/70 p-4 shadow-sm";

function TransferRowEditor({
  title,
  subtitle,
  item,
  onPatch,
  editing,
  showKm = false,
}: {
  title: string;
  subtitle: string;
  item: {
    id: string;
    depart: string;
    destination: string;
    code: string;
    prixAller: string;
    prixAR: string;
    duree: string;
    featured: boolean;
    enabled: boolean;
    km?: string;
  };
  onPatch: (patch: Record<string, unknown>) => void;
  editing: boolean;
  showKm?: boolean;
}) {
  return (
    <li className={transferCardClass}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pro-accent)]">{title}</p>
        <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">{subtitle}</p>
      </div>
      <EditableSwitch label="Carte visible" checked={item.enabled} onChange={(v) => onPatch({ enabled: v })} editing={editing} />
      <div className="grid gap-3 sm:grid-cols-2">
        <EditableField label="Depart" value={item.depart} onChange={(v) => onPatch({ depart: v })} editing={editing} />
        <EditableField label="Destination" value={item.destination} onChange={(v) => onPatch({ destination: v })} editing={editing} />
        <EditableField
          label="Code aeroport / repere"
          value={item.code}
          onChange={(v) => onPatch({ code: v })}
          editing={editing}
          mono
        />
        <EditableField
          label="Duree indicative"
          value={item.duree}
          onChange={(v) => onPatch({ duree: v })}
          editing={editing}
        />
        <EditableField
          label="Prix aller simple"
          value={item.prixAller}
          onChange={(v) => onPatch({ prixAller: v })}
          editing={editing}
        />
        <EditableField
          label="Prix aller-retour"
          value={item.prixAR}
          onChange={(v) => onPatch({ prixAR: v })}
          editing={editing}
        />
        <EditableSwitch label="Mis en avant" checked={item.featured} onChange={(v) => onPatch({ featured: v })} editing={editing} />
        {showKm ? (
          <EditableField label="Distance affichee" value={item.km ?? ""} onChange={(v) => onPatch({ km: v })} editing={editing} />
        ) : null}
      </div>
    </li>
  );
}

export function PricingTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const { highlights, tarifsPage, codeColors } = draft.pricingDisplay;
  const [showAirportCodeAdvanced, setShowAirportCodeAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <SettingsCallout
        title="Tarifs affiches sur la vitrine"
        description="Ces tarifs servent a l affichage commercial du site. Le calcul reel du prix reste gere par le moteur de calcul."
        caption="Vous modifiez ici la presentation marketing des transferts et des offres, pas la logique tarifaire."
      />

      <SettingsSectionCard
        title="Transferts populaires"
        description="Ces cartes alimentent la zone des transferts mis en avant sur l accueil."
      >
        <EditableSwitch
          label="Section activee"
          checked={highlights.popularTransfersEnabled}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              pricingDisplay: {
                ...d.pricingDisplay,
                highlights: { ...d.pricingDisplay.highlights, popularTransfersEnabled: v },
              },
            }))
          }
          editing={editing}
        />
        <ul className="mt-4 space-y-3">
          {highlights.popularTransfers.map((t, i) => (
            <TransferRowEditor
              key={t.id}
              title={`Transfert ${i + 1}`}
              subtitle="Carte commerciale affichee sur l accueil."
              item={t}
              editing={editing}
              showKm={false}
              onPatch={(patch) =>
                setDraft((d) => {
                  const popularTransfers = [...d.pricingDisplay.highlights.popularTransfers];
                  popularTransfers[i] = { ...popularTransfers[i], ...patch };
                  return {
                    ...d,
                    pricingDisplay: {
                      ...d.pricingDisplay,
                      highlights: { ...d.pricingDisplay.highlights, popularTransfers },
                    },
                  };
                })
              }
            />
          ))}
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Mise a disposition"
        description="Bloc de presentation des offres a l heure dans la vitrine."
      >
        <EditableSwitch
          label="Bloc active"
          checked={highlights.madEnabled}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              pricingDisplay: {
                ...d.pricingDisplay,
                highlights: { ...d.pricingDisplay.highlights, madEnabled: v },
              },
            }))
          }
          editing={editing}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableNumberField
            label="Prix horaire affiche"
            value={highlights.madHourlyFrom}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                pricingDisplay: {
                  ...d.pricingDisplay,
                  highlights: { ...d.pricingDisplay.highlights, madHourlyFrom: v },
                },
              }))
            }
            editing={editing}
            min={0}
          />
          <EditableField
            label="Sous-titre"
            value={highlights.madSubtitle}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                pricingDisplay: {
                  ...d.pricingDisplay,
                  highlights: { ...d.pricingDisplay.highlights, madSubtitle: v },
                },
              }))
            }
            editing={editing}
            hint="Ce texte aide a presenter le service sans toucher au moteur de calcul."
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Page Tarifs"
        description="Reglez ici le contenu vitrine de la page Tarifs : hero, cartes de transferts et appels a l action."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Badge hero"
            value={tarifsPage.heroBadge}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                pricingDisplay: {
                  ...d.pricingDisplay,
                  tarifsPage: { ...d.pricingDisplay.tarifsPage, heroBadge: v },
                },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre principal"
            value={tarifsPage.heroTitle}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                pricingDisplay: {
                  ...d.pricingDisplay,
                  tarifsPage: { ...d.pricingDisplay.tarifsPage, heroTitle: v },
                },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre mis en avant"
            value={tarifsPage.heroTitleHighlight}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                pricingDisplay: {
                  ...d.pricingDisplay,
                  tarifsPage: { ...d.pricingDisplay.tarifsPage, heroTitleHighlight: v },
                },
              }))
            }
            editing={editing}
          />
        </div>
        <EditableField
          label="Introduction"
          value={tarifsPage.heroIntro}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              pricingDisplay: {
                ...d.pricingDisplay,
                tarifsPage: { ...d.pricingDisplay.tarifsPage, heroIntro: v },
              },
            }))
          }
          editing={editing}
        />
        <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/60 p-4">
          <p className="text-sm font-semibold text-[var(--pro-text)]">Bloc mise a disposition</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--pro-text-soft)]">
            Cette zone presente le service a l heure sur la page Tarifs.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <EditableField
              label="Titre"
              value={tarifsPage.madTitle}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricingDisplay: {
                    ...d.pricingDisplay,
                    tarifsPage: { ...d.pricingDisplay.tarifsPage, madTitle: v },
                  },
                }))
              }
              editing={editing}
            />
            <EditableField
              label="Sous-titre"
              value={tarifsPage.madSubtitle}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricingDisplay: {
                    ...d.pricingDisplay,
                    tarifsPage: { ...d.pricingDisplay.tarifsPage, madSubtitle: v },
                  },
                }))
              }
              editing={editing}
            />
            <EditableField
              label="Texte vehicule"
              value={tarifsPage.madVehicleHint}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricingDisplay: {
                    ...d.pricingDisplay,
                    tarifsPage: { ...d.pricingDisplay.tarifsPage, madVehicleHint: v },
                  },
                }))
              }
              editing={editing}
            />
            <EditableNumberField
              label="Prix horaire affiche"
              value={tarifsPage.madHourlyFrom}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricingDisplay: {
                    ...d.pricingDisplay,
                    tarifsPage: { ...d.pricingDisplay.tarifsPage, madHourlyFrom: v },
                  },
                }))
              }
              editing={editing}
              min={0}
            />
            <EditableField
              label="CTA principal"
              value={tarifsPage.ctaPrimaryLabel}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricingDisplay: {
                    ...d.pricingDisplay,
                    tarifsPage: { ...d.pricingDisplay.tarifsPage, ctaPrimaryLabel: v },
                  },
                }))
              }
              editing={editing}
            />
            <EditableField
              label="CTA secondaire"
              value={tarifsPage.ctaSecondaryLabel}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  pricingDisplay: {
                    ...d.pricingDisplay,
                    tarifsPage: { ...d.pricingDisplay.tarifsPage, ctaSecondaryLabel: v },
                  },
                }))
              }
              editing={editing}
            />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pro-accent)]">Cartes transferts</p>
          <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">
            Ces cartes structurent la lecture de la page Tarifs et facilitent la comparaison des trajets affiches.
          </p>
        </div>
        <ul className="space-y-3">
          {tarifsPage.transfers.map((t, i) => (
            <TransferRowEditor
              key={t.id}
              title={`Carte ${i + 1}`}
              subtitle="Carte visible sur la page Tarifs."
              item={t}
              editing={editing}
              showKm
              onPatch={(patch) =>
                setDraft((d) => {
                  const transfers = [...d.pricingDisplay.tarifsPage.transfers];
                  transfers[i] = { ...transfers[i], ...patch };
                  return {
                    ...d,
                    pricingDisplay: {
                      ...d.pricingDisplay,
                      tarifsPage: { ...d.pricingDisplay.tarifsPage, transfers },
                    },
                  };
                })
              }
            />
          ))}
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Garanties"
        description="Ces pastilles rassurent le client sur la page Tarifs et reprennent votre bibliotheque de badges."
      >
        <ReadonlyBadgeList
          items={tarifsPage.guarantees.map((g) => ({
            label: `${g.badgeId}${g.enabled ? "" : " (off)"}`,
            active: g.enabled,
          }))}
        />
        <p className="mt-2 text-xs leading-relaxed text-[var(--pro-text-muted)]">
          L edition du contenu des garanties reste geree dans l onglet Badges.
        </p>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Couleurs des codes aéroport"
        description="Réglages visuels des pastilles (réservés au profil technique — masqués par défaut)."
      >
        <button
          type="button"
          className="w-full rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-left text-sm font-medium text-[var(--pro-text)] transition hover:border-[var(--pro-accent)]/35"
          onClick={() => setShowAirportCodeAdvanced((x) => !x)}
        >
          {showAirportCodeAdvanced ? "▼" : "▶"} Avancé développeur — classes Tailwind des pastilles
        </button>
        {showAirportCodeAdvanced ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs leading-relaxed text-[var(--pro-text-muted)]">
              Ces champs pilotent les classes CSS affichées sur la vitrine. Ne les modifiez que si vous savez ce que vous
              faites ; en cas de doute, laissez les valeurs par défaut.
            </p>
            {Object.entries(codeColors).map(([code, cls]) => (
              <div key={code} className={transferCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">{code}</p>
                  <span className="rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-1 text-xs text-[var(--pro-text-muted)]">
                    Aperçu technique
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <EditableField
                    label="Classe bg"
                    value={cls.bg}
                    onChange={(v) =>
                      setDraft((d) => ({
                        ...d,
                        pricingDisplay: {
                          ...d.pricingDisplay,
                          codeColors: {
                            ...d.pricingDisplay.codeColors,
                            [code]: { ...d.pricingDisplay.codeColors[code as keyof typeof codeColors], bg: v },
                          },
                        },
                      }))
                    }
                    editing={editing}
                    mono
                  />
                  <EditableField
                    label="Classe text"
                    value={cls.text}
                    onChange={(v) =>
                      setDraft((d) => ({
                        ...d,
                        pricingDisplay: {
                          ...d.pricingDisplay,
                          codeColors: {
                            ...d.pricingDisplay.codeColors,
                            [code]: { ...d.pricingDisplay.codeColors[code as keyof typeof codeColors], text: v },
                          },
                        },
                      }))
                    }
                    editing={editing}
                    mono
                  />
                  <EditableField
                    label="Classe point"
                    value={cls.dot}
                    onChange={(v) =>
                      setDraft((d) => ({
                        ...d,
                        pricingDisplay: {
                          ...d.pricingDisplay,
                          codeColors: {
                            ...d.pricingDisplay.codeColors,
                            [code]: { ...d.pricingDisplay.codeColors[code as keyof typeof codeColors], dot: v },
                          },
                        },
                      }))
                    }
                    editing={editing}
                    mono
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </SettingsSectionCard>
    </div>
  );
}
