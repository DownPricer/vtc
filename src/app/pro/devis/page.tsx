"use client";

import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProActionLink, ProAlert, ProField, ProPageHead, ProTable, proInputClass, proTdClass, proTrClass } from "@/components/pro/ProUi";
import {
  ProFilterPanel,
  ProGhostButton,
  ProOpenLink,
  ProPagination,
  ProRequestCard,
  ProResultsPanel,
  ProSearchInput,
  ProSecondaryLink,
  ProSummaryCard,
  ProSummaryGrid,
  formatShortDateTime,
  paginate,
  searchNormalize,
} from "@/components/pro/ProListUi";
import { formatPrice, getDisplayName, getJourneySummary, isUsefulValue, labelStatus, mapApiErrorToFr, statusBadgeClass } from "@/components/pro/proDisplay";
import { labelLeadPaymentStatus, leadPaymentStatusBadgeClass } from "@/lib/leadPaymentStatusUi";
import { proApi } from "@/lib/proApi";

type LeadRow = {
  id: string;
  kind: "contact" | "devis" | "reservation";
  status: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt: string;
  flatPayload?: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  paymentStatus?: string | null;
};

const PER_PAGE = 5;
const TODO_STATUSES = ["new", "pending"];

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "todo", label: "À traiter" },
  { value: "new", label: "Nouveau" },
  { value: "pending", label: "En attente" },
  { value: "processed", label: "Traité" },
  { value: "accepted", label: "Accepté" },
  { value: "refused", label: "Refusé" },
  { value: "archived", label: "Archivé" },
];

function tarifOf(row: LeadRow): string {
  const raw = row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif;
  return isUsefulValue(raw) ? formatPrice(raw) : "";
}

function QuoteActions({ row }: { row: LeadRow }) {
  const name = getDisplayName(row.clientName);
  return (
    <div className="flex items-center gap-[7px] whitespace-nowrap">
      <ProSecondaryLink href={`/pro/demandes/${row.id}`} label={`Ouvrir le devis de ${name}`}>
        Ouvrir
      </ProSecondaryLink>
      <ProOpenLink href={`/pro/demandes/${row.id}/devis`} label={`Devis PDF de ${name}`}>
        Devis PDF
      </ProOpenLink>
    </div>
  );
}

