"use client";

import { HelpTooltip } from "../HelpTooltip";
import { proInputClass, proLabelClass } from "./proFieldStyles";

type EditableNumberFieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  editing: boolean;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function EditableNumberField({
  label,
  value,
  onChange,
  editing,
  hint,
  min,
  max,
  step,
}: EditableNumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className={proLabelClass}>{label}</label>
        {hint ? <HelpTooltip text={hint} /> : null}
      </div>
      {editing ? (
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className={proInputClass}
        />
      ) : (
        <p className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)]">{value}</p>
      )}
    </div>
  );
}
