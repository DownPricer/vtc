import type { ReactNode } from "react";
import { HelpTooltip } from "./HelpTooltip";

type ReadonlyFieldProps = {
  label: string;
  value: string | number | boolean | null | undefined;
  hint?: string;
  mono?: boolean;
  action?: ReactNode;
  suffix?: string;
};

function formatValue(value: ReadonlyFieldProps["value"]): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

export function ReadonlyField({ label, value, hint, mono, action, suffix }: ReadonlyFieldProps) {
  return (
    <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">{label}</p>
        <div className="flex shrink-0 items-center gap-1">
          {hint ? <HelpTooltip text={hint} /> : null}
          {action}
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className={`text-sm font-medium text-[var(--pro-text)] break-words ${mono ? "font-mono text-[13px]" : ""}`}>{formatValue(value)}</p>
        {suffix ? <span className="shrink-0 text-xs font-semibold text-[var(--pro-text-muted)]">{suffix}</span> : null}
      </div>
    </div>
  );
}