export default function ProDevisListPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [compact, setCompact] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    proApi("/requests?kind=devis")
      .then((json) => setRows((json.data as LeadRow[]) || []))
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(
    () => rows.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rows]
  );

  const counts = useMemo(
    () => ({
      all: rows.length,
      todo: rows.filter((r) => TODO_STATUSES.includes(r.status)).length,
      done: rows.filter((r) => r.status === "processed").length,
      accepted: rows.filter((r) => r.status === "accepted").length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    const query = searchNormalize(q.trim());
    return sorted.filter((row) => {
      const searchable = [row.id, row.clientName, row.clientEmail, row.clientPhone, getJourneySummary(row.flatPayload)].map(searchNormalize).join(" ");
      const statusMatches = !status || (status === "todo" ? TODO_STATUSES.includes(row.status) : row.status === status);
      return (!query || searchable.includes(query)) && statusMatches;
    });
  }, [sorted, q, status]);

  const { pageItems, page: currentPage, pages } = paginate(filtered, page, PER_PAGE);
  const selected = q.trim() ? "" : ({ "": "all", todo: "todo", processed: "done", accepted: "accepted" } as Record<string, string>)[status] ?? "";

  function applySummary(key: "all" | "todo" | "done" | "accepted") {
    setQ("");
    setStatus(({ all: "", todo: "todo", done: "processed", accepted: "accepted" } as const)[key]);
    setPage(1);
  }

  function clearFilters() {
    setQ("");
    setStatus("");
    setPage(1);
  }

  const hasFilters = !!q.trim() || !!status;
  const countLabel = `${filtered.length} devis affiché${filtered.length > 1 ? "s" : ""} sur ${rows.length}`;
  const cellPad = compact ? "!py-2" : "";

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Gestion des dossiers"
          title="Devis"
          description="Retrouvez vos demandes de devis et ouvrez chaque dossier en un clic."
          action={
            <ProActionLink href="/pro/demandes" withArrow>
              Toutes les demandes
            </ProActionLink>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <ProSummaryGrid columns={4}>
          <ProSummaryCard label="Tous les devis" value={counts.all} hint="Dossiers enregistrés" selected={selected === "all"} onClick={() => applySummary("all")} />
          <ProSummaryCard label="À traiter" value={counts.todo} hint="Nouveaux ou en attente" selected={selected === "todo"} onClick={() => applySummary("todo")} />
          <ProSummaryCard label="Traités" value={counts.done} hint="Devis préparés" selected={selected === "done"} onClick={() => applySummary("done")} />
          <ProSummaryCard label="Acceptés" value={counts.accepted} hint="Clients confirmés" selected={selected === "accepted"} onClick={() => applySummary("accepted")} />
        </ProSummaryGrid>

        <ProFilterPanel
          title="Trouver un devis"
          description="Recherchez par client, numéro de dossier ou trajet."
          active={hasFilters}
          onReset={clearFilters}
          gridClassName="grid gap-4 md:grid-cols-[minmax(280px,1.7fr)_minmax(220px,1fr)]"
        >
          <ProSearchInput
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Client, numéro ou trajet"
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
        </ProFilterPanel>

        <ProResultsPanel
          title="Liste des devis"
          count={loading ? "Chargement des devis…" : countLabel}
          side={
            <ProGhostButton onClick={() => setCompact((value) => !value)}>{compact ? "Vue détaillée" : "Vue compacte"}</ProGhostButton>
          }
        >
          {pageItems.length ? (
            <>
              <div className="hidden xl:block">
                <ProTable minWidth={900} headers={["Demande", "Client", "Trajet", "Montant", "Statut", "Paiement", "Actions"]}>
                  {pageItems.map((row) => (
                    <tr key={row.id} className={proTrClass}>
                      <td className={`${proTdClass} ${cellPad} whitespace-nowrap`}>{formatShortDateTime(row.createdAt)}</td>
                      <td className={`${proTdClass} ${cellPad}`}>
                        <strong className="block font-bold">{getDisplayName(row.clientName)}</strong>
                        {!compact && row.clientEmail ? <small className="mt-[3px] block break-words text-xs text-[var(--pro-text-muted)]">{row.clientEmail}</small> : null}
                      </td>
                      <td className={`${proTdClass} ${cellPad} max-w-[300px]`}>
                        <span className="line-clamp-2">{getJourneySummary(row.flatPayload) || "Trajet non renseigné"}</span>
                      </td>
                      <td className={`${proTdClass} ${cellPad} whitespace-nowrap font-bold tabular-nums`}>{tarifOf(row) || "—"}</td>
                      <td className={`${proTdClass} ${cellPad}`}>
                        <span className={statusBadgeClass(row.status)}>{labelStatus(row.status)}</span>
                      </td>
                      <td className={`${proTdClass} ${cellPad}`}>
                        <span className={leadPaymentStatusBadgeClass(row.paymentStatus)}>{labelLeadPaymentStatus(row.paymentStatus)}</span>
                      </td>
                      <td className={`${proTdClass} ${cellPad}`}>
                        <QuoteActions row={row} />
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
                    meta={compact ? undefined : [formatShortDateTime(row.createdAt, false), labelLeadPaymentStatus(row.paymentStatus)]}
                    amount={tarifOf(row)}
                    actions={<QuoteActions row={row} />}
                  />
                ))}
              </div>

              <ProPagination page={currentPage} pages={pages} onPage={setPage} />
            </>
          ) : loading ? null : (
            <EmptyState
              icon="search"
              title="Aucun devis trouvé"
              message={hasFilters ? "Essayez un autre terme ou retirez le filtre." : "Les demandes de devis apparaîtront ici."}
              actionLabel={hasFilters ? "Effacer les filtres" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          )}
        </ProResultsPanel>
      </div>
    </ProGuard>
  );
}
