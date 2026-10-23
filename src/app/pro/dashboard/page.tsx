"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ProGuard } from "@/components/pro/ProGuard";
import {
  EmptyState,
  ProActionLink,
  ProAlert,
  ProDataRow,
  ProKicker,
  ProPageHead,
  ProPanel,
  ProSectionHeader,
  ProSessionAlert,
  ProShortcut,
  ProStatCard,
  ProTextLink,
} from "@/components/pro/ProUi";
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
  newCount?: number;
  acceptedToday: number;
  upcomingReservationCount: number;
  recentDevisWeekCount: number;
  stripePaymentsPendingCount: number;
};

const DASHBOARD_EXCLUDED = new Set(["archived", "completed", "cancelled", "refused", "expired"]);
const SESSION_ERROR = /unauthorized|401|expir/i;

function tarifValue(item: LeadRow): string {
  const raw = item.pricingResult && (item.pricingResult as Record<string, unknown>).tarif;
  return isUsefulValue(raw) ? formatPrice(raw) : "";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`hidden whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold sm:inline-flex ${statusBadgeClass(status)}`}>
      {labelStatus(status)}
    </span>
  );
}

function RequestRow({ item }: { item: LeadRow }) {
  const journey = getJourneySummary(item.flatPayload);
  const tarif = tarifValue(item);
  const name = getDisplayName(item.clientName);

  return (
    <ProDataRow
      href={`/pro/demandes/${item.id}`}
      title={journey ? `${name} · ${journey}` : name}
      detail={`${labelKind(item.kind)} · ${formatDateTime(item.createdAt)}${tarif ? ` · ${tarif}` : ""}`}
      badge={<StatusBadge status={item.status} />}
    />
  );
}

