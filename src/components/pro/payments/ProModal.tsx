"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Modale accessible alignée sur le design pro (tokens --pro-*, clair/sombre). Échap et clic extérieur ferment, sauf si `busy`. */
export function ProModal({
  open,
  title,
  description,
  onClose,
  busy,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
  footer: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pro-modal-title">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => {
          if (!busy) onClose();
        }}
        aria-label="Fermer la fenêtre"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text)] shadow-2xl outline-none sm:max-h-[88vh] sm:rounded-2xl"
      >
        <div className="shrink-0 border-b border-[var(--pro-border)] px-5 py-4 sm:px-6">
          <h2 id="pro-modal-title" className="text-lg font-bold tracking-[-0.02em]">
            {title}
          </h2>
          {description ? <p className="mt-1 text-[13px] leading-[1.45] text-[var(--pro-text-muted)]">{description}</p> : null}
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        <div className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-[var(--pro-border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>
      </div>
    </div>
  );
}

export function ModalPrimaryButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-transparent px-[17px] text-[13px] font-bold text-white transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${
        danger ? "bg-[#c0283d] hover:bg-[#a3192a]" : "bg-[var(--pro-accent)] hover:bg-[var(--pro-accent-hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export function ModalSecondaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-[17px] text-[13px] font-bold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SummaryLine({ label, value, strong, hint }: { label: string; value: string; strong?: boolean; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-[13px]">
      <div>
        <span className={strong ? "font-bold text-[var(--pro-text)]" : "text-[var(--pro-text-muted)]"}>{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] leading-[1.4] text-[var(--pro-text-muted)]">{hint}</span> : null}
      </div>
      <span className={`shrink-0 tabular-nums ${strong ? "text-[15px] font-extrabold" : "font-bold"}`}>{value}</span>
    </div>
  );
}

export function formatCents(cents: number, currency = "eur"): string {
  const cur = currency.toLowerCase() === "eur" ? "€" : currency.toUpperCase();
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
}

/** "12,50" / "12.5" → centimes ; null si invalide. */
export function parseEurosToCents(raw: string): number | null {
  const s = raw.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(Number.parseFloat(s) * 100);
  return cents > 0 ? cents : null;
}
