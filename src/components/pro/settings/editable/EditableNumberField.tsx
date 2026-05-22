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
  suffix?: string;
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
  suffix,
}: EditableNumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className={proLabelClass}>{label}</label>
        <div className="flex items-center gap-2">
          {suffix ? (
            <span className="rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] px-2.5 py-1 text-[11px] font-semibold text-[var(--pro-text-muted)]">
              {suffix}
            </span>
          ) : null}
          {hint ? <HelpTooltip text={hint} /> : null}
        </div>
      </div>
      {editing ? (
        <div className="relative">
          <input
            type="number"
            value={Number.isFinite(value) ? value : 0}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`${proInputClass} ${suffix ? "pr-16" : ""}`}
          />
          {suffix ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-[var(--pro-text-muted)]">
              {suffix}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3">
          <p className="text-sm text-[var(--pro-text)]">{value}</p>
          {suffix ? <span className="text-xs font-semibold text-[var(--pro-text-muted)]">{suffix}</span> : null}
        </div>
      )}
    </div>
  );
}
