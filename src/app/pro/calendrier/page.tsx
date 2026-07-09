"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProAlert, ProField, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";
import { formatDateTime, getDisplayName, getJourneySummary, labelStatus, mapApiErrorToFr, statusBadgeClass } from "@/components/pro/proDisplay";
import { proApi } from "@/lib/proApi";

type CalendarItem = {
  id: string;
  clientName: string;
  status: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  flatPayload: Record<string, unknown>;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}
function toIso(d: Date) {
  return d.toISOString();
}
function parseDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function groupLabel(from: Date, to: Date) {
  return `${from.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })} → ${to.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
  })}`;
}

export default function ProCalendrierPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const from = useMemo(() => startOfDay(new Date()), []);
  const to = useMemo(() => endOfDay(addDays(new Date(), 30)), []);

  useEffect(() => {
    setLoading(true);
    proApi(`/dashboard/calendar?from=${encodeURIComponent(toIso(from))}&to=${encodeURIComponent(toIso(to))}`)
      .then((json) => {
        setItems(((json.data as CalendarItem[]) || []).slice());
        setError("");
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
      .finally(() => setLoading(false));
  }, [from, to]);

  const sorted = useMemo(() => {
    return items
      .slice()
      .filter((it) => parseDate(it.scheduledStart))
      .sort((a, b) => new Date(a.scheduledStart || "").getTime() - new Date(b.scheduledStart || "").getTime());
  }, [items]);

  const filtered = useMemo(() => {
    if (!status) return sorted;
    return sorted.filter((it) => it.status === status);
  }, [sorted, status]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const weekEnd = useMemo(() => endOfDay(addDays(today, 6)), [today]);
  const todayEnd = useMemo(() => endOfDay(today), [today]);

  const todayItems = useMemo(() => {
    return filtered.filter((it) => {
      const d = parseDate(it.scheduledStart);
      return d ? d >= today && d <= todayEnd : false;
    });
  }, [filtered, today, todayEnd]);

  const weekItems = useMemo(() => {
    return filtered.filter((it) => {
      const d = parseDate(it.scheduledStart);
      return d ? d > todayEnd && d <= weekEnd : false;
    });
  }, [filtered, todayEnd, weekEnd]);

  const upcomingItems = useMemo(() => {
    return filtered.filter((it) => {
      const d = parseDate(it.scheduledStart);
      return d ? d > weekEnd : false;
    });
  }, [filtered, weekEnd]);

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

  function ItemCard({ item }: { item: CalendarItem }) {
    return (
      <Link
        href={`/pro/demandes/${item.id}`}
        className="block rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
            <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{formatDateTime(item.scheduledStart)}</p>
          </div>
          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
            {labelStatus(item.status)}
          </span>
        </div>
        {getJourneySummary(item.flatPayload) ? (
          <p className="mt-3 text-sm text-[var(--pro-text-soft)]">{getJourneySummary(item.flatPayload)}</p>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-[var(--pro-accent)]">Ouvrir</p>
      </Link>
    );
  }

  return (
    <ProGuard>
      <ProPanel>
        <ProSectionHeader
          title="Calendrier"
          description={`Courses planifiées (période : ${groupLabel(from, to)}). Filtrez puis ouvrez les fiches rapidement.`}
        />

        <div className="mt-6 grid grid-cols-1 gap-3 xl:grid-cols-12">
          <ProField label="Statut" className="xl:col-span-4">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={proInputClass}>
              {STATUS_FILTERS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </ProField>
          <div className="xl:col-span-8 flex items-end justify-start gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                proApi(`/dashboard/calendar?from=${encodeURIComponent(toIso(from))}&to=${encodeURIComponent(toIso(to))}`)
                  .then((json) => {
                    setItems(((json.data as CalendarItem[]) || []).slice());
                    setError("");
                  })
                  .catch((e) => setError(mapApiErrorToFr((e as Error).message)))
                  .finally(() => setLoading(false));
              }}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--pro-border)] bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </ProPanel>

      {error ? <ProAlert tone="error">{error}</ProAlert> : null}
      {loading ? <ProAlert tone="info">Chargement du calendrier…</ProAlert> : null}

      <ProPanel>
        <ProSectionHeader title="Aujourd’hui" description="Courses prévues aujourd’hui." />
        <div className="mt-6 space-y-3">
          {todayItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {!todayItems.length && !loading ? <EmptyState message="Aucune course prévue aujourd’hui." /> : null}
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Cette semaine" description="Courses prévues dans les 7 prochains jours." />
        <div className="mt-6 space-y-3">
          {weekItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {!weekItems.length && !loading ? <EmptyState message="Aucune course prévue sur la semaine." /> : null}
        </div>
      </ProPanel>

      <ProPanel id="pro-cal-upcoming">
        <ProSectionHeader title="À venir" description="Le reste des courses à suivre." />
        <div className="mt-6 space-y-3">
          {upcomingItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {!upcomingItems.length && !loading ? <EmptyState message="Aucune course à venir sur la période." /> : null}
        </div>
      </ProPanel>
    </ProGuard>
  );
}

