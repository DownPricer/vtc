"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProActionLink, ProAlert, ProField, ProPageHead, ProPanel, proInputClass } from "@/components/pro/ProUi";
import { ProGhostButton, ProOpenLink, ProSearchInput, searchNormalize } from "@/components/pro/ProListUi";
import { formatPrice, getDisplayName, getJourneySummary, isUsefulValue, labelStatus, mapApiErrorToFr, statusBadgeClass } from "@/components/pro/proDisplay";
import { proApi } from "@/lib/proApi";
import {
  BLOCK_REASON_LABELS,
  getVehicleCalendar,
  listProVehicles,
  type CalendarOccupation,
  type ProVehicle,
} from "@/lib/proVehiclesClient";

type CalendarItem = {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  status: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  flatPayload: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  vehicleId?: string | null;
  vehicleSnapshot?: { name?: string } | null;
};

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const PERIODS = [
  { value: 7, label: "Les 7 prochains jours" },
  { value: 30, label: "Les 30 prochains jours" },
  { value: 90, label: "Les 90 prochains jours" },
];

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "accepted", label: "Accepté" },
  { value: "scheduled", label: "Planifié" },
  { value: "completed", label: "Terminé" },
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}
function parseDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function CalendarRow({ item }: { item: CalendarItem }) {
  const date = parseDate(item.scheduledStart);
  const day = date ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(date) : "—";
  const hour = date ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date) : "—";
  const rawTarif = item.pricingResult && (item.pricingResult as Record<string, unknown>).tarif;
  const tarif = isUsefulValue(rawTarif) ? formatPrice(rawTarif) : "";
  const name = getDisplayName(item.clientName);

  return (
    <article className="grid min-h-[85px] items-center gap-[11px] rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-[18px] py-[15px] min-[521px]:grid-cols-[100px_minmax(0,1fr)] min-[521px]:gap-[18px] min-[951px]:grid-cols-[125px_minmax(0,1fr)_auto]">
      <div className="flex items-baseline gap-[9px] min-[521px]:flex-col min-[521px]:items-start min-[521px]:gap-[3px] min-[521px]:border-r min-[521px]:border-[var(--pro-border)] min-[521px]:pr-[15px]">
        <span className="text-xs capitalize text-[var(--pro-text-muted)]">{day}</span>
        <strong className="text-[22px] font-bold leading-[1.1] tabular-nums text-[var(--pro-text)]">{hour}</strong>
      </div>
      <div className="min-w-0">
        <strong className="mb-[5px] block text-[15px] font-bold leading-[1.35] text-[var(--pro-text)]">
          {getJourneySummary(item.flatPayload) || "Trajet à préciser"}
        </strong>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-[7px] text-xs text-[var(--pro-text-muted)]">
          <span>{name}</span>
          <span className={`${statusBadgeClass(item.status)} !min-h-[23px] !text-[11px]`}>{labelStatus(item.status)}</span>
          {item.vehicleSnapshot?.name || item.flatPayload?.Vehicule ? (
            <span>Véhicule : {item.vehicleSnapshot?.name ?? String(item.flatPayload?.Vehicule)}</span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--pro-border)] pt-2.5 min-[521px]:col-start-2 min-[521px]:border-0 min-[521px]:pt-0 min-[951px]:col-start-3">
        <strong className="whitespace-nowrap text-sm font-bold tabular-nums text-[var(--pro-text)]">{tarif}</strong>
        <ProOpenLink href={`/pro/demandes/${item.id}`} label={`Ouvrir la course de ${name}`} />
      </div>
    </article>
  );
}

