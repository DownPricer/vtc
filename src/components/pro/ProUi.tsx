"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function ProShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6 xl:space-y-8">{children}</div>;
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
      className={`rounded-[32px] border border-[var(--pro-border)] bg-[var(--pro-panel)] p-5 shadow-[var(--pro-shadow)] backdrop-blur md:p-7 xl:p-8 ${className}`}
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
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--pro-accent)]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--pro-text)] md:text-3xl xl:text-[2.15rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--pro-text-muted)] md:text-[15px]">{description}</p> : null}
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

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>{children}</div>;
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
      ? "border-orange-300/30 bg-[linear-gradient(145deg,rgba(249,115,22,0.22),rgba(255,255,255,0.05))]"
      : tone === "green"
        ? "border-emerald-300/30 bg-[linear-gradient(145deg,rgba(16,185,129,0.22),rgba(255,255,255,0.05))]"
        : tone === "blue"
          ? "border-sky-300/30 bg-[linear-gradient(145deg,rgba(14,165,233,0.22),rgba(255,255,255,0.05))]"
          : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--pro-text-soft)]">{title}</p>
        {href ? <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--pro-accent)]">Ouvrir</span> : null}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-[var(--pro-text)] sm:text-4xl">{value}</p>
      {hint ? <p className="mt-3 text-sm leading-6 text-[var(--pro-text-muted)]">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block rounded-[28px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)] ${toneClass}`}
      >
        {inner}
      </Link>
    );
  }

  return <article className={`rounded-[28px] border p-5 shadow-sm ${toneClass}`}>{inner}</article>;
}

export function ProActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
    >
      {children}
    </Link>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-[24px] border border-dashed border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-5 py-12 text-center text-sm text-[var(--pro-text-muted)]">
      {message}
    </p>
  );
}
