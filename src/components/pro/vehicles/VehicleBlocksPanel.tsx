"use client";

import { useCallback, useEffect, useState } from "react";
import { ProAlert, proInputClass } from "@/components/pro/ProUi";
import { proBtnDangerClass, proBtnPrimaryClass } from "@/components/pro/settings/editable/proFieldStyles";
import {
  BLOCK_REASON_LABELS,
  createVehicleBlock,
  deleteVehicleBlock,
  listVehicleBlocks,
  type VehicleBlock,
} from "@/lib/proVehiclesClient";

const fmt = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split("-");
  return `${day}/${m}/${y}`;
};

/** Indisponibilités manuelles (entretien, réparation, congés, immobilisation) : bloquent le véhicule pour les journées choisies. */
export function VehicleBlocksPanel({ vehicleId }: { vehicleId: string }) {
  const [blocks, setBlocks] = useState<VehicleBlock[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState<VehicleBlock["reason"]>("maintenance");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setBlocks(await listVehicleBlocks(vehicleId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [vehicleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = blocks.filter((b) => b.endDay.slice(0, 10) >= today);

  return (
    <div className="space-y-4">
      {error ? <ProAlert tone="error">{error}</ProAlert> : null}

      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr_auto] lg:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setBusy(true);
          try {
            await createVehicleBlock(vehicleId, { startDay: start, endDay: end || start, reason, note: note.trim() || undefined });
            setStart("");
            setEnd("");
            setNote("");
            await load();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block text-sm">
          <span className="font-semibold text-[var(--pro-text)]">Du</span>
          <input type="date" required min={today} value={start} onChange={(e) => setStart(e.target.value)} className={`${proInputClass} mt-1`} />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-[var(--pro-text)]">Au (inclus)</span>
          <input type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className={`${proInputClass} mt-1`} />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-[var(--pro-text)]">Motif</span>
          <select value={reason} onChange={(e) => setReason(e.target.value as VehicleBlock["reason"])} className={`${proInputClass} mt-1`}>
            {Object.entries(BLOCK_REASON_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-[var(--pro-text)]">Note (facultatif)</span>
          <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} className={`${proInputClass} mt-1`} />
        </label>
        <button type="submit" disabled={busy || !start} className={proBtnPrimaryClass}>
          Bloquer
        </button>
      </form>

      {upcoming.length === 0 ? (
        <p className="text-sm text-[var(--pro-text-muted)]">Aucune indisponibilité à venir.</p>
      ) : (
        <ul className="divide-y divide-[var(--pro-border)] rounded-lg border border-[var(--pro-border)]">
          {upcoming.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-[var(--pro-text)]">
                  {b.startDay.slice(0, 10) === b.endDay.slice(0, 10) ? fmt(b.startDay) : `${fmt(b.startDay)} → ${fmt(b.endDay)}`}
                  <span className="ml-2 font-normal text-[var(--pro-text-muted)]">{BLOCK_REASON_LABELS[b.reason]}</span>
                </p>
                {b.note ? <p className="text-xs text-[var(--pro-text-muted)]">{b.note}</p> : null}
              </div>
              <button
                type="button"
                className={`${proBtnDangerClass} !px-3 !py-1.5 text-[13px]`}
                onClick={async () => {
                  setError(null);
                  try {
                    await deleteVehicleBlock(b.id);
                    await load();
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
              >
                Libérer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
