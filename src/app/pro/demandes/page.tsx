"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProActionLink, ProAlert, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
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
import {
  clientOnlinePaymentPreferenceBadgeClass,
  labelClientOnlinePaymentPreference,
} from "@/lib/clientPaymentPreferenceUi";
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

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "new", label: "Nouveau" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Accepte" },
  { value: "refused", label: "Refuse" },
  { value: "processed", label: "Traite" },
  { value: "scheduled", label: "Planifie" },
  { value: "completed", label: "Termine" },
  { value: "cancelled", label: "Annule" },
  { value: "archived", label: "Archive" },
];

function usefulText(value?: string | null): string {
  return isUsefulValue(value) ? String(value).trim() : "";
}

function countByStatus(rows: LeadRow[], status: string): number {
  return rows.filter((row) => row.status === status).length;
}

function countByKind(rows: LeadRow[], kind: string): number {
  return rows.filter((row) => row.kind === kind).length;
}

function RequestListCard({ row }: { row: LeadRow }) {
  const journey = getJourneySummary(row.flatPayload);
  const tarif = isUsefulValue(row.pricingResult && (row.pricingResult as Record<string, unknown>).tarif)
    ? formatPrice((row.pricingResult as Record<string, unknown>).tarif)
    : "";

  return (
    <div className="rounded-[28px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-5 py-5 transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)]">
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_minmax(180px,0.7fr)_auto] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(row.clientName)}</p>
              <p className="mt-1 text-sm text-[var(--pro-text-muted)]">
                {labelKind(row.kind)} · Recu le {formatDateTime(row.createdAt)}
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}>
              {labelStatus(row.status)}
            </span>
          </div>

          {journey ? <p className="mt-4 text-sm leading-6 text-[var(--pro-text-soft)]">{journey}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {usefulText(row.clientPhone) ? (
              <span className="rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-1 text-[var(--pro-text-soft)]">{usefulText(row.clientPhone)}</span>
            ) : null}
            {usefulText(row.clientEmail) ? (
              <span className="rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-1 text-[var(--pro-text-soft)]">{usefulText(row.clientEmail)}</span>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Paiement</p>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(row.paymentStatus)}`}>
            {labelLeadPaymentStatus(row.paymentStatus)}
          </span>
          <div>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${clientOnlinePaymentPreferenceBadgeClass(row.clientWantsOnlinePayment)}`}
            >
              {labelClientOnlinePaymentPreference(row.clientWantsOnlinePayment)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Montant</p>
          <p className="text-lg font-semibold text-[var(--pro-accent)]">{tarif || "Aucun montant"}</p>
          {row.scheduledStart ? <p className="text-sm text-[var(--pro-text-soft)]">Prevu : {formatDateTime(row.scheduledStart)}</p> : null}
        </div>

        <div className="flex items-center xl:justify-end">
          <Link
            href={`/pro/demandes/${row.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--pro-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_srgb,var(--pro-accent)_88%,black_12%)]"
          >
            Ouvrir
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProDemandesPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
    setLoading(true);
    proApi(`/requests${query ? `?${query}` : ""}`)
      .then((json) => {
        setRows((json.data as LeadRow[]) || []);
        setError("");
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, [query, refreshKey]);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            title="Demandes"
            description="Liste operationnelle des contacts, devis et reservations avec filtres, priorites visibles et ouverture rapide des fiches."
            action={<ProActionLink href="/pro/dashboard">Retour au tableau de bord</ProActionLink>}
          />

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-5">
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Total</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--pro-text)]">{rows.length}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Nouveaux</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--pro-text)]">{countByStatus(rows, "new")}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">En attente</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--pro-text)]">{countByStatus(rows, "pending")}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Reservations</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--pro-text)]">{countByKind(rows, "reservation")}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Devis</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--pro-text)]">{countByKind(rows, "devis")}</p>
            </div>
          </div>
        </ProPanel>

        <ProPanel>
          <ProSectionHeader
            eyebrow="Filtres"
            title="Trouver la bonne demande"
            description="Recherchez par client, telephone ou e-mail, puis filtrez par type ou statut."
            action={
              <button
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
              >
                Rafraichir
              </button>
            }
          />

          <div className="mt-6 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, e-mail ou telephone"
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none xl:col-span-5"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none xl:col-span-3"
            >
              <option value="">Tous les types</option>
              <option value="contact">Contact</option>
              <option value="devis">Devis</option>
              <option value="reservation">Reservation</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none xl:col-span-4"
            >
              {STATUS_FILTERS.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </ProPanel>

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}
        {loading ? <ProAlert tone="info">Chargement des demandes...</ProAlert> : null}

        <ProPanel>
          <ProSectionHeader
            title="Liste des demandes"
            description="Vue large et lisible pour parcourir les dossiers sans tableau serre ni informations techniques inutiles."
          />

          <div className="mt-6 space-y-4">
            {rows.map((row) => (
              <RequestListCard key={row.id} row={row} />
            ))}
            {!rows.length && !loading ? <EmptyState message="Aucune demande ne correspond a ces filtres." /> : null}
          </div>
        </ProPanel>
      </ProShell>
    </ProGuard>
  );
}
