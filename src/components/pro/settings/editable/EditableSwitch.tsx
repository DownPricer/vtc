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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 min-h-[3.25rem]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-sm font-medium text-[var(--pro-text)]">{label}</span>
        {hint ? <HelpTooltip text={hint} /> : null}
      </div>
      {editing ? (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`
            relative flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-black/25 px-1 shadow-inner transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pro-panel)]
            ${checked ? "bg-emerald-600 border-emerald-700/30" : "bg-zinc-600/90 border-zinc-800/40"}
          `}
        >
          <span
            className={`
              pointer-events-none h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/10
              transition-[margin] duration-200 ease-out
              ${checked ? "ml-auto" : "ml-0"}
            `}
            aria-hidden="true"
          />
        </button>
      ) : (
        <span className="text-sm tabular-nums text-[var(--pro-text-muted)]">{checked ? "Oui" : "Non"}</span>
      )}
    </div>
  );
}
