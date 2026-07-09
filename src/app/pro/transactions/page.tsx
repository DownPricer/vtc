"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { actionButtonClass, formatDateTime, mapApiErrorToFr } from "@/components/pro/proDisplay";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import { labelLeadPaymentStatus, leadPaymentStatusBadgeClass } from "@/lib/leadPaymentStatusUi";
import { listProPayments, type ProPaymentsListData, type ProPaymentsListItem } from "@/lib/proPaymentsClient";

function formatAmountFromCents(cents: number, currency: string): string {
  const eur = cents / 100;
  const cur = currency.toLowerCase() === "eur" ? "EUR" : currency.toUpperCase();
  return `${eur.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
}

function modeLabel(mode: string): string {
  return mode === "DEPOSIT" || mode === "deposit" ? "Acompte" : "Total";
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tous les statuts" },
  { value: "PENDING", label: "En cours" },
  { value: "LINK_SENT", label: "Lien envoyé" },
  { value: "PAID", label: "Paiement validé" },
  { value: "FAILED", label: "Échec" },
  { value: "EXPIRED", label: "Expiré" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "REFUNDED", label: "Remboursé" },
];

function lastSixMonthBars(monthlyPaid: ProPaymentsListData["monthlyPaid"] | undefined) {
  const map = new Map((monthlyPaid ?? []).map((m) => [m.monthKey, m.totalCents]));
  const now = new Date();
  const out: { key: string; label: string; cents: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      key,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      cents: map.get(key) ?? 0,
    });
  }
  const max = Math.max(...out.map((o) => o.cents), 1);
  const maxPx = 112;
  return out.map((o) => ({ ...o, barPx: Math.max(6, Math.round((o.cents / max) * maxPx)) }));
}

function ProTransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProPaymentsListData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    setStatus(searchParams.get("status")?.trim() ?? "");
    setFrom(searchParams.get("from")?.trim() ?? "");
    setTo(searchParams.get("to")?.trim() ?? "");
  }, [searchParams]);

  const pushQuery = useCallback(
    (next: { status: string; from: string; to: string }) => {
      const q = new URLSearchParams();
      if (next.status) q.set("status", next.status);
      if (next.from) q.set("from", next.from);
      if (next.to) q.set("to", next.to);
      const s = q.toString();
      router.replace(s ? `/pro/transactions?${s}` : "/pro/transactions", { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError("");
    listProPayments({
      ...(status ? { status } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      limit: 80,
      offset: 0,
    })
      .then((d) => {
        if (!cancelled) {
          setData({
            ...d,
            monthlyPaid: d.monthlyPaid ?? [],
            summary: {
              paidTotalCents: d.summary?.paidTotalCents ?? 0,
              paidCount: d.summary?.paidCount ?? 0,
              pendingCheckoutCount: d.summary?.pendingCheckoutCount ?? 0,
              failedCount: d.summary?.failedCount ?? 0,
              expiredCount: d.summary?.expiredCount ?? 0,
            },
          });
          setBusy(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(mapApiErrorToFr((e as Error).message) || "Impossible de charger les paiements.");
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status, from, to]);

  const items = data?.items ?? [];
  const bars = useMemo(() => lastSixMonthBars(data?.monthlyPaid), [data?.monthlyPaid]);

  function rowReceipt(p: ProPaymentsListItem) {
    if (!p.stripeReceiptUrl?.trim()) return null;
    return (
      <a
        href={p.stripeReceiptUrl.trim()}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${actionButtonClass("neutral")}`}
      >
        Reçu Stripe
      </a>
    );
  }

  return (
    <ProGuard>
      <ProPanel>
          <ProSectionHeader
            eyebrow="Encaissements"
            title="Historique des paiements"
            description="Suivez les paiements en ligne, les reçus Stripe et les paiements en attente."
            action={
              <Link
                href="/pro/paiements"
                className="inline-flex rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--pro-accent)] hover:bg-[var(--pro-accent-soft)]"
              >
                Réglages Stripe
              </Link>
            }
          />
      </ProPanel>

      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <ProPanel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Total encaissé</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">
                {data ? formatAmountFromCents(data.summary.paidTotalCents, "eur") : "—"}
              </p>
              <p className="mt-1 text-[11px] text-[var(--pro-text-soft)]">Selon filtres (statut payé)</p>
            </div>
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Paiements payés</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">{data?.summary.paidCount ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">En attente</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">{data?.summary.pendingCheckoutCount ?? "—"}</p>
              <p className="mt-1 text-[11px] text-[var(--pro-text-soft)]">Lien envoyé ou en cours</p>
            </div>
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Échecs / expirés</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">
                {data ? (data.summary.failedCount ?? 0) + (data.summary.expiredCount ?? 0) : "—"}
              </p>
              <p className="mt-1 text-[11px] text-[var(--pro-text-soft)]">
                {data ? `${data.summary.failedCount ?? 0} échec(s) · ${data.summary.expiredCount ?? 0} expiré(s)` : ""}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Encaissements par mois (payé)</p>
            <p className="mt-1 text-sm text-[var(--pro-text-soft)]">Six derniers mois — montants TTC encaissés.</p>
            <div className="mt-4 flex items-end gap-2 sm:gap-3">
              {bars.map((b) => (
                <div key={b.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-[120px] w-full items-end justify-center rounded-t-lg bg-[var(--pro-panel-muted)] px-1">
                    <div
                      className="w-[min(100%,52px)] rounded-t-md bg-[var(--pro-accent)]/90"
                      style={{ height: `${b.barPx}px` }}
                      title={`${b.label} : ${formatAmountFromCents(b.cents, "eur")}`}
                    />
                  </div>
                  <span className="max-w-full truncate text-center text-[10px] font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <select
              value={status}
              onChange={(e) => {
                const v = e.target.value;
                setStatus(v);
                pushQuery({ status: v, from, to });
              }}
              className="min-w-0 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] xl:col-span-4"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                const v = e.target.value;
                setFrom(v);
                pushQuery({ status, from: v, to });
              }}
              className="min-w-0 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] xl:col-span-4"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => {
                const v = e.target.value;
                setTo(v);
                pushQuery({ status, from, to: v });
              }}
              className="min-w-0 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] xl:col-span-4"
            />
          </div>
        </ProPanel>

        <ProPanel className="min-w-0">
          {busy ? <p className="text-sm text-[var(--pro-text-muted)]">Chargement…</p> : null}
          {!busy && !items.length ? <EmptyState message="Aucun paiement pour ces filtres." /> : null}
          {!busy && items.length > 0 ? (
            <>
              <div className="hidden xl:block min-w-0 overflow-hidden">
                <table className="w-full min-w-0 table-fixed border-collapse text-left text-sm">
                  <thead className="border-b border-[var(--pro-border)] text-xs uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">
                    <tr>
                      <th className="w-[18%] py-3 pl-0 pr-2 font-semibold">Date</th>
                      <th className="w-[20%] py-3 px-2 font-semibold">Client</th>
                      <th className="w-[14%] py-3 px-2 font-semibold">Réf.</th>
                      <th className="w-[12%] py-3 px-2 font-semibold">Montant</th>
                      <th className="w-[10%] py-3 px-2 font-semibold">Mode</th>
                      <th className="w-[14%] py-3 px-2 font-semibold">Statut</th>
                      <th className="w-[12%] py-3 pl-2 pr-0 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--pro-border)]/60 last:border-b-0">
                        <td className="py-3 align-top text-[var(--pro-text-muted)]">{formatDateTime(p.createdAt)}</td>
                        <td className="py-3 align-top font-medium text-[var(--pro-text)]">
                          <span className="line-clamp-2 break-words">{p.clientName || "—"}</span>
                        </td>
                        <td className="py-3 align-top font-mono text-[11px] text-[var(--pro-text-soft)]">
                          <span className="break-all">{p.leadRequestId}</span>
                        </td>
                        <td className="py-3 align-top font-semibold text-[var(--pro-accent)]">{formatAmountFromCents(p.amount, p.currency)}</td>
                        <td className="py-3 align-top text-[var(--pro-text-soft)]">{modeLabel(p.mode)}</td>
                        <td className="py-3 align-top">
                          <span
                            className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(p.status)}`}
                          >
                            {labelLeadPaymentStatus(p.status)}
                          </span>
                        </td>
                        <td className="py-3 align-top">
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <Link
                              href={`/pro/demandes/${p.leadRequestId}`}
                              className={`inline-flex justify-center rounded-lg px-3 py-1.5 text-center text-xs font-semibold ${actionButtonClass("primary")}`}
                            >
                              Ouvrir
                            </Link>
                            {rowReceipt(p)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:hidden 2xl:grid-cols-2">
                {items.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--pro-text)]">{p.clientName || "—"}</p>
                        <p className="mt-1 text-xs text-[var(--pro-text-muted)]">{formatDateTime(p.createdAt)}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(p.status)}`}
                      >
                        {labelLeadPaymentStatus(p.status)}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-[var(--pro-text-soft)]">Réf. {p.leadRequestId}</p>
                    <p className="mt-2 text-lg font-bold text-[var(--pro-accent)]">{formatAmountFromCents(p.amount, p.currency)}</p>
                    <p className="text-xs text-[var(--pro-text-soft)]">{modeLabel(p.mode)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/pro/demandes/${p.leadRequestId}`} className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold ${actionButtonClass("primary")}`}>
                        Ouvrir
                      </Link>
                      {rowReceipt(p)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
      </ProPanel>
    </ProGuard>
  );
}

export default function ProTransactionsPage() {
  return (
    <Suspense
      fallback={
        <ProGuard>
          <ProPanel>
            <p className="text-sm text-[var(--pro-text-muted)]">Chargement…</p>
          </ProPanel>
        </ProGuard>
      }
    >
      <ProTransactionsContent />
    </Suspense>
  );
}
