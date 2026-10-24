"use client";

import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProActionLink, ProAlert, ProField, ProPageHead, ProPanel, ProTable, proInputClass, proTdClass, proTrClass } from "@/components/pro/ProUi";
import {
  ProGhostButton,
  ProOpenLink,
  ProPagination,
  ProRequestCard,
  ProResultsPanel,
  ProSearchInput,
  ProTabs,
  formatShortDateTime,
  paginate,
  searchNormalize,
} from "@/components/pro/ProListUi";
import { formatPrice, getDisplayName, getJourneySummary, isUsefulValue, labelStatus, mapApiErrorToFr, statusBadgeClass } from "@/components/pro/proDisplay";
import { proApi } from "@/lib/proApi";

type ReservationRow = {
  id: string;
  status: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt: string;
  scheduledStart?: string | null;
  flatPayload?: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
};

type View = "upcoming" | "history" | "all";

const PER_PAGE = 5;
const CLOSED_STATUSES = new Set(["completed", "cancelled", "refused", "archived"]);

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "new", label: "Nouveau" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Accepté" },
  { value: "scheduled", label: "Planifié" },
  { value: "completed", label: "Terminé" },
  { value: "cancellation_requested", label: "Annulation demandée" },
  { value: "cancelled", label: "Annulé" },
  { value: "refused", label: "Refusé" },
  { value: "archived", label: "Archivé" },
];

const VIEW_TITLES: Record<View, string> = {
  upcoming: "Courses à venir",
  history: "Historique des courses",
  all: "Toutes les réservations",
};

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function time(value?: string | null): number {
  if (!value) return Number.NaN;
  return new Date(value).getTime();
}

function tarifOf(row: ReservationRow): string {
  const raw = row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif;
  return isUsefulValue(raw) ? formatPrice(raw) : "";
}

