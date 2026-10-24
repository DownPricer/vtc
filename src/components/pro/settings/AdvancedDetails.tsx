"use client";

import { useEffect, useState, type ReactNode } from "react";

type AdvancedDetailsProps = {
  title?: string;
  description?: string;
  /** Ouvre le bloc (ex. une erreur de validation se cache dedans). */
  forceOpen?: boolean;
  children: ReactNode;
};

/** Regroupe les champs techniques, repliés par défaut, pour ne pas noyer les réglages courants. */
export function AdvancedDetails({
  title = "Réglages avancés",
  description = "Champs techniques — à modifier seulement si nécessaire.",
  forceOpen = false,
  children,
}: AdvancedDetailsProps) {
  const [open, setOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <div className="rounded-2xl border border-dashed border-[var(--pro-border)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-[var(--pro-text)]">{title}</span>
          <span className="block text-xs text-[var(--pro-text-muted)]">{description}</span>
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-[var(--pro-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? <div className="space-y-3 border-t border-dashed border-[var(--pro-border)] px-4 py-4">{children}</div> : null}
    </div>
  );
}