export default function ProDashboardPage() {
  const pathname = usePathname() || "/pro/dashboard";
  const [data, setData] = useState<Summary | null>(null);
  const [requests, setRequests] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawError, setRawError] = useState("");

  useEffect(() => {
    Promise.all([proApi("/dashboard/summary"), proApi("/requests")])
      .then(([summaryJson, requestsJson]) => {
        const summary = summaryJson.data as Summary;
        const rows = ((requestsJson.data as LeadRow[]) || []).slice(0, 150);
        setData({
          pendingCount: summary.pendingCount ?? 0,
          newCount: summary.newCount,
          acceptedToday: summary.acceptedToday ?? 0,
          upcomingReservationCount: summary.upcomingReservationCount ?? 0,
          recentDevisWeekCount: summary.recentDevisWeekCount ?? 0,
          stripePaymentsPendingCount: summary.stripePaymentsPendingCount ?? 0,
        });
        setRequests(rows);
      })
      .catch((e) => setRawError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const sessionExpired = SESSION_ERROR.test(rawError);

  const sorted = useMemo(
    () => requests.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests]
  );
  // `newCount` vient de l'API (total réel) ; repli sur la liste chargée si l'API est plus ancienne.
  const newCount = useMemo(
    () => data?.newCount ?? requests.filter((row) => row.status === "new").length,
    [data, requests]
  );
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

  const stat = (value?: number) => (loading ? "–" : value ?? 0);

  return (
    <ProGuard>
      <div className="space-y-[26px]">
        <ProPageHead
          eyebrow="Vue d’ensemble"
          title="Tableau de bord"
          description="Gardez un œil sur les demandes à traiter et les prochaines courses."
          action={
            sessionExpired ? null : (
              <ProActionLink href="/pro/demandes" withArrow>
                Voir toutes les demandes
              </ProActionLink>
            )
          }
        />

        {sessionExpired ? (
          <ProSessionAlert reconnectHref={`/pro/login?next=${encodeURIComponent(pathname)}`} />
        ) : rawError ? (
          <ProAlert tone="error">{mapApiErrorToFr(rawError)}</ProAlert>
        ) : null}

        {!rawError ? (
          <div>
            <ProKicker>Aujourd’hui en un coup d’œil</ProKicker>
            <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-2.5 sm:gap-4 min-[1151px]:grid-cols-3">
              <ProStatCard
                title="Nouvelles demandes"
                value={stat(newCount)}
                hint="À consulter en priorité"
                tone="blue"
                icon="file"
                href="/pro/demandes?status=new"
              />
              <ProStatCard
                title="En attente"
                value={stat(data?.pendingCount)}
                hint="Dossiers à suivre"
                tone="blue"
                icon="clock"
                href="/pro/demandes?status=pending"
              />
              <ProStatCard
                title="Réservations à venir"
                value={stat(data?.upcomingReservationCount)}
                hint="Prochains trajets planifiés"
                tone="blue"
                icon="calendar"
                href="/pro/calendrier#pro-cal-upcoming"
              />
              <ProStatCard
                title="Devis récents"
                value={stat(data?.recentDevisWeekCount)}
                hint="Créés ces 7 derniers jours"
                tone="slate"
                icon="file"
                href="/pro/devis"
              />
              <ProStatCard
                title="Acceptées ce jour"
                value={stat(data?.acceptedToday)}
                hint="Courses confirmées aujourd’hui"
                tone="slate"
                icon="calendar"
                href="/pro/calendrier"
              />
              <ProStatCard
                title="Paiements en attente"
                value={stat(data?.stripePaymentsPendingCount)}
                hint="À suivre ou à relancer"
                tone="slate"
                icon="card"
                href="/pro/transactions?status=LINK_SENT"
              />
            </section>

            <div className="mt-6 grid gap-5 min-[1151px]:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
              <div className="grid content-start gap-5 md:grid-cols-2 min-[1151px]:grid-cols-1">
                <ProPanel>
                  <ProSectionHeader
                    level="panel"
                    title="À traiter en priorité"
                    description="Concentrez-vous sur les demandes qui attendent une action."
                    action={<ProTextLink href="/pro/demandes">Tout voir</ProTextLink>}
                  />
                  {urgent.length ? (
                    <div className="grid gap-2.5">
                      {urgent.map((item) => (
                        <RequestRow key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="file"
                      title={loading ? "Chargement…" : "Tout est à jour"}
                      message={loading ? "Récupération de vos demandes en cours." : "Aucune demande ne nécessite une action immédiate."}
                      actionLabel={loading ? undefined : "Voir les demandes"}
                      actionHref="/pro/demandes"
                    />
                  )}
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader level="panel" title="Activité récente" description="Les dernières actions sur vos dossiers." />
                  {latestActive.length ? (
                    <div className="grid gap-2.5">
                      {latestActive.map((item) => (
                        <RequestRow key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="clock"
                      title={loading ? "Chargement…" : "Aucune activité récente"}
                      message={loading ? "Récupération de l’activité en cours." : "Les actions sur vos dossiers seront affichées ici."}
                    />
                  )}
                </ProPanel>
              </div>

              <div className="grid content-start gap-5 md:grid-cols-2 min-[1151px]:grid-cols-1">
                <ProPanel id="pro-cal-upcoming">
                  <ProSectionHeader
                    level="panel"
                    title="Prochaines réservations"
                    description="Préparez vos prochaines courses."
                    action={<ProTextLink href="/pro/calendrier">Calendrier</ProTextLink>}
                  />
                  {upcoming.length ? (
                    <div className="grid gap-2.5">
                      {upcoming.map((item) => (
                        <ProDataRow
                          key={item.id}
                          href={`/pro/demandes/${item.id}`}
                          title={`${getDisplayName(item.clientName)} · ${getJourneySummary(item.flatPayload) || "Trajet non renseigné"}`}
                          detail={formatDateTime(item.scheduledStart)}
                          badge={<StatusBadge status={item.status} />}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="calendar"
                      title={loading ? "Chargement…" : "Aucune course à venir"}
                      message={loading ? "Récupération des réservations en cours." : "Vos prochaines réservations apparaîtront ici."}
                      actionLabel={loading ? undefined : "Ouvrir le calendrier"}
                      actionHref="/pro/calendrier"
                    />
                  )}
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader level="panel" title="Accès rapides" description="Vos actions les plus courantes." />
                  <div className="grid grid-cols-1 gap-2.5 min-[521px]:grid-cols-2">
                    <ProShortcut href="/pro/demandes" icon="file">
                      Demandes
                    </ProShortcut>
                    <ProShortcut href="/pro/calendrier" icon="calendar">
                      Calendrier
                    </ProShortcut>
                    <ProShortcut href="/pro/tarifs" icon="tag">
                      Tarifs
                    </ProShortcut>
                    <ProShortcut href="/pro/devis" icon="file">
                      Devis
                    </ProShortcut>
                    <ProShortcut href="/pro/reservations" icon="calendar">
                      Réservations
                    </ProShortcut>
                    <ProShortcut href="/pro/transactions?status=LINK_SENT" icon="card">
                      Paiements en attente
                    </ProShortcut>
                  </div>
                </ProPanel>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ProGuard>
  );
}
