"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { formatDateTime, mapApiErrorToFr } from "@/components/pro/proDisplay";
import { ProGuard } from "@/components/pro/ProGuard";
import { EmptyState, ProActionLink, ProAlert, ProField, ProPageHead, ProPanel, ProTable, proInputClass, proTdClass, proTrClass } from "@/components/pro/ProUi";
import {
  ProFilterPanel,
  ProOpenLink,
  ProPagination,
  ProRequestCard,
  ProResultsPanel,
  ProSearchInput,
  paginate,
  searchNormalize,
} from "@/components/pro/ProListUi";
import { labelLeadPaymentStatus, leadPaymentStatusBadgeClass } from "@/lib/leadPaymentStatusUi";
import { listProPayments, type ProPaymentsListData, type ProPaymentsListItem } from "@/lib/proPaymentsClient";

const PER_PAGE = 6;

function formatAmountFromCents(cents: number, currency: string): string {
  const eur = cents / 100;
  const cur = currency.toLowerCase() === "eur" ? "€" : currency.toUpperCase();
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

function toDateInput(d: Date): string {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

function monthRange(key: string) {
  const [year, month] = key.split("-").map(Number);
  return { from: toDateInput(new Date(year, month - 1, 1)), to: toDateInput(new Date(year, month, 0)) };
}

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
  return out.map((o) => ({ ...o, percent: Math.max(3, Math.round((o.cents / max) * 100)) }));
}

function receiptUrl(p: ProPaymentsListItem): string {
  const url = p.stripeReceiptUrl?.trim() ?? "";
  return url.startsWith("https://") ? url : "";
}

function ReceiptLink({ p }: { p: ProPaymentsListItem }) {
  const url = receiptUrl(p);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[36px] items-center whitespace-nowrap rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-2.5 text-xs font-bold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)]"
    >
      Reçu Stripe
    </a>
  );
}

