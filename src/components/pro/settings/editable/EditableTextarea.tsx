"use client";

import { useId } from "react";
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
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={proLabelClass}>{label}</label>
        {hint ? <HelpTooltip text={hint} /> : null}
      </div>
      {editing ? (
        <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${proInputClass} min-h-[96px] resize-y`} />
      ) : (
        <p className="whitespace-pre-wrap rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm leading-relaxed text-[var(--pro-text-soft)]">
          {value === "" ? "—" : value}
        </p>
      )}
      {error ? <p id={`${id}-error`} className="text-xs font-medium text-[var(--pro-danger,#dc2626)]">{error}</p> : null}
    </div>
  );
}
