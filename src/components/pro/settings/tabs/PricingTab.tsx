"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyBadgeList } from "../ReadonlyBadgeList";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableField } from "../editable/EditableField";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

function TransferRowEditor({
  title,
  item,
  onPatch,
  editing,
  showKm = false,
}: {
  title: string;
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
    <li className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pro-accent)]">{title}</p>
      <EditableSwitch label="Carte activée" checked={item.enabled} onChange={(v) => onPatch({ enabled: v })} editing={editing} />
      <div className="grid gap-3 sm:grid-cols-2">
        <EditableField label="Départ" value={item.depart} onChange={(v) => onPatch({ depart: v })} editing={editing} />
        <EditableField label="Destination" value={item.destination} onChange={(v) => onPatch({ destination: v })} editing={editing} />
        <EditableField label="Code aéroport / ref." value={item.code} onChange={(v) => onPatch({ code: v })} editing={editing} mono />
        <EditableField label="Durée affichée" value={item.duree} onChange={(v) => onPatch({ duree: v })} editing={editing} />
        <EditableField label="Prix aller (affiché)" value={item.prixAller} onChange={(v) => onPatch({ prixAller: v })} editing={editing} />
        <EditableField label="Prix A/R (affiché)" value={item.prixAR} onChange={(v) => onPatch({ prixAR: v })} editing={editing} />
        <EditableSwitch label="Mis en avant" checked={item.featured} onChange={(v) => onPatch({ featured: v })} editing={editing} />
        {showKm ? (
          <EditableField label="Distance affichée" value={item.km ?? ""} onChange={(v) => onPatch({ km: v })} editing={editing} />
        ) : null}
      </div>
    </li>
  );
}

export function PricingTab({ draft, setDraft, editing }: SettingsTabsSharedProps) {
  const { highlights, tarifsPage, codeColors } = draft.pricingDisplay;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <p className="font-medium">Tarifs vitrine uniquement</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
          Les montants et libellés ci-dessous servent à l’affichage marketing. Le moteur de calcul des trajets n’est pas modifié ici.
        </p>
      </div>

      <SettingsSectionCard title="Transferts populaires (accueil)" description="Grille « Nos transferts les plus demandés ».">
        <EditableSwitch
          label="Section activée"
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
              title={`Transfert #${i + 1}`}
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

      <SettingsSectionCard title="Mise à disposition (bloc tarifs affichés)" description="Encart récapitulatif.">
        <EditableSwitch
          label="Encart activé"
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
            label="Prix à partir de (€/h affiché)"
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
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="Page /tarifs (vitrine)" description="Hero, cartes et CTA.">
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
            label="Titre (partie 1)"
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
            label="Titre (mise en avant)"
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Mise à disposition — titre"
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
            label="Mise à disposition — sous-titre"
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
            label="Mise à disposition — véhicule (texte)"
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
            label="Mise à disposition — €/h (affiché)"
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
            label="CTA primaire"
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
        <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Transferts (cartes page /tarifs)</p>
        <ul className="space-y-3">
          {tarifsPage.transfers.map((t, i) => (
            <TransferRowEditor
              key={t.id}
              title={`Carte #${i + 1}`}
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

      <SettingsSectionCard title="Garanties (page /tarifs)" description="Pastilles sous le hero — références aux badges.">
        <ReadonlyBadgeList
          items={tarifsPage.guarantees.map((g) => ({
            label: `${g.badgeId}${g.enabled ? "" : " (off)"}`,
            active: g.enabled,
          }))}
        />
        <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Édition des garanties : étape ultérieure.</p>
      </SettingsSectionCard>

      <SettingsSectionCard title="Couleurs pastilles codes aéroports" description="Classes Tailwind (affichage).">
        <div className="space-y-4">
          {Object.entries(codeColors).map(([code, cls]) => (
            <div key={code} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/40 p-4 space-y-3">
              <p className="text-sm font-semibold text-[var(--pro-text)]">{code}</p>
              <EditableField
                label="bg"
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
                label="text"
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
                label="dot"
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
          ))}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
