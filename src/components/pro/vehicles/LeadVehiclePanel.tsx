"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProAlert, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";
import { proBtnPrimaryClass, proBtnSecondaryClass } from "@/components/pro/settings/editable/proFieldStyles";
import { proApi } from "@/lib/proApi";
import { changeLeadVehicle, listProVehicles, type ProVehicle } from "@/lib/proVehiclesClient";

type Props = {
  leadId: string;
  status: string;
  vehicleId?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  pricingResult?: Record<string, unknown> | null;
  onChanged: () => void | Promise<void>;
};

type Snapshot = {
  name?: string;
  tarifBase?: number;
  tarifTotal?: number;
  surcharge?: { amount?: number; formula?: string; note?: string };
};

const EDITABLE = new Set(["new", "pending", "processed", "accepted", "scheduled"]);
const eur = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)} €`;
const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Véhicule attribué à la demande/réservation : détail du prix (snapshot figé), changement de véhicule et de date contrôlés par l'API. */
export function LeadVehiclePanel({ leadId, status, vehicleId, scheduledStart, scheduledEnd, pricingResult, onChanged }: Props) {
  const [vehicles, setVehicles] = useState<ProVehicle[]>([]);
  const [target, setTarget] = useState("");
  const [start, setStart] = useState(toLocalInput(scheduledStart));
  const [end, setEnd] = useState(toLocalInput(scheduledEnd));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listProVehicles()
      .then(setVehicles)
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    setStart(toLocalInput(scheduledStart));
    setEnd(toLocalInput(scheduledEnd));
  }, [scheduledStart, scheduledEnd]);

  const snap = (pricingResult?.vehicle ?? null) as Snapshot | null;
  const editable = EDITABLE.has(status);
  const current = vehicles.find((v) => v.id === vehicleId);
  const choices = vehicles.filter((v) => v.active && !v.archived && v.id !== vehicleId);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(ok);
      await onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProPanel>
      <ProSectionHeader
        title="Véhicule et date"
        description="Le véhicule est réservé pour la journée de la course dès que la demande est acceptée."
      />
      <div className="mt-5 space-y-4">
        {error ? <ProAlert tone="error">{error}</ProAlert> : null}
        {notice ? <ProAlert tone="success">{notice}</ProAlert> : null}

        <div className="rounded-xl border border-[var(--pro-border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pro-text-muted)]">Véhicule attribué</p>
          <p className="mt-1 text-base font-bold text-[var(--pro-text)]">
            {snap?.name ?? current?.name ?? (vehicleId ? "Véhicule" : "Aucun (réservation sans véhicule)")}
          </p>
          {snap ? (
            <dl className="mt-3 grid gap-1 text-sm sm:max-w-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--pro-text-muted)]">Tarif du trajet</dt>
                <dd className="tabular-nums">{eur(snap.tarifBase ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--pro-text-muted)]">Supplément véhicule</dt>
                <dd className="tabular-nums">{eur(snap.surcharge?.amount ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--pro-border)] pt-1 font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{eur(snap.tarifTotal ?? 0)}</dd>
              </div>
              {snap.surcharge?.formula ? <p className="pt-1 text-xs text-[var(--pro-text-muted)]">{snap.surcharge.formula}</p> : null}
            </dl>
          ) : null}
          {!vehicleId ? (
            <p className="mt-2 text-xs text-[var(--pro-text-muted)]">
              Cette demande n’a pas de véhicule : elle ne bloque aucune disponibilité. Vous pouvez en attribuer un ci-dessous.
            </p>
          ) : null}
          {vehicleId ? (
            <Link href={`/pro/calendrier?vehicule=${vehicleId}`} className="mt-3 inline-block text-sm font-semibold text-[var(--pro-accent)] hover:underline">
              Calendrier de ce véhicule →
            </Link>
          ) : null}
        </div>

        {editable ? (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block min-w-[220px] flex-1 text-sm">
                <span className="font-semibold text-[var(--pro-text)]">{vehicleId ? "Changer de véhicule" : "Attribuer un véhicule"}</span>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className={`${proInputClass} mt-1`}>
                  <option value="">Choisir…</option>
                  {choices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.surchargeDescription.replace("Ce véhicule ", "")}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={busy || !target}
                className={proBtnPrimaryClass}
                onClick={() => {
                  const v = choices.find((x) => x.id === target);
                  if (!window.confirm(`Attribuer « ${v?.name} » à cette course ? Le supplément est recalculé par le serveur ; la disponibilité est revérifiée.`)) return;
                  void run(() => changeLeadVehicle(leadId, target), "Véhicule mis à jour.").then(() => setTarget(""));
                }}
              >
                Appliquer
              </button>
              {vehicleId ? (
                <button
                  type="button"
                  disabled={busy}
                  className={proBtnSecondaryClass}
                  onClick={() => {
                    if (!window.confirm("Retirer le véhicule de cette course ? Le supplément éventuel sera retiré du prix et le véhicule libéré.")) return;
                    void run(() => changeLeadVehicle(leadId, null), "Véhicule retiré.");
                  }}
                >
                  Retirer le véhicule
                </button>
              ) : null}
            </div>

            <form
              className="flex flex-wrap items-end gap-3 border-t border-[var(--pro-border)] pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!start) return;
                void run(
                  () =>
                    proApi(`/pro/demandes/${encodeURIComponent(leadId)}/schedule`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        scheduledStart: new Date(start).toISOString(),
                        ...(end ? { scheduledEnd: new Date(end).toISOString() } : {}),
                      }),
                    }),
                  "Date de la course mise à jour."
                );
              }}
            >
              <label className="block text-sm">
                <span className="font-semibold text-[var(--pro-text)]">Début de la course</span>
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={`${proInputClass} mt-1`} />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--pro-text)]">Fin</span>
                <input type="datetime-local" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={`${proInputClass} mt-1`} />
              </label>
              <button type="submit" disabled={busy || !start} className={proBtnSecondaryClass}>
                Modifier la date
              </button>
              <p className="basis-full text-xs text-[var(--pro-text-muted)]">
                Le prix n’est pas recalculé lors d’un changement de date. Si le véhicule est déjà pris ce jour-là, la modification est refusée.
              </p>
            </form>
          </>
        ) : null}
      </div>
    </ProPanel>
  );
}
