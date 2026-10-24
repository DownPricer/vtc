"use client";

import { proBtnPrimaryClass, proBtnSecondaryClass } from "./editable/proFieldStyles";

type AdvancedSaveBarProps = {
  isDirty: boolean;
  saving: boolean;
  dirtyLabels: string[];
  onCancel: () => void;
  onSave: () => void | Promise<void>;
};

/** Barre d'enregistrement collée en bas de la zone d'édition : toujours à portée, quel que soit le défilement. */
export function AdvancedSaveBar({ isDirty, saving, dirtyLabels, onCancel, onSave }: AdvancedSaveBarProps) {
  return (
    <div
      role="region"
      aria-label="Enregistrement des réglages"
      className="sticky bottom-3 z-30 mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)]/95 px-4 py-3 shadow-[var(--pro-shadow)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-2.5 text-sm">
        <span
          className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${isDirty ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`}
          aria-hidden
        />
        {isDirty ? (
          <span className="min-w-0 text-[var(--pro-text)]">
            <span className="font-semibold">Modifications non enregistrées</span>
            {dirtyLabels.length > 0 ? (
              <span className="text-[var(--pro-text-muted)]"> — {dirtyLabels.join(", ")}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-[var(--pro-text-muted)]">Mode édition — aucune modification pour l’instant.</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <button type="button" onClick={onCancel} className={proBtnSecondaryClass} disabled={saving}>
          {isDirty ? "Annuler les changements" : "Quitter l’édition"}
        </button>
        <button type="button" onClick={() => void onSave()} className={proBtnPrimaryClass} disabled={!isDirty || saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
          <kbd className="ml-2 hidden rounded border border-white/30 px-1 text-[10px] font-medium opacity-80 sm:inline">Ctrl S</kbd>
        </button>
      </div>
    </div>
  );
}
