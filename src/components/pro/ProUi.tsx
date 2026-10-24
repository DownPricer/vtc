"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ProIcon, type ProIconName } from "@/components/pro/ProIcons";

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
      className={`min-w-0 rounded-[10px] border border-[var(--pro-border)] bg-[var(--pro-panel)] p-[18px] shadow-[var(--pro-shadow)] sm:p-[25px] ${className}`}
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
  level = "page",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** `page` : titre h1 de la page. `panel` : titre h2 d'un bloc (en-tête de carte de la maquette). */
  level?: "page" | "panel";
}) {
  if (level === "panel") {
    return (
      <div className="mb-[18px] flex items-start justify-between gap-4 border-b border-[var(--pro-border)] pb-[18px]">
        <div className="min-w-0">
          {eyebrow ? <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">{eyebrow}</p> : null}
          <h2 className="text-lg font-bold leading-[1.3] tracking-[-0.025em] text-[var(--pro-text)] sm:text-[21px]">{title}</h2>
          {description ? <p className="mt-1.5 text-[13px] leading-[1.45] text-[var(--pro-text-muted)]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--pro-border)] pb-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[var(--pro-text)] md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--pro-text-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 xl:self-start">{action}</div> : null}
    </div>
  );
}

/** En-tête de page posé directement sur le fond (hors carte), comme dans la maquette. */
export function ProPageHead({
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
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-[22px]">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-[9px] text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">{eyebrow}</p> : null}
        <h1 className="mb-[9px] text-[clamp(29px,2.6vw,38px)] font-bold leading-[1.16] tracking-[-0.045em] text-[var(--pro-text)]">{title}</h1>
        {description ? <p className="max-w-[690px] text-[15px] leading-normal text-[var(--pro-text-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ProKicker({ children }: { children: ReactNode }) {
  return <p className="mb-[15px] text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-kicker)]">{children}</p>;
}

export function ProAlert({
  tone,
  children,
}: {
  tone: "success" | "error" | "info" | "warning";
  children: ReactNode;
}) {
  return <div className={`rounded-lg border px-4 py-3 text-[13px] leading-normal pro-alert--${tone}`}>{children}</div>;
}

/** Bandeau « session expirée » de la maquette : propose de se reconnecter. */
export function ProSessionAlert({ reconnectHref }: { reconnectHref: string }) {
  return (
    <section
      role="alert"
      aria-labelledby="pro-session-title"
      className="flex flex-wrap items-center gap-4 rounded-[10px] border border-[var(--pro-danger-line)] bg-[var(--pro-danger-bg)] px-[19px] py-[17px] shadow-[var(--pro-shadow)] sm:flex-nowrap"
    >
      <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[var(--pro-danger-icon)] text-[var(--pro-danger)]">
        <ProIcon name="alert" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="pro-session-title" className="mb-1 text-[17px] font-bold leading-[1.35] text-[var(--pro-danger-title)]">
          Votre session a expiré
        </h2>
        <p className="text-[13px] leading-normal text-[var(--pro-danger-text)]">
          Reconnectez-vous pour retrouver vos données et reprendre votre activité.
        </p>
      </div>
      <ProActionLink href={reconnectHref} variant="primary" withArrow>
        Se reconnecter
      </ProActionLink>
    </section>
  );
}

export function ProStatCard({
  title,
  value,
  hint,
  tone,
  href,
  icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  /** `blue`/`orange`/`green` : liseré coloré en haut de la carte. `slate` : carte neutre. */
  tone: "orange" | "green" | "blue" | "slate";
  href?: string;
  icon?: ProIconName;
}) {
  const toneTop =
    tone === "orange"
      ? "border-t-[3px] border-t-amber-500"
      : tone === "green"
        ? "border-t-[3px] border-t-emerald-600"
        : tone === "blue"
          ? "border-t-[3px] border-t-[#3675ed]"
          : "";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-[9px] text-sm font-bold leading-[1.35] text-[var(--pro-text)]">
        <span>{title}</span>
        {icon ? (
          <span className="-mt-[3px] hidden h-[34px] w-[34px] shrink-0 place-items-center rounded-[7px] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)] sm:grid">
            <ProIcon name={icon} className="h-[18px] w-[18px]" />
          </span>
        ) : null}
      </div>
      <p className="mb-[7px] mt-[11px] text-[32px] font-bold leading-none tracking-[-0.05em] text-[var(--pro-text)] tabular-nums sm:mt-3.5 sm:text-[38px]">
        {value}
      </p>
      {hint ? <p className="text-xs leading-[1.45] text-[var(--pro-text-muted)] sm:text-[13px]">{hint}</p> : null}
    </>
  );

  const base = `min-h-[132px] rounded-[9px] border border-[var(--pro-border)] bg-[var(--pro-panel)] p-[15px] shadow-[var(--pro-shadow)] sm:min-h-[150px] sm:px-[21px] sm:py-5 ${toneTop}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`block transition hover:border-[var(--pro-border-strong)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#79a8ff] ${base}`}
      >
        {inner}
      </Link>
    );
  }

  return <article className={base}>{inner}</article>;
}

export function ProActionLink({
  href,
  children,
  variant = "secondary",
  withArrow = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  withArrow?: boolean;
}) {
  const common =
    "inline-flex min-h-[44px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[7px] border px-[17px] text-[13px] font-bold transition active:translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#79a8ff]";
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? `${common} border-transparent bg-[var(--pro-accent)] text-white shadow-[0_4px_12px_rgb(37_99_235/14%)] hover:bg-[var(--pro-accent-hover)]`
          : `${common} border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text)] hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)]`
      }
    >
      {children}
      {withArrow ? <ProIcon name="arrow" className="h-4 w-4" /> : null}
    </Link>
  );
}

