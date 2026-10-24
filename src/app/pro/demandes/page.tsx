"use client";

import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProActionLink, ProAlert, ProField, ProPageHead, ProTable, proInputClass, proTdClass, proTrClass } from "@/components/pro/ProUi";
import {
  ProGhostButton,
  ProFilterPanel,
  ProOpenLink,
  ProPagination,
  ProRequestCard,
  ProResultsPanel,
  ProSearchInput,
  ProSummaryCard,
  ProSummaryGrid,
  formatShortDateTime,
  paginate,
  searchNormalize,
} from "@/components/pro/ProListUi";
import {
  formatPrice,
  getDisplayName,
  getJourneySummary,
  isUsefulValue,
  labelKind,
  labelStatus,
  mapApiErrorToFr,
  statusBadgeClass,
} from "@/components/pro/proDisplay";
import { labelLeadPaymentStatus, leadPaymentStatusBadgeClass } from "@/lib/leadPaymentStatusUi";
import { proApi } from "@/lib/proApi";

type LeadRow = {
  id: string;
  kind: "contact" | "devis" | "reservation";
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  createdAt: string;
  scheduledStart?: string | null;
  flatPayload?: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  paymentStatus?: string | null;
  clientWantsOnlinePayment?: boolean | null;
};

const PER_PAGE = 6;

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "new", label: "Nouveau" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Accepté" },
  { value: "refused", label: "Refusé" },
  { value: "processed", label: "Traité" },
  { value: "scheduled", label: "Planifié" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
  { value: "archived", label: "Archivé" },
];

type SummaryKey = "all" | "new" | "pending" | "booking" | "quote";

function usefulText(value?: string | null): string {
  return isUsefulValue(value) ? String(value).trim() : "";
}

function tarifOf(row: LeadRow): string {
  const raw = row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif;
  return isUsefulValue(raw) ? formatPrice(raw) : "";
}

function Badge({ className, children }: { className: string; children: string }) {
  return <span className={className}>{children}</span>;
}