function StatTile({ label, value, hint, primary }: { label: string; value: string | number; hint?: string; primary?: boolean }) {
  return (
    <article
      className={`flex min-h-[126px] flex-col items-start rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-[13px] sm:min-h-[124px] sm:p-[17px] ${
        primary ? "border-t-[3px] border-t-[var(--pro-accent)]" : ""
      }`}
    >
      <span className="text-[13px] font-bold">{label}</span>
      <strong className="mb-1.5 mt-[11px] text-[21px] font-bold leading-none tabular-nums sm:text-[26px]">{value}</strong>
      {hint ? <small className="text-[11px] leading-[1.4] text-[var(--pro-text-muted)]">{hint}</small> : null}
    </article>
  );
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
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setStatus(searchParams.get("status")?.trim() ?? "");
    setFrom(searchParams.get("from")?.trim() ?? "");
    setTo(searchParams.get("to")?.trim() ?? "");
  }, [searchParams]);

  const pushQuery = useCallback(
    (next: { status: string; from: string; to: string }) => {
      const params = new URLSearchParams();
      if (next.status) params.set("status", next.status);
      if (next.from) params.set("from", next.from);
      if (next.to) params.set("to", next.to);
      const s = params.toString();
      setPage(1);
      router.replace(s ? `/pro/transactions?${s}` : "/pro/transactions", { scroll: false });
    },
    [router]
  );

  const rangeInvalid = !!from && !!to && from > to;

  useEffect(() => {
    if (rangeInvalid) return;
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
  }, [status, from, to, rangeInvalid]);

  const bars = useMemo(() => lastSixMonthBars(data?.monthlyPaid), [data?.monthlyPaid]);
  const activeMonth = useMemo(
    () => bars.find((bar) => {
      const range = monthRange(bar.key);
      return range.from === from && range.to === to;
    })?.key ?? null,
    [bars, from, to]
  );

  const items = useMemo(() => {
    const all = rangeInvalid ? [] : data?.items ?? [];
    const query = searchNormalize(q.trim());
    if (!query) return all;
    return all.filter((p) => [p.clientName, p.leadRequestId, p.id].map(searchNormalize).join(" ").includes(query));
  }, [data?.items, q, rangeInvalid]);

  const { pageItems, page: currentPage, pages } = paginate(items, page, PER_PAGE);
  const hasFilters = !!q.trim() || !!status || !!from || !!to;
  const failedTotal = (data?.summary.failedCount ?? 0) + (data?.summary.expiredCount ?? 0);

  function clearFilters() {
    setQ("");
    setPage(1);
    pushQuery({ status: "", from: "", to: "" });
  }

  const countLabel = rangeInvalid
    ? "Corrigez la période sélectionnée"
    : `${items.length} transaction${items.length > 1 ? "s" : ""} affichée${items.length > 1 ? "s" : ""}${data ? ` sur ${data.items.length}` : ""}`;

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Encaissements"
          title="Historique des paiements"
          description="Suivez les paiements reçus, les liens envoyés et les opérations à vérifier."
          action={
            <ProActionLink href="/pro/paiements" withArrow>
              Réglages Stripe
            </ProActionLink>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}

        <ProPanel>
          <div className="mb-5">
            <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">Vue globale</p>
            <h2 className="mb-[5px] text-xl font-bold tracking-[-0.025em] text-[var(--pro-text)] sm:text-[22px]">Encaissements en un coup d’œil</h2>
            <p className="text-[13px] text-[var(--pro-text-muted)]">Ces chiffres suivent les filtres de statut et de période appliqués ci-dessous.</p>
          </div>

          <div className="grid grid-cols-2 gap-[9px] sm:gap-3 min-[1201px]:grid-cols-4" aria-label="Indicateurs des paiements">
            <StatTile primary label="Total encaissé" value={data ? formatAmountFromCents(data.summary.paidTotalCents, "eur") : "—"} hint="Uniquement les paiements validés" />
            <StatTile label="Paiements validés" value={data?.summary.paidCount ?? "—"} hint="Réglés par les clients" />
            <StatTile label="En attente" value={data?.summary.pendingCheckoutCount ?? "—"} hint="Liens envoyés ou en cours" />
            <StatTile
              label="Échecs / expirés"
              value={data ? failedTotal : "—"}
              hint={data ? `${data.summary.failedCount ?? 0} échec(s) · ${data.summary.expiredCount ?? 0} expiré(s)` : "À vérifier si nécessaire"}
            />
          </div>

          <div className="mb-4 mt-[26px] flex flex-col items-start justify-between gap-3.5 border-t border-[var(--pro-border)] pt-[21px] sm:flex-row sm:items-end">
            <div>
              <h3 className="mb-1 text-[17px] font-bold text-[var(--pro-text)]">Encaissements par mois</h3>
              <p className="text-xs text-[var(--pro-text-muted)]">Six derniers mois · montants réellement encaissés</p>
            </div>
            <span className="text-xs text-[var(--pro-text-muted)]">Sélectionnez un mois pour filtrer la liste</span>
          </div>

          <div className="grid min-h-[168px] grid-cols-6 items-end gap-1 sm:gap-2.5" aria-label="Encaissements par mois">
            {bars.map((bar) => {
              const active = activeMonth === bar.key;
              return (
                <button
                  key={bar.key}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${bar.label} : ${formatAmountFromCents(bar.cents, "eur")} encaissés. Filtrer ce mois.`}
                  onClick={() => (active ? pushQuery({ status, from: "", to: "" }) : pushQuery({ status, ...monthRange(bar.key) }))}
                  className="group flex h-[168px] flex-col items-stretch justify-end gap-1.5 text-center text-[var(--pro-text)]"
                >
                  <span className="text-[10px] font-bold tabular-nums sm:text-xs">{bar.cents ? formatAmountFromCents(bar.cents, "eur") : "0 €"}</span>
                  <span
                    className={`flex h-[110px] items-end overflow-hidden rounded-[5px] bg-[var(--pro-panel-muted)] ${
                      active ? "outline outline-2 outline-offset-2 outline-[var(--pro-accent)]" : ""
                    }`}
                  >
                    <span
                      className={`block min-h-[3px] w-full rounded-t-[5px] transition-colors ${active ? "bg-[#82acff]" : "bg-[#4f8cf5] group-hover:bg-[#82acff]"}`}
                      style={{ height: `${bar.percent}%` }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[9px] font-bold uppercase text-[var(--pro-text-muted)] sm:text-[11px]">{bar.label}</span>
                </button>
              );
            })}
          </div>
        </ProPanel>

        <ProFilterPanel
          title="Retrouver une opération"
          description="Recherchez un client ou une référence, puis affinez par statut ou par date."
          active={hasFilters}
          onReset={clearFilters}
          gridClassName="grid gap-3.5 sm:grid-cols-2 min-[1201px]:grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_repeat(2,minmax(145px,0.8fr))]"
        >
          <ProSearchInput
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Client ou référence"
          />
          <ProField label="Statut">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                pushQuery({ status: e.target.value, from, to });
              }}
              className={proInputClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </ProField>
          <ProField label="Du">
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                pushQuery({ status, from: e.target.value, to });
              }}
              className={proInputClass}
            />
          </ProField>
          <ProField label="Au">
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                pushQuery({ status, from, to: e.target.value });
              }}
              className={proInputClass}
            />
          </ProField>
        </ProFilterPanel>
        {rangeInvalid ? (
          <p role="alert" className="-mt-2 text-xs text-[var(--pro-danger-title)]">
            La date de début doit précéder la date de fin.
          </p>
        ) : null}

        <ProResultsPanel title="Liste des transactions" count={busy ? "Chargement des paiements…" : countLabel} side={<span className="hidden md:inline">Plus récentes en premier</span>}>
          {pageItems.length ? (
            <>
              <div className="hidden xl:block">
                <ProTable minWidth={1000} headers={["Date", "Client", "Référence", "Montant", "Mode", "Statut", "Actions"]}>
                  {pageItems.map((p) => (
                    <tr key={p.id} className={proTrClass}>
                      <td className={`${proTdClass} whitespace-nowrap`}>{formatDateTime(p.createdAt)}</td>
                      <td className={proTdClass}>
                        <strong className="line-clamp-2 break-words font-bold">{p.clientName || "—"}</strong>
                      </td>
                      <td className={proTdClass}>
                        <span className="inline-block max-w-[160px] truncate align-bottom font-mono text-xs text-[var(--pro-text-muted)]" title={p.leadRequestId}>
                          {p.leadRequestId}
                        </span>
                      </td>
                      <td className={`${proTdClass} whitespace-nowrap font-bold tabular-nums`}>{formatAmountFromCents(p.amount, p.currency)}</td>
                      <td className={proTdClass}>{modeLabel(p.mode)}</td>
                      <td className={proTdClass}>
                        <span className={leadPaymentStatusBadgeClass(p.status)}>{labelLeadPaymentStatus(p.status)}</span>
                      </td>
                      <td className={proTdClass}>
                        <div className="flex items-center gap-[7px]">
                          <ProOpenLink href={`/pro/demandes/${p.leadRequestId}`} label={`Ouvrir le dossier de ${p.clientName || "ce client"}`} />
                          <ReceiptLink p={p} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </ProTable>
              </div>

              <div className="grid gap-2.5 xl:hidden">
                {pageItems.map((p) => (
                  <ProRequestCard
                    key={p.id}
                    name={p.clientName || "—"}
                    badge={<span className={leadPaymentStatusBadgeClass(p.status)}>{labelLeadPaymentStatus(p.status)}</span>}
                    route={`${formatAmountFromCents(p.amount, p.currency)} · ${modeLabel(p.mode)}`}
                    meta={[formatDateTime(p.createdAt), `Réf. ${p.leadRequestId}`]}
                    actions={
                      <>
                        <ProOpenLink href={`/pro/demandes/${p.leadRequestId}`} />
                        <ReceiptLink p={p} />
                      </>
                    }
                  />
                ))}
              </div>

              <ProPagination page={currentPage} pages={pages} onPage={setPage} />
            </>
          ) : busy || rangeInvalid ? null : (
            <EmptyState
              icon="search"
              title="Aucune transaction trouvée"
              message="Essayez une autre recherche ou retirez un filtre."
              actionLabel={hasFilters ? "Effacer les filtres" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          )}
        </ProResultsPanel>
      </div>
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
