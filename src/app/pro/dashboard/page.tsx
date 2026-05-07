"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProPanel, ProSectionHeader, ProShell, ProStatCard } from "@/components/pro/ProUi";
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

export default function ProDashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [latestRequests, setLatestRequests] = useState<LeadRow[]>([]);
  const [upcoming, setUpcoming] = useState<LeadRow[]>([]);
  const [recentDevis, setRecentDevis] = useState<LeadRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([proApi("/dashboard/summary"), proApi("/requests")])
      .then(([summaryJson, requestsJson]) => {
        const summary = summaryJson.data as Summary;
        const requests = ((requestsJson.data as LeadRow[]) || []).slice(0, 150);
        setData({
          pendingCount: summary.pendingCount ?? 0,
          acceptedToday: summary.acceptedToday ?? 0,
          upcomingReservationCount: summary.upcomingReservationCount ?? 0,
          recentDevisWeekCount: summary.recentDevisWeekCount ?? 0,
          stripePaymentsPendingCount: summary.stripePaymentsPendingCount ?? 0,
        });
        const sorted = requests
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLatestRequests(
          sorted
            .filter((row) => !DASHBOARD_EXCLUDED.has(row.status))
            .slice(0, 6)
        );
        setUpcoming(
          requests
            .filter((row) => row.kind === "reservation" && row.scheduledStart && ["accepted", "scheduled"].includes(row.status))
            .sort((a, b) => new Date(a.scheduledStart || "").getTime() - new Date(b.scheduledStart || "").getTime())
            .slice(0, 6)
        );
        setRecentDevis(
          requests
            .filter((row) => row.kind === "devis")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4)
        );
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)));
  }, []);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader eyebrow="Pilotage" title="Tableau de bord" description="Suivez vos demandes, devis et réservations." />
        </ProPanel>

        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <ProStatCard
            title="Demandes en attente"
            value={data?.pendingCount ?? 0}
            hint="Nouvelles demandes ou en attente de traitement."
            tone="orange"
            href="/pro/demandes?status=pending"
          />
          <ProStatCard
            title="Réservations à venir"
            value={data?.upcomingReservationCount ?? 0}
            hint="Réservations acceptées ou planifiées (14 jours)."
            tone="green"
            href="/pro/calendrier#pro-cal-upcoming"
          />
          <ProStatCard
            title="Devis récents"
            value={data?.recentDevisWeekCount ?? 0}
            hint="Devis créés sur les 7 derniers jours."
            tone="blue"
            href="/pro/devis"
          />
          <ProStatCard
            title="Paiements en attente"
            value={data?.stripePaymentsPendingCount ?? 0}
            hint="Liens Stripe en cours ou envoyés au client."
            tone="slate"
            href="/pro/transactions?status=LINK_SENT"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <ProPanel>
            <ProSectionHeader
              title="Dernières demandes"
              description="Contacts, devis et réservations actifs (hors archivés / terminés / annulés)."
              action={
                <Link href="/pro/demandes" className="text-sm font-semibold text-[var(--pro-accent)] hover:brightness-110">
                  Voir toutes les demandes
                </Link>
              }
            />
            <div className="mt-5 space-y-3">
              {latestRequests.map((item) => {
                const journey = getJourneySummary(item.flatPayload);
                const tarif = tarifValue(item);
                return (
                  <Link
                    key={item.id}
                    href={`/pro/demandes/${item.id}`}
                    className="block rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 transition hover:border-orange-300/40 hover:bg-[var(--pro-accent-soft)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                        <p className="mt-1 text-sm text-[var(--pro-text-muted)]">
                          {labelKind(item.kind)} · {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                        {labelStatus(item.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--pro-text-soft)]">
                      {journey ? <span>{journey}</span> : null}
                      {tarif ? <span className="font-semibold text-[var(--pro-accent)]">{tarif}</span> : null}
                      <span className="font-medium text-[var(--pro-accent)]">Ouvrir</span>
                    </div>
                  </Link>
                );
              })}
              {!latestRequests.length ? <EmptyState message="Aucune demande active récente." /> : null}
            </div>
          </ProPanel>

          <ProPanel>
            <ProSectionHeader title="Prochaines réservations" description="Les réservations à surveiller en priorité." />
            <div className="mt-5 space-y-3">
              {upcoming.map((item) => (
                <Link
                  key={item.id}
                  href={`/pro/demandes/${item.id}`}
                  className="block rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 transition hover:border-emerald-300/40 hover:bg-[var(--pro-accent-soft)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                      <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{formatDateTime(item.scheduledStart)}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                      {labelStatus(item.status)}
                    </span>
                  </div>
                  {getJourneySummary(item.flatPayload) ? <p className="mt-3 text-sm text-[var(--pro-text-soft)]">{getJourneySummary(item.flatPayload)}</p> : null}
                </Link>
              ))}
              {!upcoming.length ? <EmptyState message="Aucune réservation à venir." /> : null}
            </div>
          </ProPanel>
        </div>

        <ProPanel>
          <ProSectionHeader
            title="Devis récents"
            description="Accédez rapidement aux derniers devis à suivre."
            action={
              <Link href="/pro/devis" className="text-sm font-semibold text-[var(--pro-accent)] hover:brightness-110">
                Tous les devis
              </Link>
            }
          />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recentDevis.map((item) => (
              <Link
                key={item.id}
                href={`/pro/demandes/${item.id}`}
                className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 transition hover:border-orange-300/40 hover:bg-[var(--pro-accent-soft)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                    {labelStatus(item.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--pro-text-muted)]">{formatDateTime(item.createdAt)}</p>
                {tarifValue(item) ? <p className="mt-3 text-sm font-semibold text-[var(--pro-accent)]">{tarifValue(item)}</p> : null}
              </Link>
            ))}
            {!recentDevis.length ? <EmptyState message="Aucun devis récent." /> : null}
          </div>
        </ProPanel>
      </ProShell>
    </ProGuard>
  );
}