function AgendaSection({
  id,
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  items: CalendarItem[];
  emptyMessage: string;
}) {
  return (
    <ProPanel id={id}>
      <div className="mb-[17px] border-b border-[var(--pro-border)] pb-4">
        <p className="mb-[5px] text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">{eyebrow}</p>
        <h2 className="mb-[5px] flex items-center gap-2.5 text-lg font-bold tracking-[-0.025em] text-[var(--pro-text)] sm:text-[21px]">
          {title}
          <span className="min-w-[25px] rounded-full bg-[var(--pro-accent-soft)] px-[7px] py-1 text-center text-xs leading-none tabular-nums text-[var(--pro-accent)]">
            {items.length}
          </span>
        </h2>
        <p className="text-[13px] text-[var(--pro-text-muted)]">{description}</p>
      </div>
      {items.length ? (
        <div className="grid gap-2.5">
          {items.map((item) => (
            <CalendarRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-5 py-[19px] text-[13px] text-[var(--pro-text-muted)]">
          {emptyMessage}
        </p>
      )}
    </ProPanel>
  );
}

export default function ProCalendrierPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState(30);
  const [q, setQ] = useState("");
  const [vehicles, setVehicles] = useState<ProVehicle[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [occupations, setOccupations] = useState<CalendarOccupation[]>([]);

  // Filtre véhicule pré-sélectionné via /pro/calendrier?vehicule=<id> (liens de la page Véhicules).
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("vehicule");
    if (v) setVehicleFilter(v);
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);
  const to = useMemo(() => endOfDay(addDays(today, period)), [today, period]);
  const todayEnd = useMemo(() => endOfDay(today), [today]);
  const weekEnd = useMemo(() => endOfDay(addDays(today, 6)), [today]);

  const load = useCallback(() => {
    setLoading(true);
    proApi(`/dashboard/calendar?from=${encodeURIComponent(today.toISOString())}&to=${encodeURIComponent(to.toISOString())}`)
      .then((json) => {
        setItems(((json.data as CalendarItem[]) || []).slice());
        setError("");
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, [today, to]);

  useEffect(() => {
    load();
  }, [load]);

  // Flotte + occupations (réservations confirmées et immobilisations) sur la période affichée.
  useEffect(() => {
    let cancelled = false;
    listProVehicles()
      .then((v) => !cancelled && setVehicles(v))
      .catch(() => undefined);
    getVehicleCalendar(dayKey(today), dayKey(addDays(today, Math.min(period, 99))), vehicleFilter || undefined)
      .then((r) => !cancelled && setOccupations(r.occupations))
      .catch(() => !cancelled && setOccupations([]));
    return () => {
      cancelled = true;
    };
  }, [today, period, vehicleFilter]);

  const filtered = useMemo(() => {
    const query = searchNormalize(q.trim());
    return items
      .filter((item) => parseDate(item.scheduledStart))
      .filter((item) => {
        const searchable = [item.id, item.clientName, item.clientEmail, item.clientPhone, getJourneySummary(item.flatPayload)].map(searchNormalize).join(" ");
        return (
          (!query || searchable.includes(query)) &&
          (!status || item.status === status) &&
          (!vehicleFilter || item.vehicleId === vehicleFilter)
        );
      })
      .sort((a, b) => new Date(a.scheduledStart || "").getTime() - new Date(b.scheduledStart || "").getTime());
  }, [items, q, status, vehicleFilter]);

  const inRange = (item: CalendarItem, from: Date | null, until: Date | null) => {
    const d = parseDate(item.scheduledStart);
    if (!d) return false;
    return (!from || d > from) && (!until || d <= until);
  };
  const todayItems = filtered.filter((item) => {
    const d = parseDate(item.scheduledStart);
    return d ? d >= today && d <= todayEnd : false;
  });
  const weekItems = filtered.filter((item) => inRange(item, todayEnd, weekEnd));
  const laterItems = filtered.filter((item) => inRange(item, weekEnd, null));

  const hasFilters = !!q.trim() || !!status || period !== 30 || !!vehicleFilter;
  const fmt = (d: Date, withYear = false) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) }).format(d);

  function clearFilters() {
    setQ("");
    setStatus("");
    setPeriod(30);
    setVehicleFilter("");
  }

  const todayKey = dayKey(today);
  const fleetToday = vehicles
    .filter((v) => !v.archived && (!vehicleFilter || v.id === vehicleFilter))
    .map((v) => {
      const occ = occupations.find((o) => o.vehicleId === v.id && o.day === todayKey);
      return { v, state: occ ? (occ.blockId ? ("blocked" as const) : ("booked" as const)) : ("free" as const), occ };
    });
  const blockedDays = occupations.filter((o) => o.blockId);
  const blockedByVehicle = vehicles
    .map((v) => ({ v, days: blockedDays.filter((o) => o.vehicleId === v.id).map((o) => o.day).sort() }))
    .filter((x) => x.days.length > 0);

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Planning des courses"
          title="Calendrier"
          description="Visualisez les trajets planifiés par période et ouvrez rapidement une réservation."
          action={
            <div className="flex flex-wrap gap-2">
              <ProGhostButton onClick={load}>Rafraîchir</ProGhostButton>
              <ProActionLink href="/pro/reservations" withArrow>
                Toutes les réservations
              </ProActionLink>
            </div>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <ProPanel>
          <div className="mb-[21px] flex flex-col items-start justify-between gap-3 border-b border-[var(--pro-border)] pb-[19px] min-[521px]:flex-row min-[521px]:items-end min-[521px]:gap-5">
            <div>
              <p className="mb-[7px] text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">Période</p>
              <h2 className="mb-[5px] text-lg font-bold tracking-[-0.025em] text-[var(--pro-text)] sm:text-[21px]">Courses planifiées</h2>
              <p className="text-[13px] text-[var(--pro-text-muted)]">
                Du {fmt(today)} au {fmt(addDays(today, period), true)}
              </p>
            </div>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <strong className="text-[30px] font-bold leading-none tabular-nums text-[var(--pro-text)]">{loading ? "–" : filtered.length}</strong>
              <span className="text-xs text-[var(--pro-text-muted)]">course(s) dans la période</span>
            </div>
          </div>

          <div className="grid items-end gap-[15px] md:grid-cols-2 min-[1201px]:grid-cols-[minmax(230px,1.4fr)_repeat(3,minmax(170px,1fr))_auto]">
            <ProSearchInput value={q} onChange={setQ} placeholder="Client ou trajet" />
            <ProField label="Afficher">
              <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className={proInputClass}>
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </ProField>
            {vehicles.length > 0 ? (
              <ProField label="Véhicule">
                <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className={proInputClass}>
                  <option value="">Tous les véhicules</option>
                  {vehicles
                    .filter((v) => !v.archived)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                </select>
              </ProField>
            ) : null}
            <ProField label="Statut">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={proInputClass}>
                {STATUS_FILTERS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </ProField>
            {hasFilters ? (
              <div className="md:pb-px">
                <ProGhostButton onClick={clearFilters}>Réinitialiser</ProGhostButton>
              </div>
            ) : null}
          </div>
        </ProPanel>

        {fleetToday.length > 0 ? (
          <ProPanel>
            <div className="mb-[17px] border-b border-[var(--pro-border)] pb-4">
              <p className="mb-[5px] text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">Flotte</p>
              <h2 className="text-lg font-bold tracking-[-0.025em] text-[var(--pro-text)] sm:text-[21px]">Véhicules aujourd’hui</h2>
              <p className="mt-1 text-[13px] text-[var(--pro-text-muted)]">Un véhicule est réservé pour toute la journée de sa course confirmée.</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {fleetToday.map(({ v, state, occ }) => (
                <li key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                  <span className="min-w-0 truncate text-sm font-semibold text-[var(--pro-text)]">{v.name}</span>
                  <span
                    className={`shrink-0 text-xs font-bold ${
                      state === "free" ? "text-emerald-600" : state === "booked" ? "text-[var(--pro-accent)]" : "text-red-600"
                    }`}
                  >
                    {state === "free" ? "Disponible" : state === "booked" ? "Réservé" : `Immobilisé · ${BLOCK_REASON_LABELS[occ!.block?.reason ?? "other"]}`}
                  </span>
                </li>
              ))}
            </ul>
            {blockedByVehicle.length > 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-[var(--pro-border-strong)] px-4 py-3 text-[13px] text-[var(--pro-text-muted)]">
                <p className="mb-1 font-semibold text-[var(--pro-text)]">Immobilisations sur la période</p>
                <ul className="space-y-0.5">
                  {blockedByVehicle.map(({ v, days }) => (
                    <li key={v.id}>
                      {v.name} : {days.length} jour{days.length > 1 ? "s" : ""} ({days[0].split("-").reverse().join("/")}
                      {days.length > 1 ? ` → ${days[days.length - 1].split("-").reverse().join("/")}` : ""})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ProPanel>
        ) : null}

        {!loading && !filtered.length ? (
          <EmptyState
            icon="calendar"
            title="Aucune course dans cette sélection"
            message="Modifiez la période ou le statut pour voir d’autres courses."
            actionLabel={hasFilters ? "Réinitialiser les filtres" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        ) : (
          <>
            <AgendaSection
              eyebrow="01 · Immédiat"
              title="Aujourd’hui"
              description="Les courses à préparer aujourd’hui."
              items={todayItems}
              emptyMessage="Aucune course prévue aujourd’hui."
            />
            <AgendaSection
              eyebrow="02 · Prochainement"
              title="Cette semaine"
              description="Les prochains trajets, hors aujourd’hui."
              items={weekItems}
              emptyMessage="Aucune autre course prévue dans les 7 prochains jours."
            />
            {period > 7 ? (
              <AgendaSection
                id="pro-cal-upcoming"
                eyebrow="03 · Plus tard"
                title="À venir"
                description="Les courses prévues après cette semaine."
                items={laterItems}
                emptyMessage="Aucune autre course dans la période sélectionnée."
              />
            ) : null}
          </>
        )}
      </div>
    </ProGuard>
  );
}