/** Lien texte « Tout voir → » des en-têtes de carte. */
export function ProTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-[5px] whitespace-nowrap text-[13px] font-bold text-[var(--pro-accent)] hover:underline">
      {children}
      <ProIcon name="arrow" className="h-[13px] w-[13px]" />
    </Link>
  );
}

/**
 * Ligne cliquable d'une liste (demande, course, activité).
 * `badge` affiche un statut à droite, avant la flèche.
 */
export function ProDataRow({
  href,
  title,
  detail,
  badge,
}: {
  href: string;
  title: string;
  detail?: string;
  badge?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[66px] items-center justify-between gap-3 rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-[15px] py-[13px] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)]"
    >
      <span className="min-w-0">
        <strong className="block truncate text-sm font-bold leading-[1.4] text-[var(--pro-text)]">{title}</strong>
        {detail ? <small className="mt-1 block truncate text-xs leading-[1.4] text-[var(--pro-text-muted)]">{detail}</small> : null}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {badge}
        <span className="text-lg text-[var(--pro-accent)]" aria-hidden="true">
          →
        </span>
      </span>
    </Link>
  );
}

/** Tuile de raccourci (grille 2 colonnes de la carte « Accès rapides »). */
export function ProShortcut({ href, icon, children }: { href: string; icon: ProIconName; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[56px] items-center gap-2.5 rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-[13px] py-2.5 text-[13px] font-semibold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)] hover:text-[var(--pro-accent-hover)]"
    >
      <span className="text-[var(--pro-accent)]">
        <ProIcon name={icon} />
      </span>
      <span className="min-w-0 truncate">{children}</span>
      <span className="ml-auto text-[var(--pro-text-muted)]">
        <ProIcon name="arrow" className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function EmptyState({
  message,
  title,
  icon,
  actionLabel,
  actionHref,
  onAction,
}: {
  message: string;
  title?: string;
  icon?: ProIconName;
  actionLabel?: string;
  actionHref?: string;
  /** Action sous forme de bouton (ex. « Effacer les filtres »), à la place d'un lien. */
  onAction?: () => void;
}) {
  if (!title && !icon && !onAction) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-5 py-10 text-center text-sm text-[var(--pro-text-muted)]">
        {message}
      </p>
    );
  }

  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] p-5 text-center">
      {icon ? (
        <span className="mb-[11px] grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]">
          <ProIcon name={icon} className="h-[21px] w-[21px]" />
        </span>
      ) : null}
      {title ? <h3 className="mb-[5px] text-[15px] font-bold text-[var(--pro-text)]">{title}</h3> : null}
      <p className="max-w-[295px] text-[13px] leading-normal text-[var(--pro-text-muted)]">{message}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-3 inline-flex items-center gap-[5px] text-[13px] font-bold text-[var(--pro-accent)] hover:underline">
          {actionLabel} →
        </Link>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex min-h-[38px] items-center rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-[13px] text-xs font-bold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
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
      <span className="block text-[13px] font-bold text-[var(--pro-text)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const proInputClass =
  "w-full min-h-[45px] rounded-[7px] border border-[var(--pro-input-border)] bg-[var(--pro-panel-muted)] px-[13px] py-2.5 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline focus:outline-[3px] focus:outline-[rgb(72_132_247/18%)]";

/** Cellule et ligne de tableau (ProTable) : mêmes espacements que les maquettes. */
export const proTdClass = "px-3 py-[15px] align-middle text-[13px] leading-[1.4] text-[var(--pro-text)]";
export const proTrClass = "transition hover:bg-[var(--pro-panel-muted)]";

export function ProTable({
  headers,
  children,
  minWidth = 960,
}: {
  headers: ReactNode[];
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--pro-border)]">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead className="bg-[var(--pro-panel-muted)] text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--pro-th)]">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="whitespace-nowrap px-3 py-[15px] font-extrabold">
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
