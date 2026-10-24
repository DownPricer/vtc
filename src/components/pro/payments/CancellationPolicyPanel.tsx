"use client";

import { useEffect, useState } from "react";
import { ProAlert, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";
import { mapApiErrorToFr } from "@/components/pro/proDisplay";
import {
  getCancellationPolicy,
  saveCancellationPolicy,
  type CancellationPolicy,
  type CancellationPolicyInput,
} from "@/lib/proRefundsClient";

const EMPTY: CancellationPolicyInput = {
  freeCancellationHours: null,
  partialRefundConditions: "",
  lateCancellationConditions: "",
  specialReasons: "",
  customerText: "",
};

function toInput(p: CancellationPolicy | null): CancellationPolicyInput {
  if (!p) return EMPTY;
  return {
    freeCancellationHours: p.freeCancellationHours,
    partialRefundConditions: p.partialRefundConditions,
    lateCancellationConditions: p.lateCancellationConditions,
    specialReasons: p.specialReasons,
    customerText: p.customerText,
  };
}

function Area({
  label,
  hint,
  value,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-bold text-[var(--pro-text)]">{label}</span>
      <span className="mt-0.5 block text-xs text-[var(--pro-text-muted)]">{hint}</span>
      <textarea value={value} maxLength={max} rows={3} onChange={(e) => onChange(e.target.value)} className={`${proInputClass} mt-2`} />
    </label>
  );
}

/**
 * Conditions d'annulation du VTC. Chaque enregistrement crée une nouvelle version ;
 * les réservations déjà enregistrées conservent la version affichée au moment de leur réservation.
 */
export function CancellationPolicyPanel() {
  const [saved, setSaved] = useState<CancellationPolicy | null>(null);
  const [form, setForm] = useState<CancellationPolicyInput>(EMPTY);
  const [snapshot, setSnapshot] = useState(JSON.stringify(EMPTY));
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCancellationPolicy()
      .then((p) => {
        if (cancelled) return;
        setSaved(p);
        setForm(toInput(p));
        setSnapshot(JSON.stringify(toInput(p)));
        setState("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        setError(mapApiErrorToFr((e as Error).message));
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = JSON.stringify(form) !== snapshot;

  async function save(): Promise<void> {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const p = await saveCancellationPolicy(form);
      setSaved(p);
      setForm(toInput(p));
      setSnapshot(JSON.stringify(toInput(p)));
      setOk(p ? `Conditions enregistrées (version ${p.version}).` : "Conditions supprimées.");
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProPanel>
      <ProSectionHeader
        level="panel"
        eyebrow="Annulation"
        title="Conditions d’annulation"
        description="Ces conditions sont présentées à vos clients avant paiement et conservées telles quelles sur chaque réservation. Elles ne déclenchent aucune pénalité automatique : vous décidez au cas par cas."
      />
      <div className="mb-4">
        <ProAlert tone="info">
          Vos conditions doivent respecter la réglementation applicable (droit de la consommation, transport de personnes). Une modification ne s’applique jamais aux réservations déjà enregistrées.
        </ProAlert>
      </div>

      {state === "loading" ? <p className="text-sm text-[var(--pro-text-muted)]">Chargement des conditions…</p> : null}
      {state === "error" ? <ProAlert tone="error">{error}</ProAlert> : null}

      {state === "ready" ? (
        <div className="space-y-4">
          <label className="block max-w-sm">
            <span className="block text-[13px] font-bold text-[var(--pro-text)]">Délai d’annulation gratuite</span>
            <span className="mt-0.5 block text-xs text-[var(--pro-text-muted)]">Nombre d’heures avant le départ jusqu’auquel le client peut annuler sans frais (vide = non précisé).</span>
            <span className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={1440}
                step={1}
                inputMode="numeric"
                value={form.freeCancellationHours ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  setForm((f) => ({ ...f, freeCancellationHours: v === "" ? null : Math.max(0, Math.min(1440, Number.parseInt(v, 10) || 0)) }));
                }}
                className={`${proInputClass} !w-[110px]`}
              />
              <span className="text-[13px] text-[var(--pro-text)]">heures</span>
            </span>
          </label>
          <Area
            label="Annulation tardive"
            hint="Conditions applicables si le client annule après ce délai."
            value={form.lateCancellationConditions}
            max={1500}
            onChange={(v) => setForm((f) => ({ ...f, lateCancellationConditions: v }))}
          />
          <Area
            label="Remboursement partiel"
            hint="Dans quels cas un remboursement partiel peut être accordé."
            value={form.partialRefundConditions}
            max={1500}
            onChange={(v) => setForm((f) => ({ ...f, partialRefundConditions: v }))}
          />
          <Area
            label="Motifs particuliers"
            hint="Ex. retard de vol, événement exceptionnel, urgence médicale."
            value={form.specialReasons}
            max={1500}
            onChange={(v) => setForm((f) => ({ ...f, specialReasons: v }))}
          />
          <Area
            label="Texte explicatif présenté au client"
            hint="Message libre affiché avec vos conditions."
            value={form.customerText}
            max={3000}
            onChange={(v) => setForm((f) => ({ ...f, customerText: v }))}
          />

          {error ? <ProAlert tone="error">{error}</ProAlert> : null}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--pro-border)] pt-4">
            <span role="status" aria-live="polite" className="text-xs text-[var(--pro-text-muted)]">
              {ok || (saved ? `Version ${saved.version} en vigueur` : "Aucune condition enregistrée : les demandes d’annulation seront traitées manuellement.")}
            </span>
            <button
              type="button"
              disabled={busy || !dirty}
              onClick={() => void save()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[7px] border border-transparent bg-[var(--pro-accent)] px-[17px] text-[13px] font-bold text-white transition hover:bg-[var(--pro-accent-hover)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Enregistrement…" : "Enregistrer les conditions"}
            </button>
          </div>
        </div>
      ) : null}
    </ProPanel>
  );
}
