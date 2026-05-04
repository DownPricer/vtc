"use client";

import { CollapsibleSettingsCard } from "../CollapsibleSettingsCard";
import { ReadonlyBadgeList } from "../ReadonlyBadgeList";
import { ReadonlyListCard } from "../ReadonlyListCard";
import { EditableField } from "../editable/EditableField";
import { EditableSwitch } from "../editable/EditableSwitch";
import { EditableImageField } from "../editable/EditableImageField";
import { EditableVideoField } from "../editable/EditableVideoField";
import { EditableTextarea } from "../editable/EditableTextarea";
import type { SettingsTabsSharedProps } from "./context";

export function HomeTab({ draft, setDraft, editing, siteFeatures }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-4">
      <CollapsibleSettingsCard
        title="Fonctionnalités site (hors page d’accueil)"
        subtitle="Lecture seule — ces interrupteurs concernent d’autres pages ou le comportement global du site."
        defaultOpen={false}
        editing={editing}
      >
        <ReadonlyBadgeList
          items={[
            { label: `Écran d’intro : ${siteFeatures.introScreen ? "activé" : "désactivé"}` },
            { label: `Mini-jeu : ${siteFeatures.miniGame ? "activé" : "désactivé"}` },
            { label: `Page radio : ${siteFeatures.radioPage ? "activée" : "désactivée"}` },
            { label: `Section radio (accueil) : ${siteFeatures.radioHomeSection ? "activée" : "désactivée"}` },
            { label: `Bouton radio flottant : ${siteFeatures.floatingRadioButton ? "activé" : "désactivé"}` },
            { label: `PayPal (réservation) : ${siteFeatures.payPal ? "activé" : "désactivé"}` },
          ]}
        />
        <p className="mt-3 text-xs text-[var(--pro-text-muted)]">Ces options se configurent hors de cet écran (code / variables).</p>
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard
        title="Héros"
        subtitle="Image principale, titre, texte d’introduction et boutons d’action."
        defaultOpen
        editing={editing}
      >
        <EditableImageField
          label="Image de fond"
          value={draft.home.hero.backgroundImageSrc}
          onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, backgroundImageSrc: v } } }))}
          editing={editing}
          altPreview={draft.home.hero.imageAlt}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Texte alternatif image"
            value={draft.home.hero.imageAlt}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, imageAlt: v } } }))}
            editing={editing}
          />
          <EditableField
            label="Badge"
            value={draft.home.hero.badgeText}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, badgeText: v } } }))}
            editing={editing}
          />
          <EditableField
            label="Titre (ligne 1)"
            value={draft.home.hero.titleLine1}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, titleLine1: v } } }))}
            editing={editing}
          />
          <EditableField
            label="Titre (mise en avant)"
            value={draft.home.hero.titleHighlight}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, titleHighlight: v } } }))}
            editing={editing}
          />
          <div className="sm:col-span-2">
            <EditableField
              label="Sous-titre"
              value={draft.home.hero.subtitle}
              onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, subtitle: v } } }))}
              editing={editing}
            />
          </div>
          <div className="sm:col-span-2">
            <EditableTextarea
              label="Puces / promesse"
              value={draft.home.hero.bullets}
              onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, hero: { ...d.home.hero, bullets: v } } }))}
              editing={editing}
              rows={2}
            />
          </div>
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Call-to-action</p>
        <ul className="space-y-2">
          {draft.home.hero.ctas.map((c, i) => (
            <li key={c.id}>
              <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
                <EditableSwitch
                  label={`Activer « ${c.label} »`}
                  checked={c.enabled}
                  onChange={(en) =>
                    setDraft((d) => {
                      const ctas = [...d.home.hero.ctas];
                      ctas[i] = { ...ctas[i], enabled: en };
                      return { ...d, home: { ...d.home, hero: { ...d.home.hero, ctas } } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Libellé"
                  value={c.label}
                  onChange={(v) =>
                    setDraft((d) => {
                      const ctas = [...d.home.hero.ctas];
                      ctas[i] = { ...ctas[i], label: v };
                      return { ...d, home: { ...d.home, hero: { ...d.home.hero, ctas } } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Lien (href)"
                  value={c.href}
                  onChange={(v) =>
                    setDraft((d) => {
                      const ctas = [...d.home.hero.ctas];
                      ctas[i] = { ...ctas[i], href: v };
                      return { ...d, home: { ...d.home, hero: { ...d.home.hero, ctas } } };
                    })
                  }
                  editing={editing}
                  mono
                />
              </div>
            </li>
          ))}
        </ul>
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard
        title="Aperçu des sections page d’accueil"
        subtitle="État dérivé du brouillon — ce qui s’affiche ou non selon vos réglages."
        defaultOpen={false}
        editing={editing}
      >
        <ReadonlyBadgeList
          items={[
            { label: `Bloc « engagements » : ${draft.home.commitments.items.some((i) => i.enabled) ? "affiché" : "vide"}` },
            { label: `Vidéo promo : ${draft.home.video.enabled ? "activée" : "désactivée"}` },
            { label: `Moyens de paiement : ${draft.home.paymentMethods.enabled ? "affichés" : "masqués"}` },
            { label: `CTA final : ${draft.home.ctaFinal.enabled ? "affiché" : "masqué"}` },
            { label: `Témoignages (section) : ${draft.testimonials.enabled ? "activés" : "désactivés"}` },
            { label: `Transferts populaires (accueil) : ${draft.pricingDisplay.highlights.popularTransfersEnabled ? "oui" : "non"}` },
            { label: `Mise à disposition (encart accueil) : ${draft.pricingDisplay.highlights.madEnabled ? "oui" : "non"}` },
          ]}
        />
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard
        title="Vidéo"
        subtitle="Activez ou modifiez la vidéo de présentation affichée sur la page d’accueil."
        defaultOpen={false}
        editing={editing}
      >
        <EditableSwitch
          label="Vidéo activée"
          checked={draft.home.video.enabled}
          onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, enabled: v } } }))}
          editing={editing}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Sur-titre (eyebrow)"
            value={draft.home.video.eyebrow}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, eyebrow: v } } }))}
            editing={editing}
          />
          <EditableField
            label="Titre (préfixe)"
            value={draft.home.video.titlePrefix}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, titlePrefix: v } } }))}
            editing={editing}
          />
          <EditableField
            label="Affiche marque dans le titre"
            value={draft.home.video.titleBrand}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, titleBrand: v } } }))}
            editing={editing}
          />
          <div className="sm:col-span-2">
            <EditableTextarea
              label="Description"
              value={draft.home.video.description}
              onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, description: v } } }))}
              editing={editing}
              rows={3}
            />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <EditableImageField
            label="Image de couverture (poster)"
            value={draft.home.video.posterSrc}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, posterSrc: v } } }))}
            editing={editing}
            altPreview="Poster vidéo"
            hint="Affichée avant lecture. Formats JPEG, PNG ou WebP."
          />
          <EditableVideoField
            label="Fichier vidéo"
            value={draft.home.video.videoSrc}
            onChange={(v) => setDraft((d) => ({ ...d, home: { ...d.home, video: { ...d.home.video, videoSrc: v } } }))}
            editing={editing}
            hint="MP4, WebM ou MOV — max. 50 Mo. Un champ URL/chemin reste disponible dans « avancé »."
          />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Marqueurs sous la vidéo</p>
          <div className="grid gap-2 md:grid-cols-3">
            {draft.home.video.markers
              .filter((m) => m.enabled || editing)
              .map((m) => (
                <ReadonlyListCard key={m.id} title={m.label} subtitle={m.sub} meta={`Icône : ${m.iconKey}`}>
                  <p className="text-xs text-[var(--pro-text-muted)]">ID : {m.id}</p>
                </ReadonlyListCard>
              ))}
          </div>
        </div>
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard
        title="Mise à disposition"
        subtitle="Bloc commercial pour les prestations à l’heure."
        defaultOpen={false}
        editing={editing}
      >
        <EditableSwitch
          label="Encart « mise à disposition » activé sur l’accueil"
          checked={draft.pricingDisplay.highlights.madEnabled}
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
          <EditableField
            label="Prix à partir de (€/h)"
            value={String(draft.pricingDisplay.highlights.madHourlyFrom)}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                pricingDisplay: {
                  ...d.pricingDisplay,
                  highlights: { ...d.pricingDisplay.highlights, madHourlyFrom: Number(v) || 0 },
                },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Sous-titre"
            value={draft.pricingDisplay.highlights.madSubtitle}
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
      </CollapsibleSettingsCard>

      <CollapsibleSettingsCard
        title="Moyens de paiement"
        subtitle="Textes d’en-tête du bloc et détail de chaque moyen affiché sur l’accueil."
        defaultOpen={false}
        editing={editing}
      >
        <EditableSwitch
          label="Bloc activé"
          checked={draft.home.paymentMethods.enabled}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, enabled: v } },
            }))
          }
          editing={editing}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Sur-titre"
            value={draft.home.paymentMethods.eyebrow}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, eyebrow: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre"
            value={draft.home.paymentMethods.title}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, title: v } },
              }))
            }
            editing={editing}
          />
          <div className="sm:col-span-2">
            <EditableField
              label="Sous-titre"
              value={draft.home.paymentMethods.subtitle}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, subtitle: v } },
                }))
              }
              editing={editing}
            />
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {draft.home.paymentMethods.items.map((p, i) => (
            <li key={p.id}>
              <CollapsibleSettingsCard
                title={p.label || `Paiement ${i + 1}`}
                subtitle={p.sub || "Sous-texte affiché sous le libellé."}
                defaultOpen={false}
                editing={editing}
                badge={
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      p.enabled
                        ? "border-emerald-400/35 bg-emerald-500/10 text-[var(--pro-text)]"
                        : "border-white/15 bg-[var(--pro-panel-muted)] text-[var(--pro-text-muted)]"
                    }`}
                  >
                    {p.enabled ? "Actif" : "Inactif"}
                  </span>
                }
              >
                <EditableSwitch
                  label={`Afficher « ${p.label} »`}
                  checked={p.enabled}
                  onChange={(en) =>
                    setDraft((d) => {
                      const items = [...d.home.paymentMethods.items];
                      items[i] = { ...items[i], enabled: en };
                      return { ...d, home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, items } } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Libellé"
                  value={p.label}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.home.paymentMethods.items];
                      items[i] = { ...items[i], label: v };
                      return { ...d, home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, items } } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Sous-texte"
                  value={p.sub}
                  onChange={(v) =>
                    setDraft((d) => {
                      const items = [...d.home.paymentMethods.items];
                      items[i] = { ...items[i], sub: v };
                      return { ...d, home: { ...d.home, paymentMethods: { ...d.home.paymentMethods, items } } };
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
        title="CTA final"
        subtitle="Dernier bloc d’appel à l’action en bas de page."
        defaultOpen={false}
        editing={editing}
      >
        <EditableSwitch
          label="Bloc activé"
          checked={draft.home.ctaFinal.enabled}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, enabled: v } },
            }))
          }
          editing={editing}
        />
        <div className="mt-4">
          <EditableImageField
            label="Image de fond"
            value={draft.home.ctaFinal.backgroundImageSrc}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, backgroundImageSrc: v } },
              }))
            }
            editing={editing}
            altPreview="CTA final"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Sur-titre"
            value={draft.home.ctaFinal.eyebrow}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, eyebrow: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre"
            value={draft.home.ctaFinal.title}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, title: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Titre (mise en avant)"
            value={draft.home.ctaFinal.titleHighlight}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, titleHighlight: v } },
              }))
            }
            editing={editing}
          />
          <div className="sm:col-span-2">
            <EditableTextarea
              label="Sous-titre"
              value={draft.home.ctaFinal.subtitle}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, subtitle: v } },
                }))
              }
              editing={editing}
              rows={2}
            />
          </div>
          <EditableField
            label="Libellé téléphone"
            value={draft.home.ctaFinal.phoneLabel}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, phoneLabel: v } },
              }))
            }
            editing={editing}
          />
        </div>
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Boutons</p>
        <ul className="space-y-2">
          {draft.home.ctaFinal.ctas.map((c, i) => (
            <li key={c.id}>
              <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-4 space-y-3">
                <EditableSwitch
                  label="Actif"
                  checked={c.enabled}
                  onChange={(en) =>
                    setDraft((d) => {
                      const ctas = [...d.home.ctaFinal.ctas];
                      ctas[i] = { ...ctas[i], enabled: en };
                      return { ...d, home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, ctas } } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Libellé"
                  value={c.label}
                  onChange={(v) =>
                    setDraft((d) => {
                      const ctas = [...d.home.ctaFinal.ctas];
                      ctas[i] = { ...ctas[i], label: v };
                      return { ...d, home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, ctas } } };
                    })
                  }
                  editing={editing}
                />
                <EditableField
                  label="Lien"
                  value={c.href}
                  onChange={(v) =>
                    setDraft((d) => {
                      const ctas = [...d.home.ctaFinal.ctas];
                      ctas[i] = { ...ctas[i], href: v };
                      return { ...d, home: { ...d.home, ctaFinal: { ...d.home.ctaFinal, ctas } } };
                    })
                  }
                  editing={editing}
                  mono
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Garanties (références badges)</p>
          <ReadonlyBadgeList
            items={draft.home.ctaFinal.guarantees.map((g) => ({
              label: g.badgeId,
              active: g.enabled,
            }))}
          />
          <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Édition des références badges : étape ultérieure.</p>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
}
