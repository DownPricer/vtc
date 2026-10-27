"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { isUsefulValue } from "@/components/pro/proDisplay";
import { ProIcon } from "@/components/pro/ProIcons";

type Leg = { label: string; from: string; to: string };
type Step = { id: string; label: string; detail: string; origin: string | null; destination: string };

const enc = encodeURIComponent;

/** Lien Google Maps : itinéraire complet si `origin` est fourni, sinon depuis la position actuelle. */
export const googleMapsUrl = (origin: string | null, destination: string) =>
  `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${enc(origin)}` : ""}&destination=${enc(destination)}&travelmode=driving`;

/** Waze n'accepte qu'une destination : il guide depuis la position actuelle. */
export const wazeUrl = (destination: string) => `https://waze.com/ul?q=${enc(destination)}&navigate=yes`;

/** Apple Plans (s'ouvre dans l'app sur iPhone/Mac, sur le web ailleurs). */
export const appleMapsUrl = (origin: string | null, destination: string) =>
  `https://maps.apple.com/?${origin ? `saddr=${enc(origin)}&` : ""}daddr=${enc(destination)}&dirflg=d`;

/** Adresses exploitables d'une demande : aller (1) et, le cas échéant, retour (2). */
export function legsFromFlat(flat: Record<string, unknown>): Leg[] {
  const pick = (k: string) => (isUsefulValue(flat[k]) ? String(flat[k]).trim() : "");
  const legs: Leg[] = [];
  const f1 = pick("AdresseDepart_1");
  const t1 = pick("AdresseArrivee_1");
  if (f1 || t1) legs.push({ label: "Aller", from: f1, to: t1 });
  const f2 = pick("AdresseDepart_2");
  const t2 = pick("AdresseArrivee_2");
  if (f2 || t2) legs.push({ label: "Retour", from: f2, to: t2 });
  return legs;
}

function buildSteps(legs: Leg[]): Step[] {
  const steps: Step[] = [];
  const multi = legs.length > 1;
  for (const leg of legs) {
    const suffix = multi ? ` (${leg.label.toLowerCase()})` : "";
    if (leg.from && leg.to) {
      steps.push({
        id: `${leg.label}-trip`,
        label: `Trajet du client${suffix}`,
        detail: `${leg.from} → ${leg.to}`,
        origin: leg.from,
        destination: leg.to,
      });
    }
    if (leg.from) {
      steps.push({
        id: `${leg.label}-pickup`,
        label: `Rejoindre la prise en charge${suffix}`,
        detail: leg.from,
        origin: null,
        destination: leg.from,
      });
    }
    if (leg.to && !leg.from) {
      steps.push({ id: `${leg.label}-dest`, label: `Aller à la destination${suffix}`, detail: leg.to, origin: null, destination: leg.to });
    }
  }
  return steps;
}

const APPS = [
  { id: "waze", name: "Waze", color: "#33CCFF", letter: "W", note: "Guide jusqu'à l'arrivée" },
  { id: "google", name: "Google Maps", color: "#34A853", letter: "G", note: "Itinéraire complet" },
  { id: "apple", name: "Plans (Apple)", color: "#6E6E73", letter: "P", note: "iPhone et Mac" },
] as const;

/**
 * Bouton « Itinéraire » : ouvre la course dans Waze, Google Maps ou Plans.
 * Le chauffeur choisit l'étape (rejoindre le client, ou le trajet du client), puis l'application.
 */
export function ItineraryMenu({ legs }: { legs: Leg[] }) {
  const steps = useMemo(() => buildSteps(legs), [legs]);
  const [open, setOpen] = useState(false);
  const [stepId, setStepId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const step = steps.find((s) => s.id === stepId) ?? steps[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!step) return null;

  const href = (app: (typeof APPS)[number]["id"]) =>
    app === "waze" ? wazeUrl(step.destination) : app === "google" ? googleMapsUrl(step.origin, step.destination) : appleMapsUrl(step.origin, step.destination);

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-[9px] whitespace-nowrap rounded-[7px] border border-transparent bg-[var(--pro-accent)] px-[17px] text-[13px] font-bold text-white shadow-[0_4px_12px_rgb(37_99_235/14%)] transition hover:bg-[var(--pro-accent-hover)] active:translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#79a8ff] sm:w-auto"
      >
        <ProIcon name="arrow" className="h-[18px] w-[18px] -rotate-45" />
        Itinéraire
        <svg viewBox="0 0 20 20" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="currentColor" aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5-1.1-1.1L10 9.8 6.6 6.4z" />
        </svg>
      </button>

      {open ? (
        <>
          {/* Voile : mobile uniquement (le panneau est alors une feuille en bas d'écran). */}
          <div className="fixed inset-0 z-40 bg-black/45 sm:hidden" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            id={panelId}
            className="fixed inset-x-3 bottom-3 z-50 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-4 shadow-[0_18px_50px_rgb(0_0_0/35%)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:z-30 sm:mt-2 sm:max-h-none sm:w-[360px] sm:overflow-visible sm:rounded-xl sm:p-3 sm:shadow-[var(--pro-shadow)] xl:left-auto xl:right-0"
          >
          <div className="mb-3 flex items-center justify-between sm:hidden">
            <p className="text-sm font-bold text-[var(--pro-text)]">Ouvrir l&apos;itinéraire</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--pro-border)] text-[var(--pro-text)]"
            >
              ✕
            </button>
          </div>
          {steps.length > 1 ? (
            <fieldset className="mb-3">
              <legend className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--pro-eyebrow)]">Destination</legend>
              <div className="space-y-1.5">
                {steps.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition ${
                      s.id === step.id
                        ? "border-[var(--pro-accent)] bg-[var(--pro-accent-soft)]"
                        : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)] hover:border-[var(--pro-accent)]/40"
                    }`}
                  >
                    <input type="radio" name={`${panelId}-step`} className="mt-1" checked={s.id === step.id} onChange={() => setStepId(s.id)} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-[var(--pro-text)]">{s.label}</span>
                      <span className="block break-words text-xs text-[var(--pro-text-muted)]">{s.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="mb-3 break-words rounded-lg bg-[var(--pro-panel-muted)] px-3 py-2 text-xs text-[var(--pro-text-muted)]">{step.detail}</p>
          )}

          <ul className="space-y-1.5">
            {APPS.map((app) => (
              <li key={app.id}>
                <a
                  href={href(app.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2 transition hover:border-[var(--pro-accent)] hover:bg-[var(--pro-panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]"
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: app.color }}
                    aria-hidden="true"
                  >
                    {app.letter}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--pro-text)]">{app.name}</span>
                    <span className="block text-xs text-[var(--pro-text-muted)]">
                      {app.id === "waze" && step.origin ? "Guide jusqu'à l'arrivée depuis votre position" : app.note}
                    </span>
                  </span>
                  <span className="text-[var(--pro-text-muted)]" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
