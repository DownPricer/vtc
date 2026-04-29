"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import { formatDateFr, getDisplayName, getJourneySummary, labelStatus, mapApiErrorToFr, statusBadgeClass } from "@/components/pro/proDisplay";
import { proApi } from "@/lib/proApi";

type CalendarItem = {
  id: string;
  clientName: string;
  status: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  flatPayload: Record<string, unknown>;
};

type CalendarDay = {
  date: Date;
  isoDate: string;
  inCurrentMonth: boolean;
  items: CalendarItem[];
};

function monthRange(base: Date): { from: string; to: string } {
  const fromDate = new Date(base.getFullYear(), base.getMonth(), 1);
  const toDate = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);
  return { from: fromDate.toISOString(), to: toDate.toISOString() };
}

function toDayIso(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toTimeLabel(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function buildMonthGrid(base: Date, items: CalendarItem[]): CalendarDay[] {
  const firstDay = new Date(base.getFullYear(), base.getMonth(), 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);
  const itemMap = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const dt = item.scheduledStart ? new Date(item.scheduledStart) : null;
    if (!dt || Number.isNaN(dt.getTime())) continue;
    const key = toDayIso(dt);
    const current = itemMap.get(key) ?? [];
    current.push(item);
    itemMap.set(key, current);
  }

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const isoDate = toDayIso(date);
    const inCurrentMonth = date.getMonth() === base.getMonth() && date.getDate() <= lastDay.getDate();
    const dayItems = (itemMap.get(isoDate) ?? []).sort((a, b) => new Date(a.scheduledStart || "").getTime() - new Date(b.scheduledStart || "").getTime());
    days.push({ date, isoDate, inCurrentMonth, items: dayItems });
  }
  return days;
}

export default function ProCalendrierPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState("");
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());

  useEffect(() => {
    const { from, to } = monthRange(monthCursor);
    proApi(`/dashboard/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((json) => setItems((json.data as CalendarItem[]) || []))
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)));
  }, [monthCursor]);

  const monthLabel = useMemo(
    () => monthCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    [monthCursor]
  );
  const grid = useMemo(() => buildMonthGrid(monthCursor, items), [monthCursor, items]);
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            title="Calendrier"
            description="Vue mensuelle des réservations acceptées et planifiées."
          />
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--pro-text-soft)] hover:bg-[var(--pro-accent-soft)]"
            >
              Mois précédent
            </button>
            <p className="text-base font-semibold capitalize text-[var(--pro-text)]">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--pro-text-soft)] hover:bg-[var(--pro-accent-soft)]"
            >
              Mois suivant
            </button>
          </div>
        </ProPanel>

        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <ProPanel className="overflow-hidden">
          {!items.length ? <EmptyState message="Aucune réservation planifiée." /> : null}
          {items.length ? (
            <>
              <div className="hidden grid-cols-7 gap-2 md:grid">
                {weekDays.map((day) => (
                  <div key={day} className="rounded-xl bg-[var(--pro-panel-muted)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pro-text-muted)]">
                    {day}
                  </div>
                ))}
                {grid.map((day) => (
                  <div
                    key={day.isoDate}
                    className={`min-h-[150px] rounded-2xl border px-2 py-2 ${day.inCurrentMonth ? "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]" : "border-[var(--pro-border)]/50 bg-white/40 opacity-70"}`}
                  >
                    <p className="mb-2 text-right text-xs font-semibold text-[var(--pro-text-muted)]">{day.date.getDate()}</p>
                    <div className="space-y-2">
                      {day.items.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          href={`/pro/demandes/${item.id}`}
                          className="block rounded-lg border border-[var(--pro-border)] bg-white px-2 py-1.5 hover:bg-orange-50"
                        >
                          <p className="text-xs font-semibold text-[var(--pro-text)]">
                            {toTimeLabel(item.scheduledStart) || "--:--"} - {getDisplayName(item.clientName)}
                          </p>
                          {getJourneySummary(item.flatPayload) ? (
                            <p className="mt-0.5 truncate text-[11px] text-[var(--pro-text-muted)]">{getJourneySummary(item.flatPayload)}</p>
                          ) : null}
                          <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(item.status)}`}>
                            {labelStatus(item.status)}
                          </span>
                        </Link>
                      ))}
                      {day.items.length > 3 ? <p className="text-[11px] text-[var(--pro-text-muted)]">+ {day.items.length - 3} autre(s)</p> : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 md:hidden">
                {grid
                  .filter((day) => day.items.length > 0)
                  .map((day) => (
                    <div key={day.isoDate} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-sm font-semibold capitalize text-[var(--pro-text)]">
                        {day.date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}
                      </p>
                      <div className="mt-2 space-y-2">
                        {day.items.map((item) => (
                          <Link key={item.id} href={`/pro/demandes/${item.id}`} className="block rounded-xl border border-[var(--pro-border)] bg-white px-3 py-2">
                            <p className="text-sm font-semibold text-[var(--pro-text)]">
                              {toTimeLabel(item.scheduledStart) || "--:--"} - {getDisplayName(item.clientName)}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--pro-text-muted)]">{formatDateFr(item.scheduledStart)}</p>
                            {getJourneySummary(item.flatPayload) ? (
                              <p className="mt-1 text-xs text-[var(--pro-text-soft)]">{getJourneySummary(item.flatPayload)}</p>
                            ) : null}
                            <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                              {labelStatus(item.status)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : null}
        </ProPanel>
      </ProShell>
    </ProGuard>
  );
}
