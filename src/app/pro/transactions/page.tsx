"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { actionButtonClass, formatDateTime, mapApiErrorToFr } from "@/components/pro/proDisplay";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
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
  { value: "PENDING", label: "Préparation" },
  { value: "LINK_SENT", label: "Lien envoyé" },
  { value: "PAID", label: "Payé" },
  { value: "FAILED", label: "Échec" },
  { value: "EXPIRED", label: "Expiré" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "REFUNDED", label: "Remboursé" },
];

export default function ProTransactionsPage() {
  const [data, setData] = useState<ProPaymentsListData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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
          setData(d);
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

  function rowReceipt(p: ProPaymentsListItem) {
    if (!p.stripeReceiptUrl?.trim()) return null;
    return (
      <a
        href={p.stripeReceiptUrl.trim()}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${actionButtonClass("neutral")}`}
      >
        Reçu
      </a>
    );
  }

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            eyebrow="Encaissements"
            title="Transactions"
            description="Historique des paiements Stripe pour votre structure (montants encaissés, liens envoyés, échecs)."
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Total payé (filtre)</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">
                {data ? formatAmountFromCents(data.summary.paidTotalCents, "eur") : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Paiements réussis</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">{data?.summary.paidCount ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Liens / préparation en cours</p>
              <p className="mt-2 text-lg font-bold text-[var(--pro-text)]">{data?.summary.pendingCheckoutCount ?? "—"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-12">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] md:col-span-4"
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
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] md:col-span-4"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] md:col-span-4"
            />
          </div>
        </ProPanel>

        <ProPanel className="overflow-hidden">
          {busy ? <p className="text-sm text-[var(--pro-text-muted)]">Chargement…</p> : null}
          {!busy && !items.length ? <EmptyState message="Aucune transaction pour ces filtres." /> : null}
          {!busy && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--pro-border)] text-xs uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Demande</th>
                    <th className="px-4 py-3 font-semibold">Montant</th>
                    <th className="px-4 py-3 font-semibold">Mode</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--pro-border)]/60 last:border-b-0">
                      <td className="px-4 py-3 align-top text-[var(--pro-text-muted)]">{formatDateTime(p.createdAt)}</td>
                      <td className="px-4 py-3 align-top font-medium text-[var(--pro-text)]">{p.clientName || "—"}</td>
                      <td className="px-4 py-3 align-top font-mono text-xs text-[var(--pro-text-soft)]">{p.leadRequestId}</td>
                      <td className="px-4 py-3 align-top font-semibold text-[var(--pro-accent)]">{formatAmountFromCents(p.amount, p.currency)}</td>
                      <td className="px-4 py-3 align-top text-[var(--pro-text-soft)]">{modeLabel(p.mode)}</td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(p.status)}`}
                        >
                          {labelLeadPaymentStatus(p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/pro/demandes/${p.leadRequestId}`}
                            className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${actionButtonClass("primary")}`}
                          >
                            Demande
                          </Link>
                          {rowReceipt(p)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </ProPanel>
      </ProShell>
    </ProGuard>
  );
}
