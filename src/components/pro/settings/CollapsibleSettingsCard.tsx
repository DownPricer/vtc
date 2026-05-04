"use client";

import { useState, type ReactNode } from "react";
import { proBtnSecondaryClass } from "./editable/proFieldStyles";

export type CollapsibleSettingsCardProps = {
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  preview?: ReactNode;
  defaultOpen?: boolean;
  editing?: boolean;
  children: ReactNode;
};

export function CollapsibleSettingsCard({
  title,
  subtitle,
  badge,
  preview,
  defaultOpen = false,
  editing,
  children,
}: CollapsibleSettingsCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/35 shadow-sm transition-colors">
      <div className="flex items-stretch gap-3 p-3 sm:p-4">
        {preview ? <div className="shrink-0">{preview}</div> : null}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold leading-snug text-[var(--pro-text)] sm:text-base">{title}</h4>
            {badge}
          </div>
          {subtitle ? <p className="line-clamp-3 text-xs leading-relaxed text-[var(--pro-text-muted)]">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col items-end justify-center gap-2 sm:flex-row sm:items-center">
          {editing ? (
            <button type="button" className={proBtnSecondaryClass} onClick={() => setOpen(true)}>
              Modifier
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel)] px-2.5 py-2 text-[var(--pro-text)] transition hover:border-[var(--pro-accent)]/35 hover:bg-[var(--pro-accent-soft)] hover:text-[var(--pro-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]/40 sm:min-h-0 sm:min-w-0"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            title={open ? "Replier" : "Déplier"}
          >
            <span className="sr-only">{open ? "Replier" : "Déplier"}</span>
            <svg
              className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {open ? <div className="space-y-4 border-t border-[var(--pro-border)] px-3 py-4 sm:px-4">{children}</div> : null}
    </div>
  );
}
