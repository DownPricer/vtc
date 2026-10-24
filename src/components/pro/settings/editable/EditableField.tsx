"use client";

import { useId, type ReactNode } from "react";
import { HelpTooltip } from "../HelpTooltip";
import { proInputClass, proLabelClass } from "./proFieldStyles";

type EditableFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  hint?: string;
  mono?: boolean;
  type?: "text" | "email" | "tel" | "url";
  error?: string;
  action?: ReactNode;
};

export function EditableField({
  label,
  value,
  onChange,
  editing,
  hint,
  mono,
  type = "text",
  error,
  action,
}: EditableFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={proLabelClass}>{label}</label>
        <div className="flex shrink-0 items-center gap-1">
          {hint ? <HelpTooltip text={hint} /> : null}
          {action}
        </div>
      </div>
      {editing ? (
        <input
          id={id}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${proInputClass} ${mono ? "font-mono text-[13px]" : ""}`}
        />
      ) : (
        <p className={`rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] ${mono ? "font-mono text-[13px]" : ""}`}>
          {value === "" ? "—" : value}
        </p>
      )}
      {error ? <p id={`${id}-error`} className="text-xs font-medium text-[var(--pro-danger,#dc2626)]">{error}</p> : null}
    </div>
  );
}
