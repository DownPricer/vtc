"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProField, ProPanel, ProSectionHeader, ProTable, proInputClass } from "@/components/pro/ProUi";
import { formatDateTime, formatPrice, getDisplayName, getJourneySummary, isUsefulValue, labelStatus, mapApiErrorToFr, statusBadgeClass } from "@/components/pro/proDisplay";
import { proApi } from "@/lib/proApi";

type ReservationRow = {
  id: string;
  status: string;
  clientName: string;
  createdAt: string;
  scheduledStart?: string | null;
  flatPayload?: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
};

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "new", label: "Nouveau" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Accepté" },
  { value: "scheduled", label: "Planifié" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
  { value: "archived", label: "Archivé" },
];

export default function ProReservationsPage() {
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("kind", "reservation");
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return params.toString();
  }, [status, q]);

  useEffect(() => {
    setLoading(true);
    proApi(`/requests?${query}`)
      .then((json) => {
        setRows((json.data as ReservationRow[]) || []);
        setError("");
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <ProGuard>
      <ProPanel>
        <ProSectionHeader
          title="Réservations"
          description="Courses acceptées/confirmées, à venir et historique. (Affichage dédié réservations, sans redirection.)"
        />

        <div className="mt-6 grid grid-cols-1 gap-3 xl:grid-cols-12">
          <ProField label="Recherche" className="xl:col-span-6">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client, trajet, téléphone, e-mail…" className={proInputClass} />
          </ProField>
          <ProField label="Statut" className="xl:col-span-4">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={proInputClass}>
              {STATUS_FILTERS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </ProField>
          <div className="xl:col-span-2 flex items-end">
            <div className="text-xs text-[var(--pro-text-muted)]">Total : <span className="font-semibold text-[var(--pro-text)]">{rows.length}</span></div>
          </div>
        </div>
      </ProPanel>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">Chargement…</p> : null}

      <ProPanel className="min-w-0">
        {rows.length ? (
          <>
            <div className="hidden xl:block">
              <ProTable headers={["Créée", "Date course", "Client", "Trajet", "Montant", "Statut", "Action"]}>
                {rows.map((row) => {
                  const journey = getJourneySummary(row.flatPayload);
                  const tarif = isUsefulValue(row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif)
                    ? formatPrice((row.pricingResult as Record<string, unknown>).tarif)
                    : "—";
                  return (
                    <tr key={row.id} className="bg-[var(--pro-panel)] transition hover:bg-[var(--pro-panel-muted)]">
                      <td className="px-4 py-3 align-top text-[var(--pro-text-muted)]">{formatDateTime(row.createdAt)}</td>
                      <td className="px-4 py-3 align-top text-[var(--pro-text-muted)]">{row.scheduledStart ? formatDateTime(row.scheduledStart) : "—"}</td>
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
                        <Link href={`/pro/demandes/${row.id}`} className="inline-flex rounded-lg bg-[var(--pro-accent)] px-3 py-2 text-xs font-semibold text-white">
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </ProTable>
            </div>

            <div className="space-y-3 xl:hidden">
              {rows.map((row) => (
                <div key={row.id} className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(row.clientName)}</p>
                      <p className="mt-1 text-sm text-[var(--pro-text-muted)]">
                        Course : {row.scheduledStart ? formatDateTime(row.scheduledStart) : "—"}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
                      {labelStatus(row.status)}
                    </span>
                  </div>
                  {getJourneySummary(row.flatPayload) ? <p className="mt-3 text-sm text-[var(--pro-text-soft)]">{getJourneySummary(row.flatPayload)}</p> : null}
                  <div className="mt-4 flex items-center justify-between">
                    <Link href={`/pro/demandes/${row.id}`} className="text-sm font-semibold text-[var(--pro-accent)]">
                      Ouvrir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {!rows.length && !loading ? <EmptyState message="Aucune réservation pour ce filtre." /> : null}
      </ProPanel>
    </ProGuard>
  );
}
