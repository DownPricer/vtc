"use client";

import { HelpTooltip } from "../HelpTooltip";
import { proInputClass, proLabelClass } from "./proFieldStyles";

type EditableTextareaProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  hint?: string;
  rows?: number;
  error?: string;
};

export function EditableTextarea({ label, value, onChange, editing, hint, rows = 4, error }: EditableTextareaProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className={proLabelClass}>{label}</label>
        {hint ? <HelpTooltip text={hint} /> : null}
      </div>
      {editing ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${proInputClass} min-h-[96px] resize-y`} />
      ) : (
        <p className="whitespace-pre-wrap rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm leading-relaxed text-[var(--pro-text-soft)]">
          {value === "" ? "—" : value}
        </p>
      )}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
