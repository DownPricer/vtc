"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ProIcon } from "@/components/pro/ProIcons";
import { ProPanel, proInputClass } from "@/components/pro/ProUi";

/** Carte de synthèse cliquable (Total, Nouvelles…) qui applique un filtre rapide. */
export function ProSummaryCard({
  label,
  value,
  hint,
  selected,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[116px] flex-col items-start rounded-[9px] border p-[15px] text-left text-[var(--pro-text)] transition hover:-translate-y-px hover:border-[var(--pro-border-strong)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#79a8ff] sm:min-h-[132px] sm:px-[19px] sm:py-[18px] ${
        selected
          ? "border-[#75a3fa] bg-[var(--pro-accent-soft)] shadow-[inset_0_3px_0_var(--pro-accent)]"
          : "border-[var(--pro-border)] bg-[var(--pro-panel)] shadow-[var(--pro-shadow)]"
      }`}
    >
      <span className="text-[13px] font-bold leading-[1.3]">{label}</span>
      <strong className="mb-[5px] mt-[9px] text-[29px] font-bold leading-none tracking-[-0.04em] tabular-nums sm:mb-1.5 sm:mt-3 sm:text-[33px]">{value}</strong>
      {hint ? <span className="text-[11px] leading-[1.35] text-[var(--pro-text-muted)] sm:text-xs">{hint}</span> : null}
    </button>
  );
}

/** Grille des cartes de synthèse (2 colonnes mobile, 3 tablette, `columns` en grand écran). */
export function ProSummaryGrid({ children, columns = 5 }: { children: ReactNode; columns?: 4 | 5 }) {
  return (
    <section
      className={`grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 ${columns === 4 ? "min-[1001px]:grid-cols-4" : "min-[1181px]:grid-cols-5"}`}
    >
      {children}
    </section>
  );
}

/** Panneau « Filtres » : en-tête avec bouton « Effacer » puis champs en grille. */
export function ProFilterPanel({
  title,
  description,
  active,
  onReset,
  children,
  gridClassName = "grid gap-[15px] md:grid-cols-[minmax(240px,1.6fr)_repeat(2,minmax(170px,1fr))]",
}: {
  title: string;
  description?: string;
  /** Vrai si au moins un filtre est appliqué : affiche le bouton « Effacer les filtres ». */
  active: boolean;
  onReset: () => void;
  children: ReactNode;
  gridClassName?: string;
}) {
  return (
    <ProPanel>
      <div className="mb-[22px] flex flex-col items-start justify-between gap-[15px] border-b border-[var(--pro-border)] pb-[18px] sm:flex-row">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">Filtres</p>
          <h2 className="mb-[5px] text-lg font-bold tracking-[-0.025em] text-[var(--pro-text)] sm:text-[21px]">{title}</h2>
          {description ? <p className="text-[13px] leading-[1.45] text-[var(--pro-text-muted)]">{description}</p> : null}
        </div>
        {active ? <ProGhostButton onClick={onReset}>Effacer les filtres</ProGhostButton> : null}
      </div>
      <div className={gridClassName}>{children}</div>
    </ProPanel>
  );
}

/** Petit bouton secondaire (Effacer, Rafraîchir, Précédent/Suivant). */
export function ProGhostButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-[13px] text-xs font-bold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
    </button>
  );
}

/** Champ de recherche avec loupe. */
export function ProSearchInput({
  value,
  onChange,
  placeholder,
  label = "Recherche",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[13px] font-bold text-[var(--pro-text)]">{label}</span>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-[13px] top-[13px] text-[var(--pro-text-muted)]">
          <ProIcon name="search" className="h-[18px] w-[18px]" />
        </span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`${proInputClass} pl-[41px]`}
        />
      </div>
    </label>
  );
}

/** Panneau de résultats : titre, compteur (aria-live) et zone de contenu. */
export function ProResultsPanel({
  title,
  count,
  side,
  children,
}: {
  title: string;
  count?: string;
  side?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ProPanel>
      <div className="mb-5 flex items-end justify-between gap-[15px]">
        <div className="min-w-0">
          <h2 className="mb-[5px] text-lg font-bold tracking-[-0.025em] text-[var(--pro-text)] sm:text-[21px]">{title}</h2>
          {count ? (
            <p aria-live="polite" className="text-[13px] leading-[1.45] text-[var(--pro-text-muted)]">
              {count}
            </p>
          ) : null}
        </div>
        {side ? <div className="shrink-0 whitespace-nowrap text-xs text-[var(--pro-text-muted)]">{side}</div> : null}
      </div>
      {children}
    </ProPanel>
  );
}

/** Pagination « Page x sur y » avec boutons Précédent / Suivant. */
export function ProPagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-5 flex flex-col items-start justify-between gap-[15px] text-[13px] text-[var(--pro-text-muted)] min-[521px]:flex-row min-[521px]:items-center">
      <span>
        Page {page} sur {pages}
      </span>
      <div className="flex gap-2">
        <ProGhostButton disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Précédent
        </ProGhostButton>
        <ProGhostButton disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Suivant
        </ProGhostButton>
      </div>
    </div>
  );
}

/** Onglets avec compteur (ex. Réservations : À venir / Historique / Toutes). */
export function ProTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string;
  tabs: Array<{ key: T; label: string; count: number }>;
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="mb-[22px] flex flex-wrap gap-2 border-b border-[var(--pro-border)] pb-5">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.key)}
            className={`inline-flex min-h-[43px] flex-1 items-center justify-center gap-[9px] rounded-[7px] border px-[9px] text-xs font-bold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] min-[521px]:flex-none min-[521px]:px-[15px] min-[521px]:text-[13px] ${
              active
                ? "border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] shadow-[inset_0_-2px_0_var(--pro-accent)]"
                : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]"
            }`}
          >
            {tab.label}
            <span className="min-w-[23px] rounded-full bg-[rgb(114_151_213/18%)] px-1.5 py-0.5 text-center text-xs tabular-nums">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Carte d'une ligne de liste sur mobile / tablette (remplace le tableau). */
export function ProRequestCard({
  name,
  badge,
  route,
  meta,
  amount,
  actions,
}: {
  name: string;
  badge?: ReactNode;
  route?: string;
  meta?: string[];
  amount?: string;
  actions: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-4">
      <div className="mb-2 flex items-start justify-between gap-2.5">
        <span className="min-w-0 text-[15px] font-bold text-[var(--pro-text)]">{name}</span>
        {badge}
      </div>
      {route ? <p className="mb-2.5 text-[13px] leading-normal text-[var(--pro-text)]">{route}</p> : null}
      {meta?.length ? (
        <div className="flex flex-wrap gap-x-3 gap-y-[7px] text-xs text-[var(--pro-text-muted)]">
          {meta.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      ) : null}
      <div className="mt-[13px] flex items-center justify-between gap-3 border-t border-[var(--pro-border)] pt-3">
        <strong className="text-[13px] font-bold tabular-nums text-[var(--pro-text)]">{amount ?? ""}</strong>
        <div className="flex flex-wrap items-center gap-[7px]">{actions}</div>
      </div>
    </article>
  );
}

/** Bouton « Ouvrir » plein (lien vers une fiche). */
export function ProOpenLink({ href, children = "Ouvrir", label }: { href: string; children?: ReactNode; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex min-h-[34px] items-center whitespace-nowrap rounded-md bg-[var(--pro-accent)] px-[11px] text-xs font-bold text-white transition hover:bg-[var(--pro-accent-hover)]"
    >
      {children}
    </Link>
  );
}

/** Bouton secondaire en lien (ex. « Devis PDF »). */
export function ProSecondaryLink({ href, children, label }: { href: string; children: ReactNode; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex min-h-[34px] items-center whitespace-nowrap rounded-md border border-[var(--pro-border)] bg-[var(--pro-panel)] px-[11px] text-xs font-bold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)]"
    >
      {children}
    </Link>
  );
}

/** Texte de recherche sans accents ni casse, pour comparer « Léa » et « lea ». */
export function searchNormalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Date courte pour les tableaux : « 24 oct. 2026, 09:14 ». Renvoie « — » si absente ou invalide. */
export function formatShortDateTime(value?: string | null, withTime = true): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

/** Découpe une liste en pages et renvoie la page courante (bornée) et le nombre de pages. */
export function paginate<T>(items: T[], page: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  return { pageItems: items.slice((current - 1) * perPage, current * perPage), page: current, pages };
}
