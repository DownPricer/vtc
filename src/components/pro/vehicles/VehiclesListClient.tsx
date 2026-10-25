"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProAlert, ProPageHead } from "@/components/pro/ProUi";
import { proBtnPrimaryClass, proBtnSecondaryClass } from "@/components/pro/settings/editable/proFieldStyles";
import {
  archiveProVehicle,
  featureProVehicle,
  listProVehicles,
  restoreProVehicle,
  surchargeShort,
  updateProVehicle,
  type ProVehicle,
} from "@/lib/proVehiclesClient";

type Filter = "all" | "active" | "inactive" | "archived";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "inactive", label: "Inactifs" },
  { id: "archived", label: "Archivés" },
];

function matches(v: ProVehicle, f: Filter): boolean {
  if (f === "archived") return v.archived;
  if (v.archived) return false;
  if (f === "active") return v.active;
  if (f === "inactive") return !v.active;
  return true;
}

const btnSm = `${proBtnSecondaryClass} inline-flex min-h-[44px] items-center justify-center !px-3.5 !py-2 text-[13px] sm:min-h-[38px]`;

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Chip({ tone, children }: { tone: "ok" | "off" | "accent" | "plain"; children: ReactNode }) {
  const tones = {
    ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    off: "bg-slate-500/15 text-[var(--pro-text-soft)]",
    accent: "bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]",
    plain: "bg-[var(--pro-panel-muted)] text-[var(--pro-text-soft)] border border-[var(--pro-border)]",
  } as const;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ${tones[tone]}`}>{children}</span>;
}

function Cover({ v }: { v: ProVehicle }) {
  const src = v.photos[0]?.url;
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-[var(--pro-panel-muted)] ${v.archived || !v.active ? "opacity-80" : ""}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- vignette d'administration
        <img src={src} alt="" className={`h-full w-full object-cover ${v.archived ? "grayscale" : ""}`} loading="lazy" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[var(--pro-text-muted)]">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 16V11l1.7-4.2A2 2 0 0 1 8.6 5.5h6.8a2 2 0 0 1 1.9 1.3L19 11v5M3 16h18M7 16v2M17 16v2" />
            <circle cx="8" cy="13" r=".6" />
            <circle cx="16" cy="13" r=".6" />
          </svg>
          <span className="text-xs font-medium">Aucune photo</span>
        </div>
      )}
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 [&>span]:rounded-full [&>span]:bg-[var(--pro-panel)] [&>span]:shadow-sm">
        <span>{v.archived ? <Chip tone="off">Archivé</Chip> : v.active ? <Chip tone="ok">● Actif</Chip> : <Chip tone="off">Inactif</Chip>}</span>
        {v.featured && !v.archived ? (
          <span>
            <Chip tone="accent">★ Mis en avant</Chip>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActiveSwitch({ v, busy, onToggle }: { v: ProVehicle; busy: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={v.active}
      aria-label={v.active ? `Désactiver ${v.name}` : `Activer ${v.name}`}
      disabled={busy}
      onClick={onToggle}
      className="group flex min-h-[44px] items-center gap-2.5 rounded-lg text-left disabled:opacity-60 sm:min-h-0"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${v.active ? "bg-emerald-500" : "bg-[var(--pro-border-strong)]"} group-focus-visible:ring-2 group-focus-visible:ring-[var(--pro-accent)] group-focus-visible:ring-offset-2`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${v.active ? "translate-x-5" : ""}`} />
      </span>
      <span className="text-[13px] font-semibold text-[var(--pro-text)]">{v.active ? "Proposé aux clients" : "Masqué aux clients"}</span>
    </button>
  );
}

function MoreMenu({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (el?.open && !el.contains(e.target as Node)) el.open = false;
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) ref.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);
  return (
    <details ref={ref} className="relative">
      <summary
        aria-label={label}
        className={`${proBtnSecondaryClass} flex h-[44px] w-[44px] cursor-pointer list-none items-center justify-center !p-0 sm:h-[38px] sm:w-[38px] [&::-webkit-details-marker]:hidden`}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </summary>
      <div
        className="absolute bottom-full right-0 z-20 mb-2 w-56 overflow-hidden rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] py-1 shadow-xl"
        onClick={() => {
          if (ref.current) ref.current.open = false;
        }}
      >
        {children}
      </div>
    </details>
  );
}

const menuItem =
  "flex min-h-[44px] w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-muted)] disabled:opacity-50 sm:min-h-0";

function VehicleCard({
  v,
  busy,
  run,
}: {
  v: ProVehicle;
  busy: boolean;
  run: (id: string, fn: () => Promise<unknown>, okMessage: string) => Promise<void>;
}) {
  const subtitle = [v.category, v.vehicleType].filter(Boolean).join(" · ");
  return (
    <li className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-[var(--pro-panel)] shadow-[var(--pro-shadow)] transition hover:shadow-lg ${v.featured && !v.archived ? "border-[var(--pro-accent)]/50" : "border-[var(--pro-border)]"}`}>
      <Link href={`/pro/vehicules/${v.id}`} aria-label={`Modifier ${v.name}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--pro-accent)]">
        <Cover v={v} />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-[var(--pro-text)]">{v.name}</h2>
          {subtitle ? <p className="mt-0.5 truncate text-[13px] text-[var(--pro-text-muted)]">{subtitle}</p> : null}
        </div>

        <ul className="flex flex-wrap gap-1.5">
          <li>
            <Chip tone="plain">
              <Icon>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
              </Icon>
              {v.passengerMax} pass.
            </Chip>
          </li>
          <li>
            <Chip tone="plain">
              <Icon>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </Icon>
              {v.photoCount}/{v.maxPhotos}
            </Chip>
          </li>
          <li>
            <Chip tone={v.surchargeMode === "none" ? "plain" : "accent"}>
              {v.surchargeMode === "none" ? "Tarif standard" : `Supplément ${surchargeShort(v)}`}
            </Chip>
          </li>
        </ul>

        {!v.archived ? (
          <div className="border-t border-[var(--pro-border)] pt-3">
            <ActiveSwitch
              v={v}
              busy={busy}
              onToggle={() =>
                run(
                  v.id,
                  () => updateProVehicle(v.id, { active: !v.active }),
                  v.active ? `« ${v.name} » désactivé : il n'est plus proposé aux clients.` : `« ${v.name} » activé.`
                )
              }
            />
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-2 pt-1">
          {v.archived ? (
            <button
              type="button"
              disabled={busy}
              className={`${proBtnPrimaryClass} inline-flex min-h-[44px] flex-1 items-center justify-center sm:min-h-[38px]`}
              onClick={() => run(v.id, () => restoreProVehicle(v.id), `« ${v.name} » restauré.`)}
            >
              Restaurer
            </button>
          ) : (
            <Link href={`/pro/vehicules/${v.id}`} className={`${proBtnPrimaryClass} inline-flex min-h-[44px] flex-1 items-center justify-center sm:min-h-[38px]`}>
              Modifier
            </Link>
          )}
          <Link href={`/pro/calendrier?vehicule=${v.id}`} className={`${btnSm} flex-1`}>
            Réservations
          </Link>
          {!v.archived ? (
            <MoreMenu label={`Autres actions pour ${v.name}`}>
              {v.active && !v.featured ? (
                <button
                  type="button"
                  disabled={busy}
                  className={menuItem}
                  onClick={() => run(v.id, () => featureProVehicle(v.id), `« ${v.name} » est mis en avant sur le site.`)}
                >
                  ★ Mettre en avant
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy}
                className={`${menuItem} !text-red-600`}
                onClick={() => {
                  if (!window.confirm(`Archiver « ${v.name} » ? L'historique des devis et réservations est conservé.`)) return;
                  void run(v.id, () => archiveProVehicle(v.id), `« ${v.name} » archivé.`);
                }}
              >
                Archiver ce véhicule
              </button>
            </MoreMenu>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)]">
          <div className="aspect-[16/10] bg-[var(--pro-panel-muted)]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-[var(--pro-panel-muted)]" />
            <div className="h-3 w-1/3 rounded bg-[var(--pro-panel-muted)]" />
            <div className="h-11 rounded-xl bg-[var(--pro-panel-muted)]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function VehiclesListClient() {
  const [vehicles, setVehicles] = useState<ProVehicle[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setVehicles(await listProVehicles(true));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(id: string, fn: () => Promise<unknown>, okMessage: string) {
    setBusyId(id);
    setNotice(null);
    try {
      await fn();
      setNotice(okMessage);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, active: 0, inactive: 0, archived: 0 };
    for (const v of vehicles ?? []) for (const f of FILTERS) if (matches(v, f.id)) c[f.id] += 1;
    return c;
  }, [vehicles]);

  const visible = useMemo(() => (vehicles ?? []).filter((v) => matches(v, filter)), [vehicles, filter]);
  const hasAny = (vehicles?.length ?? 0) > 0;

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Gestion"
          title="Mes véhicules"
          description="Votre flotte : photos, capacités, supplément de tarif et disponibilités. Chaque véhicule choisi par un client est réservé pour la journée de sa course."
          action={
            <Link href="/pro/vehicules/nouveau" className={`${proBtnPrimaryClass} flex min-h-[46px] w-full items-center justify-center gap-2 sm:inline-flex sm:w-auto`}>
              <span aria-hidden="true" className="text-lg leading-none">＋</span>
              Ajouter un véhicule
            </Link>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}
        {notice ? <ProAlert tone="success">{notice}</ProAlert> : null}

        {hasAny ? (
          <div role="tablist" aria-label="Filtrer les véhicules" className="-mx-[18px] flex gap-2 overflow-x-auto px-[18px] pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition ${
                    on
                      ? "border-[var(--pro-accent)] bg-[var(--pro-accent)] text-white"
                      : "border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text-soft)] hover:border-[var(--pro-accent)]/40"
                  }`}
                >
                  {f.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${on ? "bg-white/25" : "bg-[var(--pro-panel-muted)]"}`}>{counts[f.id]}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {vehicles === null && !error ? <SkeletonGrid /> : null}

        {vehicles && !hasAny ? (
          <div className="rounded-2xl border border-dashed border-[var(--pro-border-strong)] bg-[var(--pro-panel)] px-6 py-12 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 16V11l1.7-4.2A2 2 0 0 1 8.6 5.5h6.8a2 2 0 0 1 1.9 1.3L19 11v5M3 16h18M7 16v2M17 16v2" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[var(--pro-text)]">Aucun véhicule pour le moment</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--pro-text-muted)]">Ajoutez votre premier véhicule pour le proposer à vos clients.</p>
            <Link href="/pro/vehicules/nouveau" className={`${proBtnPrimaryClass} mt-5 inline-flex min-h-[46px] items-center justify-center`}>
              Ajouter un véhicule
            </Link>
          </div>
        ) : null}

        {hasAny && visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--pro-border)] px-6 py-10 text-center text-sm text-[var(--pro-text-muted)]">
            Aucun véhicule dans cette catégorie.
          </p>
        ) : null}

        {visible.length > 0 ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4">
            {visible.map((v) => (
              <VehicleCard key={v.id} v={v} busy={busyId === v.id} run={run} />
            ))}
          </ul>
        ) : null}
      </div>
    </ProGuard>
  );
}
