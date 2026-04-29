"use client";

import type { ReactNode } from "react";

export function ProShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function ProPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-[var(--pro-border)] bg-[var(--pro-panel)] p-5 shadow-[var(--pro-shadow)] backdrop-blur md:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

export function ProSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--pro-accent)]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--pro-text)] md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--pro-text-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ProStatCard({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: string | number;
  hint?: string;
  tone: "orange" | "green" | "blue" | "slate";
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-300/25 bg-[linear-gradient(135deg,rgba(249,115,22,0.22),rgba(249,115,22,0.05))]"
      : tone === "green"
        ? "border-emerald-300/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(16,185,129,0.05))]"
        : tone === "blue"
          ? "border-sky-300/25 bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(14,165,233,0.05))]"
          : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]";

  return (
    <article className={`rounded-[24px] border p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm font-medium text-[var(--pro-text-soft)]">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--pro-text)]">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-[var(--pro-text-muted)]">{hint}</p> : null}
    </article>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-[20px] border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-8 text-center text-sm text-[var(--pro-text-muted)]">
      {message}
    </p>
  );
}
