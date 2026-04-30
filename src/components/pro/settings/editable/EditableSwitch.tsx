"use client";

import { HelpTooltip } from "../HelpTooltip";

type EditableSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  editing: boolean;
  hint?: string;
};

export function EditableSwitch({ label, checked, onChange, editing, hint }: EditableSwitchProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--pro-text)]">{label}</span>
        {hint ? <HelpTooltip text={hint} /> : null}
      </div>
      {editing ? (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-emerald-500/80" : "bg-[var(--pro-border)]"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`}
          />
        </button>
      ) : (
        <span className="text-sm text-[var(--pro-text-muted)]">{checked ? "Oui" : "Non"}</span>
      )}
    </div>
  );
}