export default function ProDemandesPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentKind = params.get("kind");
    const currentStatus = params.get("status");
    if (currentKind === "contact" || currentKind === "devis" || currentKind === "reservation") setKind(currentKind);
    if (currentStatus) setStatus(currentStatus);
  }, []);

  useEffect(() => {
    setLoading(true);
    proApi("/requests")
      .then((json) => {
        setRows((json.data as LeadRow[]) || []);
        setError("");
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const sorted = useMemo(
    () => rows.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rows]
  );

  const counts = useMemo(
    () => ({
      all: rows.length,
      new: rows.filter((r) => r.status === "new").length,
      pending: rows.filter((r) => r.status === "pending").length,
      booking: rows.filter((r) => r.kind === "reservation").length,
      quote: rows.filter((r) => r.kind === "devis").length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    const query = searchNormalize(q.trim());
    return sorted.filter((row) => {
      const searchable = [row.id, row.clientName, row.clientEmail, row.clientPhone, getJourneySummary(row.flatPayload)].map(searchNormalize).join(" ");
      return (!query || searchable.includes(query)) && (!kind || row.kind === kind) && (!status || row.status === status);
    });
  }, [sorted, q, kind, status]);

  const { pageItems, page: currentPage, pages } = paginate(filtered, page, PER_PAGE);

  const selected: SummaryKey | "" = q.trim()
    ? ""
    : kind === "reservation" && !status
      ? "booking"
      : kind === "devis" && !status
        ? "quote"
        : !kind && status === "new"
          ? "new"
          : !kind && status === "pending"
            ? "pending"
            : !kind && !status
              ? "all"
              : "";

  function applySummary(key: SummaryKey) {
    setQ("");
    setKind(key === "booking" ? "reservation" : key === "quote" ? "devis" : "");
    setStatus(key === "new" ? "new" : key === "pending" ? "pending" : "");
    setPage(1);
  }

  function clearFilters() {
    setQ("");
    setKind("");
    setStatus("");
    setPage(1);
  }

  const hasFilters = !!q.trim() || !!kind || !!status;
  const countLabel = `${filtered.length} dossier${filtered.length > 1 ? "s" : ""} affiché${filtered.length > 1 ? "s" : ""} sur ${rows.length}`;

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Gestion des dossiers"
          title="Demandes"
          description="Retrouvez les demandes, les devis et les réservations au même endroit."
          action={
            <div className="flex flex-wrap gap-2">
              <ProGhostButton onClick={() => setRefreshKey((value) => value + 1)}>Rafraîchir</ProGhostButton>
              <ProActionLink href="/pro/dashboard">Tableau de bord</ProActionLink>
            </div>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <ProSummaryGrid>
          <ProSummaryCard label="Total" value={counts.all} hint="Tous les dossiers" selected={selected === "all"} onClick={() => applySummary("all")} />
          <ProSummaryCard label="Nouvelles" value={counts.new} hint="À consulter" selected={selected === "new"} onClick={() => applySummary("new")} />
          <ProSummaryCard label="En attente" value={counts.pending} hint="À suivre" selected={selected === "pending"} onClick={() => applySummary("pending")} />
          <ProSummaryCard label="Réservations" value={counts.booking} hint="Courses demandées" selected={selected === "booking"} onClick={() => applySummary("booking")} />
          <ProSummaryCard label="Devis" value={counts.quote} hint="À chiffrer ou envoyés" selected={selected === "quote"} onClick={() => applySummary("quote")} />
        </ProSummaryGrid>

        <ProFilterPanel
          title="Trouver une demande"
          description="Recherchez un client ou un trajet, puis affinez les résultats."
          active={hasFilters}
          onReset={clearFilters}
        >
          <ProSearchInput
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Nom, e-mail, téléphone ou trajet"
          />
          <ProField label="Type">
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setPage(1);
              }}
              className={proInputClass}
            >
              <option value="">Tous les types</option>
              <option value="reservation">Réservation</option>
              <option value="devis">Devis</option>
              <option value="contact">Contact</option>
            </select>
          </ProField>
          <ProField label="Statut">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={proInputClass}
            >
              {STATUS_FILTERS.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </ProField>
        </ProFilterPanel>

        <ProResultsPanel title="Liste des demandes" count={loading ? "Chargement des demandes…" : countLabel} side={<span className="hidden md:inline">Plus récentes en premier</span>}>
          {pageItems.length ? (
            <>
              <div className="hidden xl:block">
                <ProTable
                  minWidth={1080}
                  headers={["Demande", "Client", "Type", "Trajet", "Date course", "Montant", "Statut", "Paiement", <span key="a" className="sr-only">Action</span>]}
                >
                  {pageItems.map((row) => (
                    <tr key={row.id} className={proTrClass}>
                      <td className={`${proTdClass} whitespace-nowrap`}>{formatShortDateTime(row.createdAt)}</td>
                      <td className={proTdClass}>
                        <strong className="block font-bold">{getDisplayName(row.clientName)}</strong>
                        <small className="mt-[3px] block break-words text-xs text-[var(--pro-text-muted)]">
                          {usefulText(row.clientEmail) || usefulText(row.clientPhone) || "Coordonnées non renseignées"}
                        </small>
                      </td>
                      <td className={proTdClass}>{labelKind(row.kind)}</td>
                      <td className={`${proTdClass} max-w-[260px]`}>
                        <span className="line-clamp-2">{getJourneySummary(row.flatPayload) || "Trajet non renseigné"}</span>
                      </td>
                      <td className={`${proTdClass} whitespace-nowrap`}>{formatShortDateTime(row.scheduledStart)}</td>
                      <td className={`${proTdClass} whitespace-nowrap font-bold tabular-nums`}>{tarifOf(row) || "—"}</td>
                      <td className={proTdClass}>
                        <Badge className={statusBadgeClass(row.status)}>{labelStatus(row.status)}</Badge>
                      </td>
                      <td className={proTdClass}>
                        <Badge className={leadPaymentStatusBadgeClass(row.paymentStatus)}>{labelLeadPaymentStatus(row.paymentStatus)}</Badge>
                      </td>
                      <td className={proTdClass}>
                        <ProOpenLink href={`/pro/demandes/${row.id}`} label={`Ouvrir la demande de ${getDisplayName(row.clientName)}`} />
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
                    badge={<Badge className={statusBadgeClass(row.status)}>{labelStatus(row.status)}</Badge>}
                    route={getJourneySummary(row.flatPayload) || "Trajet à préciser"}
                    meta={[labelKind(row.kind), formatShortDateTime(row.scheduledStart || row.createdAt, false), labelLeadPaymentStatus(row.paymentStatus)]}
                    amount={tarifOf(row)}
                    actions={<ProOpenLink href={`/pro/demandes/${row.id}`} />}
                  />
                ))}
              </div>

              <ProPagination page={currentPage} pages={pages} onPage={setPage} />
            </>
          ) : loading ? null : (
            <EmptyState
              icon="search"
              title="Aucune demande trouvée"
              message={hasFilters ? "Essayez un autre terme ou retirez un filtre." : "Les nouvelles demandes apparaîtront ici."}
              actionLabel={hasFilters ? "Effacer les filtres" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          )}
        </ProResultsPanel>
      </div>
    </ProGuard>
  );
}
