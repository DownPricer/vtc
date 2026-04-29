"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import {
  formatDateTime,
  formatPrice,
  getDisplayName,
  getJourneySummary,
  isUsefulValue,
  labelKind,
  labelStatus,
  mapApiErrorToFr,
  statusBadgeClass,
} from "@/components/pro/proDisplay";
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
};

const STATUS_FILTERS = [
  { value: "", label: "Toutes" },
  { value: "new", label: "Nouveaux" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Acceptées" },
  { value: "refused", label: "Refusées" },
  { value: "processed", label: "Traitées" },
  { value: "scheduled", label: "Planifiées" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
  { value: "archived", label: "Archivées" },
];

function usefulText(value?: string | null): string {
  return isUsefulValue(value) ? String(value).trim() : "";
}

export default function ProDemandesPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const currentKind = params.get("kind");
    const currentStatus = params.get("status");
    if (currentKind === "contact" || currentKind === "devis" || currentKind === "reservation") setKind(currentKind);
    if (currentStatus) setStatus(currentStatus);
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return params.toString();
  }, [kind, status, q]);

  useEffect(() => {
    proApi(`/requests${query ? `?${query}` : ""}`)
      .then((json) => setRows((json.data as LeadRow[]) || []))
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)));
  }, [query]);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            title="Demandes"
            description="Filtrez vos contacts, devis et réservations puis ouvrez chaque fiche pour agir rapidement."
          />

          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-12">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par nom, e-mail ou téléphone"
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 lg:col-span-5"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 lg:col-span-3"
            >
              <option value="">Toutes</option>
              <option value="contact">Contacts</option>
              <option value="devis">Devis</option>
              <option value="reservation">Réservations</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 lg:col-span-4"
            >
              {STATUS_FILTERS.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </ProPanel>

        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <ProPanel className="hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--pro-border)] text-xs uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">
                <tr>
                  <th className="px-4 py-4 font-semibold">Date</th>
                  <th className="px-4 py-4 font-semibold">Type</th>
                  <th className="px-4 py-4 font-semibold">Client</th>
                  <th className="px-4 py-4 font-semibold">Statut</th>
                  <th className="px-4 py-4 font-semibold">Tarif</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const journey = getJourneySummary(row.flatPayload);
                  const tarif = isUsefulValue(row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif)
                    ? formatPrice((row.pricingResult as Record<string, unknown>).tarif)
                    : "";
                  return (
                    <tr key={row.id} className="border-b border-[var(--pro-border)]/70 last:border-b-0">
                      <td className="px-4 py-4 align-top">
                        <p className="text-[var(--pro-text-muted)]">{formatDateTime(row.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-[var(--pro-text)]">{labelKind(row.kind)}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(row.clientName)}</p>
                        {usefulText(row.clientPhone) ? <p className="mt-1 text-[var(--pro-text-soft)]">{usefulText(row.clientPhone)}</p> : null}
                        {usefulText(row.clientEmail) ? <p className="text-[var(--pro-text-muted)]">{usefulText(row.clientEmail)}</p> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
                          {labelStatus(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {tarif ? <p className="font-semibold text-[var(--pro-accent)]">{tarif}</p> : <span className="text-[var(--pro-text-muted)]">—</span>}
                        {journey ? <p className="mt-1 text-xs text-[var(--pro-text-muted)]">{journey}</p> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Link href={`/pro/demandes/${row.id}`} className="font-semibold text-[var(--pro-accent)] hover:brightness-110">
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length ? <EmptyState message="Aucune demande ne correspond à ces filtres." /> : null}
          </div>
        </ProPanel>

        <div className="space-y-3 md:hidden">
          {rows.map((row) => {
            const tarif = isUsefulValue(row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif)
              ? formatPrice((row.pricingResult as Record<string, unknown>).tarif)
              : "";
            return (
              <ProPanel key={row.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(row.clientName)}</p>
                    <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{labelKind(row.kind)}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
                    {labelStatus(row.status)}
                  </span>
                </div>
                {usefulText(row.clientPhone) ? <p className="mt-3 text-sm text-[var(--pro-text-soft)]">{usefulText(row.clientPhone)}</p> : null}
                {usefulText(row.clientEmail) ? <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{usefulText(row.clientEmail)}</p> : null}
                <p className="mt-3 text-sm text-[var(--pro-text-muted)]">Création : {formatDateTime(row.createdAt)}</p>
                {formatDateTime(row.scheduledStart) ? <p className="mt-1 text-sm text-[var(--pro-text-soft)]">Prévue : {formatDateTime(row.scheduledStart)}</p> : null}
                {getJourneySummary(row.flatPayload) ? <p className="mt-2 text-sm text-[var(--pro-text-soft)]">{getJourneySummary(row.flatPayload)}</p> : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[var(--pro-accent)]">{tarif}</span>
                  <Link href={`/pro/demandes/${row.id}`} className="text-sm font-semibold text-[var(--pro-accent)]">
                    Ouvrir
                  </Link>
                </div>
              </ProPanel>
            );
          })}
          {!rows.length ? <EmptyState message="Aucune demande." /> : null}
        </div>
      </ProShell>
    </ProGuard>
  );
}