export default function ProReservationsPage() {
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [view, setView] = useState<View>("upcoming");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    proApi("/requests?kind=reservation")
      .then((json) => setRows((json.data as ReservationRow[]) || []))
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => startOfToday(), []);
  const isUpcoming = (row: ReservationRow) => !CLOSED_STATUSES.has(row.status) && time(row.scheduledStart) >= today;

  const counts = useMemo(() => {
    const upcoming = rows.filter((row) => !CLOSED_STATUSES.has(row.status) && time(row.scheduledStart) >= today).length;
    return { upcoming, history: rows.length - upcoming, all: rows.length };
  }, [rows, today]);

  const filtered = useMemo(() => {
    const query = searchNormalize(q.trim());
    const result = rows.filter((row) => {
      const upcoming = !CLOSED_STATUSES.has(row.status) && time(row.scheduledStart) >= today;
      const inView = view === "all" || (view === "upcoming" ? upcoming : !upcoming);
      const searchable = [row.id, row.clientName, row.clientEmail, row.clientPhone, getJourneySummary(row.flatPayload)].map(searchNormalize).join(" ");
      return inView && (!query || searchable.includes(query)) && (!status || row.status === status);
    });
    const byCreated = (a: ReservationRow, b: ReservationRow) => time(b.createdAt) - time(a.createdAt);
    return result.sort((a, b) =>
      view === "upcoming" ? time(a.scheduledStart) - time(b.scheduledStart) : view === "history" ? time(b.scheduledStart) - time(a.scheduledStart) : byCreated(a, b)
    );
  }, [rows, view, q, status, today]);

  const { pageItems, page: currentPage, pages } = paginate(filtered, page, PER_PAGE);
  const hasFilters = !!q.trim() || !!status;

  function clearFilters() {
    setQ("");
    setStatus("");
    setPage(1);
  }

  const countLabel = `${filtered.length} réservation${filtered.length > 1 ? "s" : ""} affichée${filtered.length > 1 ? "s" : ""}`;

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Suivi des courses"
          title="Réservations"
          description="Préparez les trajets à venir et retrouvez les courses terminées."
          action={
            <ProActionLink href="/pro/calendrier" withArrow>
              Ouvrir le calendrier
            </ProActionLink>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <ProPanel>
          <div className="mb-[19px] flex flex-col items-start justify-between gap-[15px] sm:flex-row sm:items-end">
            <div>
              <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">Vue des réservations</p>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-[var(--pro-text)]">Choisir les courses à afficher</h2>
            </div>
            <span className="whitespace-nowrap text-[13px] text-[var(--pro-text-muted)]">
              {counts.all} réservation{counts.all > 1 ? "s" : ""} au total
            </span>
          </div>

          <ProTabs<View>
            label="Période des réservations"
            value={view}
            onChange={(next) => {
              setView(next);
              setPage(1);
            }}
            tabs={[
              { key: "upcoming", label: "À venir", count: counts.upcoming },
              { key: "history", label: "Historique", count: counts.history },
              { key: "all", label: "Toutes", count: counts.all },
            ]}
          />

          <div className="grid items-end gap-[15px] md:grid-cols-[minmax(280px,1.7fr)_minmax(190px,1fr)_auto]">
            <ProSearchInput
              value={q}
              onChange={(value) => {
                setQ(value);
                setPage(1);
              }}
              placeholder="Client, trajet, téléphone ou e-mail"
            />
            <ProField label="Statut">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className={proInputClass}
              >
                {STATUS_FILTERS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </ProField>
            {hasFilters ? (
              <div className="md:pb-px">
                <ProGhostButton onClick={clearFilters}>Effacer les filtres</ProGhostButton>
              </div>
            ) : null}
          </div>
        </ProPanel>

        <ProResultsPanel
          title={VIEW_TITLES[view]}
          count={loading ? "Chargement des réservations…" : countLabel}
          side={<span className="hidden md:inline">{view === "all" ? "Plus récentes en premier" : "Par date de course"}</span>}
        >
          {pageItems.length ? (
            <>
              <div className="hidden xl:block">
                <ProTable minWidth={970} headers={["Créée", "Date course", "Client", "Trajet", "Montant", "Statut", <span key="a" className="sr-only">Action</span>]}>
                  {pageItems.map((row) => (
                    <tr key={row.id} className={proTrClass}>
                      <td className={`${proTdClass} whitespace-nowrap`}>{formatShortDateTime(row.createdAt)}</td>
                      <td className={`${proTdClass} whitespace-nowrap`}>{formatShortDateTime(row.scheduledStart)}</td>
                      <td className={proTdClass}>
                        <strong className="block font-bold">{getDisplayName(row.clientName)}</strong>
                        {row.clientEmail ? <small className="mt-[3px] block break-words text-xs text-[var(--pro-text-muted)]">{row.clientEmail}</small> : null}
                      </td>
                      <td className={`${proTdClass} max-w-[280px]`}>
                        <span className="line-clamp-2">{getJourneySummary(row.flatPayload) || "Trajet non renseigné"}</span>
                      </td>
                      <td className={`${proTdClass} whitespace-nowrap font-bold tabular-nums`}>{tarifOf(row) || "—"}</td>
                      <td className={proTdClass}>
                        <span className={statusBadgeClass(row.status)}>{labelStatus(row.status)}</span>
                      </td>
                      <td className={proTdClass}>
                        <ProOpenLink href={`/pro/demandes/${row.id}`} label={`Ouvrir la réservation de ${getDisplayName(row.clientName)}`} />
                      </td>
                    </tr>
                  ))}
                </ProTable>
              </div>

              <div className="grid gap-2.5 xl:hidden">
                {pageItems.map((row) => (
                  <ProRequestCard
                    key={row.id}
                    name={getDisplayName(row.clientName)}
                    badge={<span className={statusBadgeClass(row.status)}>{labelStatus(row.status)}</span>}
                    route={getJourneySummary(row.flatPayload) || "Trajet à préciser"}
                    meta={[formatShortDateTime(row.scheduledStart), isUpcoming(row) ? "À venir" : "Passée"]}
                    amount={tarifOf(row)}
                    actions={<ProOpenLink href={`/pro/demandes/${row.id}`} />}
                  />
                ))}
              </div>

              <ProPagination page={currentPage} pages={pages} onPage={setPage} />
            </>
          ) : loading ? null : (
            <EmptyState
              icon="calendar"
              title="Aucune réservation trouvée"
              message="Essayez un autre terme, changez de statut ou consultez une autre période."
              actionLabel={hasFilters ? "Effacer les filtres" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          )}
        </ProResultsPanel>
      </div>
    </ProGuard>
  );
}
