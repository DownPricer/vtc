"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function ProShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start [&>*:not(:first-child)]:lg:col-start-2">
      {children}
    </div>
  );
}

export function ProPanel({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-5 shadow-[var(--pro-shadow)] md:p-6 xl:p-7 ${className}`}
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
    <div className="flex flex-col gap-4 border-b border-[var(--pro-border)] pb-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pro-accent)]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--pro-text)] md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--pro-text-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 xl:self-start">{action}</div> : null}
    </div>
  );
}

export function ProAlert({
  tone,
  children,
}: {
  tone: "success" | "error" | "info" | "warning";
  children: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-sky-200 bg-sky-50 text-sky-800";

  return <div className={`rounded-xl border px-4 py-3 text-sm ${toneClass}`}>{children}</div>;
}

export function ProStatCard({
  title,
  value,
  hint,
  tone,
  href,
}: {
  title: string;
  value: string | number;
  hint?: string;
  tone: "orange" | "green" | "blue" | "slate";
  href?: string;
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-200 bg-orange-50/70"
      : tone === "green"
        ? "border-emerald-200 bg-emerald-50/70"
        : tone === "blue"
          ? "border-sky-200 bg-sky-50/70"
          : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{title}</p>
        {href ? <span className="text-xs font-semibold text-[var(--pro-accent)]">Voir</span> : null}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--pro-text)]">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-[var(--pro-text-muted)]">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block rounded-2xl border p-5 transition hover:border-[var(--pro-border-strong)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)] ${toneClass}`}
      >
        {inner}
      </Link>
    );
  }

  return <article className={`rounded-2xl border p-5 ${toneClass}`}>{inner}</article>;
}

export function ProActionLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex items-center justify-center rounded-xl border border-[var(--pro-accent)] bg-[var(--pro-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          : "inline-flex items-center justify-center rounded-xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
      }
    >
      {children}
    </Link>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-5 py-10 text-center text-sm text-[var(--pro-text-muted)]">
      {message}
    </p>
  );
}

export function ProField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const proInputClass =
  "w-full rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none";

export function ProTable({
  headers,
  children,
}: {
  headers: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--pro-border)]">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead className="bg-[var(--pro-panel-muted)] text-xs uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border-b border-[var(--pro-border)] px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--pro-border)]">{children}</tbody>
      </table>
    </div>
  );
}

export function ProDescriptionList({
  rows,
}: {
  rows: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="divide-y divide-[var(--pro-border)] rounded-xl border border-[var(--pro-border)]">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[180px_minmax(0,1fr)]">
          <dt className="font-medium text-[var(--pro-text-muted)]">{row.label}</dt>
          <dd className="min-w-0 text-[var(--pro-text)]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
