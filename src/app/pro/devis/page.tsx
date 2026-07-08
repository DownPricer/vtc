"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProField, ProPanel, ProSectionHeader, ProShell, ProTable, proInputClass } from "@/components/pro/ProUi";
import {
  formatDateTime,
  formatPrice,
  getDisplayName,
  getJourneySummary,
  isUsefulValue,
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
  createdAt: string;
  flatPayload?: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  paymentStatus?: string | null;
};

const STATUS_FILTERS = [
  { value: "", label: "Tous" },
  { value: "new", label: "Nouveau" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Accepté" },
  { value: "refused", label: "Refusé" },
  { value: "processed", label: "Traité" },
  { value: "archived", label: "Archivé" },
];

export default function ProDevisListPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("kind", "devis");
    if (status) params.set("status", status);
    return params.toString();
  }, [status]);

  useEffect(() => {
    proApi(`/requests?${query}`)
      .then((json) => setRows((json.data as LeadRow[]) || []))
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)));
  }, [query]);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            title="Devis"
            description="Demandes de devis uniquement, avec des actions plus visibles pour ouvrir la fiche ou générer le document PDF."
            action={
              <Link href="/pro/demandes?kind=devis" className="text-sm font-semibold text-[var(--pro-accent)] hover:brightness-110">
                Vue liste classique
              </Link>
            }
          />
          <div className="mt-6 max-w-md">
            <ProField label="Statut">
            <select
              id="devis-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={proInputClass}
            >
              {STATUS_FILTERS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            </ProField>
          </div>
        </ProPanel>

        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <ProPanel className="min-w-0">
          {rows.length ? (
            <>
              <div className="hidden xl:block">
                <ProTable headers={["Date demande", "Client", "Trajet", "Montant", "Statut", "Paiement", "Actions"]}>
                  {rows.map((row) => {
                    const tarif = isUsefulValue(row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif)
                      ? formatPrice((row.pricingResult as Record<string, unknown>).tarif)
                      : "—";
                    const journey = getJourneySummary(row.flatPayload);
                    return (
                      <tr key={row.id} className="bg-[var(--pro-panel)] transition hover:bg-[var(--pro-panel-muted)]">
                        <td className="px-4 py-3 align-top text-[var(--pro-text-muted)]">{formatDateTime(row.createdAt)}</td>
                        <td className="px-4 py-3 align-top font-semibold text-[var(--pro-text)]">{getDisplayName(row.clientName)}</td>
                        <td className="max-w-[360px] px-4 py-3 align-top text-[var(--pro-text-soft)]">
                          <span className="line-clamp-2">{journey || "Trajet non renseigné"}</span>
                        </td>
                        <td className="px-4 py-3 align-top font-semibold text-[var(--pro-text)]">{tarif}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
                            {labelStatus(row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(row.paymentStatus)}`}>
                            {labelLeadPaymentStatus(row.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/pro/demandes/${row.id}`} className="rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-2 text-xs font-semibold text-[var(--pro-text)]">
                              Ouvrir
                            </Link>
                            <Link href={`/pro/demandes/${row.id}/devis`} className="rounded-lg bg-[var(--pro-accent)] px-3 py-2 text-xs font-semibold text-white">
                              Devis PDF
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </ProTable>
              </div>
              <div className="space-y-3 xl:hidden">
                {rows.map((row) => {
                  const tarif = isUsefulValue(row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif)
                    ? formatPrice((row.pricingResult as Record<string, unknown>).tarif)
                    : "";
                  const journey = getJourneySummary(row.flatPayload);
                  return (
                    <div key={row.id} className="flex flex-col gap-4 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(row.clientName)}</p>
                        <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{formatDateTime(row.createdAt)}</p>
                        {journey ? <p className="mt-2 line-clamp-2 text-sm text-[var(--pro-text-soft)]">{journey}</p> : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
                            {labelStatus(row.status)}
                          </span>
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(row.paymentStatus)}`}>
                            {labelLeadPaymentStatus(row.paymentStatus)}
                          </span>
                        </div>
                        {tarif ? <p className="mt-2 text-sm font-semibold text-[var(--pro-accent)]">{tarif}</p> : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link href={`/pro/demandes/${row.id}`} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] hover:bg-[var(--pro-accent-soft)]">
                          Ouvrir
                        </Link>
                        <Link href={`/pro/demandes/${row.id}/devis`} className="rounded-xl bg-[var(--pro-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105">
                          Devis PDF
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
          {!rows.length ? <EmptyState message="Aucun devis pour ce filtre." /> : null}
        </ProPanel>
      </ProShell>
    </ProGuard>
  );
}
