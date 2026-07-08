"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProActionLink, ProAlert, ProPanel, ProSectionHeader, ProShell, ProStatCard, ProTable } from "@/components/pro/ProUi";
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
  createdAt: string;
  scheduledStart?: string | null;
  flatPayload?: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
};

type Summary = {
  pendingCount: number;
  acceptedToday: number;
  upcomingReservationCount: number;
  recentDevisWeekCount: number;
  stripePaymentsPendingCount: number;
};

const DASHBOARD_EXCLUDED = new Set(["archived", "completed", "cancelled", "refused", "expired"]);

function tarifValue(item: LeadRow): string {
  const raw = item.pricingResult && (item.pricingResult as Record<string, unknown>).tarif;
  return isUsefulValue(raw) ? formatPrice(raw) : "";
}

function RequestCard({ item, compact = false }: { item: LeadRow; compact?: boolean }) {
  const journey = getJourneySummary(item.flatPayload);
  const tarif = tarifValue(item);

  return (
    <Link
      href={`/pro/demandes/${item.id}`}
      className={`block rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)] ${
        compact ? "px-4 py-4" : "px-5 py-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
          <p className="mt-1 text-sm text-[var(--pro-text-muted)]">
            {labelKind(item.kind)} · {formatDateTime(item.createdAt)}
          </p>
        </div>
        <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
          {labelStatus(item.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--pro-text-soft)]">
        {journey ? <span className="min-w-0 flex-1">{journey}</span> : null}
        {tarif ? <span className="font-semibold text-[var(--pro-accent)]">{tarif}</span> : null}
        <span className="font-semibold text-[var(--pro-accent)]">Ouvrir</span>
      </div>
    </Link>
  );
}

export default function ProDashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [requests, setRequests] = useState<LeadRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([proApi("/dashboard/summary"), proApi("/requests")])
      .then(([summaryJson, requestsJson]) => {
        const summary = summaryJson.data as Summary;
        const rows = ((requestsJson.data as LeadRow[]) || []).slice(0, 150);
        setData({
          pendingCount: summary.pendingCount ?? 0,
          acceptedToday: summary.acceptedToday ?? 0,
          upcomingReservationCount: summary.upcomingReservationCount ?? 0,
          recentDevisWeekCount: summary.recentDevisWeekCount ?? 0,
          stripePaymentsPendingCount: summary.stripePaymentsPendingCount ?? 0,
        });
        setRequests(rows);
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)));
  }, []);

  const sorted = useMemo(
    () => requests.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests]
  );
  const newCount = useMemo(() => requests.filter((row) => row.status === "new").length, [requests]);
  const urgent = useMemo(() => sorted.filter((row) => ["new", "pending"].includes(row.status)).slice(0, 5), [sorted]);
  const latestActive = useMemo(() => sorted.filter((row) => !DASHBOARD_EXCLUDED.has(row.status)).slice(0, 6), [sorted]);
  const upcoming = useMemo(
    () =>
      requests
        .filter((row) => row.kind === "reservation" && row.scheduledStart && ["accepted", "scheduled"].includes(row.status))
        .sort((a, b) => new Date(a.scheduledStart || "").getTime() - new Date(b.scheduledStart || "").getTime())
        .slice(0, 6),
    [requests]
  );

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            eyebrow="Pilotage"
            title="Tableau de bord"
            description="En quelques secondes, visualisez ce qui arrive, ce qui attend une action et les dossiers prioritaires a ouvrir."
            action={<ProActionLink href="/pro/demandes">Voir toutes les demandes</ProActionLink>}
          />

          <dl className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
              <dt className="text-[var(--pro-text-muted)]">Nouvelles demandes</dt>
              <dd className="mt-1 font-semibold text-[var(--pro-text)]">{newCount}</dd>
            </div>
            <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
              <dt className="text-[var(--pro-text-muted)]">Acceptées ce jour</dt>
              <dd className="mt-1 font-semibold text-[var(--pro-text)]">{data?.acceptedToday ?? 0}</dd>
            </div>
            <div className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
              <dt className="text-[var(--pro-text-muted)]">Paiements en attente</dt>
              <dd className="mt-1 font-semibold text-[var(--pro-text)]">{data?.stripePaymentsPendingCount ?? 0}</dd>
            </div>
          </dl>
        </ProPanel>

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <ProStatCard title="Nouvelles demandes" value={newCount} hint="Demandes fraiches a traiter en premier." tone="orange" href="/pro/demandes?status=new" />
          <ProStatCard title="En attente" value={data?.pendingCount ?? 0} hint="Dossiers encore ouverts ou non finalises." tone="orange" href="/pro/demandes?status=pending" />
          <ProStatCard
            title="Reservations a venir"
            value={data?.upcomingReservationCount ?? 0}
            hint="Courses acceptees ou planifiees sur les prochains jours."
            tone="green"
            href="/pro/calendrier#pro-cal-upcoming"
          />
          <ProStatCard title="Devis recents" value={data?.recentDevisWeekCount ?? 0} hint="Devis crees sur les 7 derniers jours." tone="blue" href="/pro/devis" />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
          <div className="space-y-6">
            <ProPanel>
              <ProSectionHeader
                title="A traiter en priorite"
                description="Les demandes nouvelles ou en attente qui meritent une action rapide."
              />
              <div className="mt-6 grid grid-cols-1 gap-4">
                {urgent.map((item) => (
                  <RequestCard key={item.id} item={item} />
                ))}
                {!urgent.length ? <EmptyState message="Aucune demande prioritaire pour le moment." /> : null}
              </div>
            </ProPanel>

            <ProPanel>
              <ProSectionHeader title="Activité récente" description="Dernières demandes actives, avec accès direct aux fiches." />
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {latestActive.map((item) => (
                  <RequestCard key={item.id} item={item} compact />
                ))}
                {!latestActive.length ? <EmptyState message="Aucune activité récente." /> : null}
              </div>
            </ProPanel>
          </div>

          <div className="space-y-6">
            <ProPanel id="pro-cal-upcoming">
              <ProSectionHeader title="Prochaines réservations" description="Les prochains trajets à suivre de près." />
              <div className="mt-6">
                {upcoming.length ? (
                  <ProTable headers={["Date course", "Client", "Trajet", "Statut", "Action"]}>
                    {upcoming.map((item) => (
                      <tr key={item.id} className="bg-[var(--pro-panel)] transition hover:bg-[var(--pro-panel-muted)]">
                        <td className="px-4 py-3 align-top text-[var(--pro-text-muted)]">{formatDateTime(item.scheduledStart)}</td>
                        <td className="px-4 py-3 align-top font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</td>
                        <td className="max-w-[320px] px-4 py-3 align-top text-[var(--pro-text-soft)]">
                          <span className="line-clamp-2">{getJourneySummary(item.flatPayload) || "Trajet non renseigné"}</span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                            {labelStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Link href={`/pro/demandes/${item.id}`} className="inline-flex rounded-lg bg-[var(--pro-accent)] px-3 py-2 text-xs font-semibold text-white">
                            Ouvrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </ProTable>
                ) : null}
                {!upcoming.length ? <EmptyState message="Aucune réservation à venir." /> : null}
              </div>
            </ProPanel>

            <ProPanel>
              <ProSectionHeader title="Raccourcis utiles" description="Accès rapides pour garder le rythme sur la journée." />
              <div className="mt-6 grid grid-cols-1 gap-3">
                <ProActionLink href="/pro/demandes?status=new">Ouvrir les nouvelles demandes</ProActionLink>
                <ProActionLink href="/pro/demandes?status=pending">Voir les demandes en attente</ProActionLink>
                <ProActionLink href="/pro/calendrier">Ouvrir le calendrier</ProActionLink>
                <ProActionLink href="/pro/transactions?status=LINK_SENT">Suivre les paiements en attente</ProActionLink>
              </div>
            </ProPanel>
          </div>
        </div>
      </ProShell>
    </ProGuard>
  );
}
