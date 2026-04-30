"use client";

import { HelpTooltip } from "../HelpTooltip";
import { proInputClass, proLabelClass } from "./proFieldStyles";

type EditableColorFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  hint?: string;
};

export function EditableColorField({ label, value, onChange, editing, hint }: EditableColorFieldProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3">
      <span className="h-9 w-9 shrink-0 rounded-lg border border-white/15 shadow-inner" style={{ backgroundColor: value }} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={proLabelClass}>{label}</span>
          {hint ? <HelpTooltip text={hint} /> : null}
        </div>
        {editing ? (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`${proInputClass} font-mono text-[13px]`} />
        ) : (
          <p className="font-mono text-[13px] text-[var(--pro-text-muted)]">{value}</p>
        )}
      </div>
    </div>
  );
}
