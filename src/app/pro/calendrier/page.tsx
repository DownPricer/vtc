"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProActionLink, ProAlert, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
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
    const inCurrentMonth = date.getMonth() === base.getMonth();
    const dayItems = (itemMap.get(isoDate) ?? []).sort((a, b) => new Date(a.scheduledStart || "").getTime() - new Date(b.scheduledStart || "").getTime());
    days.push({ date, isoDate, inCurrentMonth, items: dayItems });
  }
  return days;
}

export default function ProCalendrierPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState("");
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());
  const [selectedIsoDate, setSelectedIsoDate] = useState("");

  useEffect(() => {
    const { from, to } = monthRange(monthCursor);
    proApi(`/dashboard/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((json) => {
        setItems((json.data as CalendarItem[]) || []);
        setError("");
      })
      .catch((e) => setError(mapApiErrorToFr((e as Error).message)));
  }, [monthCursor]);

  const monthLabel = useMemo(
    () => monthCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    [monthCursor]
  );
  const grid = useMemo(() => buildMonthGrid(monthCursor, items), [monthCursor, items]);
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const occupiedDays = useMemo(() => grid.filter((day) => day.items.length > 0).length, [grid]);

  useEffect(() => {
    const today = toDayIso(new Date());
    const todayInsideMonth = grid.find((day) => day.isoDate === today && day.items.length > 0);
    if (todayInsideMonth) {
      setSelectedIsoDate(todayInsideMonth.isoDate);
      return;
    }
    const firstFilledDay = grid.find((day) => day.items.length > 0);
    if (firstFilledDay) {
      setSelectedIsoDate(firstFilledDay.isoDate);
      return;
    }
    setSelectedIsoDate(grid[0]?.isoDate ?? "");
  }, [grid]);

  const selectedDay = useMemo(() => grid.find((day) => day.isoDate === selectedIsoDate) ?? null, [grid, selectedIsoDate]);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel id="pro-cal-upcoming">
          <ProSectionHeader
            eyebrow="Planning"
            title="Calendrier"
            description="Visualisez rapidement les reservations du mois, selectionnez un jour et ouvrez les fiches sans quitter le planning."
            action={<ProActionLink href="/pro/demandes?kind=reservation">Voir les reservations</ProActionLink>}
          />

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Mois affiche</p>
              <p className="mt-2 text-lg font-semibold capitalize text-[var(--pro-text)]">{monthLabel}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Reservations</p>
              <p className="mt-2 text-lg font-semibold text-[var(--pro-text)]">{items.length}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Jours occupes</p>
              <p className="mt-2 text-lg font-semibold text-[var(--pro-text)]">{occupiedDays}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
            >
              Mois precedent
            </button>
            <p className="text-base font-semibold capitalize text-[var(--pro-text)]">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
            >
              Mois suivant
            </button>
          </div>
        </ProPanel>

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <ProPanel className="overflow-hidden">
            {!items.length ? <EmptyState message="Aucune reservation planifiee sur cette periode." /> : null}
            {items.length ? (
              <>
                <div className="hidden lg:grid lg:grid-cols-7 lg:gap-3">
                  {weekDays.map((day) => (
                    <div key={day} className="rounded-2xl bg-[var(--pro-panel-muted)] px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pro-text-muted)]">
                      {day}
                    </div>
                  ))}

                  {grid.map((day) => {
                    const selected = day.isoDate === selectedIsoDate;
                    return (
                      <button
                        key={day.isoDate}
                        type="button"
                        onClick={() => setSelectedIsoDate(day.isoDate)}
                        className={`min-h-[170px] rounded-[24px] border p-3 text-left transition ${
                          selected
                            ? "border-[var(--pro-accent)] bg-[color-mix(in_srgb,var(--pro-accent-soft)_60%,white_40%)]"
                            : day.inCurrentMonth
                              ? "border-[var(--pro-border)] bg-[var(--pro-panel-muted)] hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)]"
                              : "border-[var(--pro-border)]/50 bg-white/40 opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[var(--pro-text)]">{day.date.getDate()}</span>
                          {day.items.length ? (
                            <span className="rounded-full bg-[var(--pro-panel)] px-2 py-1 text-[11px] font-semibold text-[var(--pro-text-soft)]">
                              {day.items.length}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 space-y-2">
                          {day.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2">
                              <p className="text-xs font-semibold text-[var(--pro-text)]">
                                {toTimeLabel(item.scheduledStart) || "--:--"} · {getDisplayName(item.clientName)}
                              </p>
                              {getJourneySummary(item.flatPayload) ? (
                                <p className="mt-1 line-clamp-2 text-[11px] text-[var(--pro-text-muted)]">{getJourneySummary(item.flatPayload)}</p>
                              ) : null}
                            </div>
                          ))}
                          {day.items.length > 3 ? <p className="text-[11px] text-[var(--pro-text-muted)]">+ {day.items.length - 3} autre(s)</p> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 lg:hidden">
                  {grid
                    .filter((day) => day.items.length > 0)
                    .map((day) => (
                      <button
                        key={day.isoDate}
                        type="button"
                        onClick={() => setSelectedIsoDate(day.isoDate)}
                        className={`block w-full rounded-[24px] border px-4 py-4 text-left ${
                          day.isoDate === selectedIsoDate
                            ? "border-[var(--pro-accent)] bg-[color-mix(in_srgb,var(--pro-accent-soft)_60%,white_40%)]"
                            : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold capitalize text-[var(--pro-text)]">
                            {day.date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}
                          </p>
                          <span className="rounded-full bg-[var(--pro-panel)] px-2 py-1 text-[11px] font-semibold text-[var(--pro-text-soft)]">
                            {day.items.length}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {day.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2">
                              <p className="text-sm font-semibold text-[var(--pro-text)]">
                                {toTimeLabel(item.scheduledStart) || "--:--"} · {getDisplayName(item.clientName)}
                              </p>
                              <p className="mt-1 text-xs text-[var(--pro-text-muted)]">{formatDateFr(item.scheduledStart)}</p>
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                </div>
              </>
            ) : null}
          </ProPanel>

          <ProPanel className="2xl:sticky 2xl:top-28">
            <ProSectionHeader
              title="Jour selectionne"
              description={selectedDay ? selectedDay.date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" }) : "Aucun jour"}
            />

            <div className="mt-6 space-y-3">
              {selectedDay?.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/pro/demandes/${item.id}`}
                  className="block rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                      <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{toTimeLabel(item.scheduledStart) || "--:--"}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                      {labelStatus(item.status)}
                    </span>
                  </div>
                  {getJourneySummary(item.flatPayload) ? <p className="mt-3 text-sm text-[var(--pro-text-soft)]">{getJourneySummary(item.flatPayload)}</p> : null}
                  <p className="mt-4 text-sm font-semibold text-[var(--pro-accent)]">Ouvrir la demande</p>
                </Link>
              ))}

              {!selectedDay?.items.length ? <EmptyState message="Aucune reservation pour le jour selectionne." /> : null}
            </div>
          </ProPanel>
        </div>
      </ProShell>
    </ProGuard>
  );
}
