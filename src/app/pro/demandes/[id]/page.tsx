"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clientRowsFromFlat, paiementRowsFromFlat, prestationRowsFromFlat } from "@/components/pro/flatPresentation";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import {
  actionButtonClass,
  buildStatusActionBanner,
  formatDateTime,
  formatPrice,
  formatValue,
  getDisplayName,
  isUsefulValue,
  labelKind,
  labelStatus,
  mapApiErrorToFr,
  statusActionList,
  statusBadgeClass,
  translateAction,
  translatePayment,
  translateStatus,
  type PatchStatusResponseMeta,
} from "@/components/pro/proDisplay";
import { labelLeadPaymentStatus, leadPaymentStatusBadgeClass } from "@/lib/leadPaymentStatusUi";
import {
  createDemandePaymentLink,
  mapDemandePaymentLinkErrorToFr,
  mapPaymentLinkEmailErrorCodeToFr,
  ProPaymentsApiError,
} from "@/lib/proPaymentsClient";
import { proApi } from "@/lib/proApi";

type LeadStatus =
  | "new"
  | "pending"
  | "accepted"
  | "refused"
  | "processed"
  | "archived"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "expired";

type HistoryRow = {
  id: string;
  newStatus: string;
  previousStatus?: string | null;
  createdAt: string;
  note?: string | null;
  changedByUser?: { id: string; email: string } | null;
};

type LeadDetail = {
  id: string;
  createdAt: string;
  kind: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  operatorNote?: string | null;
  flatPayload: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  paymentStatus?: string | null;
  customerDecisionMailSentAt?: string | null;
  customerDecisionMailLastError?: string | null;
  history: HistoryRow[];
};

function pickReference(flat: Record<string, unknown>, fallbackId: string): string {
  const raw = flat.ID ?? flat.id;
  return isUsefulValue(raw) ? String(raw).trim() : fallbackId;
}

function displayRows(values: Array<{ label: string; value: unknown }>) {
  return values.map((entry) => formatValue(entry.label, entry.value)).filter(Boolean) as { label: string; value: string }[];
}

function hasValidClientEmail(item: LeadDetail | null): boolean {
  const e = item?.clientEmail?.trim() ?? "";
  return e.includes("@");
}

function formatAmountFromCents(cents: number, currency: string): string {
  const eur = cents / 100;
  const cur = currency.toLowerCase() === "eur" ? "EUR" : currency.toUpperCase();
  return `${eur.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
}

export default function ProDemandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LeadDetail | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentModeChoice, setPaymentModeChoice] = useState<"full" | "deposit">("full");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [sendPaymentEmail, setSendPaymentEmail] = useState(true);
  const [lastCheckout, setLastCheckout] = useState<{
    url: string;
    amountCents: number;
    currency: string;
    mode: "full" | "deposit";
    /** True si l’utilisateur a demandé l’envoi auto (sinon l’API renvoie aussi emailSent: false). */
    emailDeliveryRequested: boolean;
    emailSent?: boolean;
    emailErrorCode?: string;
  } | null>(null);

  useEffect(() => {
    const email = item?.clientEmail?.trim() ?? "";
    if (!item?.id) return;
    setSendPaymentEmail(email.includes("@"));
  }, [item?.id, item?.clientEmail]);

  async function load() {
    try {
      setError("");
      const json = await proApi(`/requests/${id}`);
      const data = json.data as LeadDetail;
      setItem(data);
      setNote(data.operatorNote || "");
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(""), 4500);
    return () => window.clearTimeout(timer);
  }, [banner]);

  async function patchStatus(next: LeadStatus) {
    if (!item) return;
    setBusy(true);
    setError("");
    try {
      const json = await proApi(`/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      const meta = json.meta as PatchStatusResponseMeta | undefined;
      setBanner(buildStatusActionBanner(next, item.kind, meta));
      await load();
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message) || "Impossible de mettre à jour la demande pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    setBusy(true);
    setError("");
    try {
      await proApi(`/requests/${id}/note`, {
        method: "PATCH",
        body: JSON.stringify({ note }),
      });
      setBanner("Note enregistrée.");
      await load();
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreatePaymentLink() {
    if (!id || !item) return;
    setPaymentError("");
    setPaymentBusy(true);
    try {
      const wantsEmail = Boolean(item && sendPaymentEmail && hasValidClientEmail(item));
      const data = await createDemandePaymentLink(String(id), {
        mode: paymentModeChoice,
        sendEmail: wantsEmail,
      });
      setLastCheckout({
        url: data.checkoutUrl,
        amountCents: data.amount,
        currency: data.currency,
        mode: paymentModeChoice,
        emailDeliveryRequested: wantsEmail,
        emailSent: data.emailSent,
        emailErrorCode: data.emailErrorCode,
      });
      setBanner("Lien créé — copiez-le ou ouvrez-le pour le client.");
      await load();
    } catch (e) {
      if (e instanceof ProPaymentsApiError) {
        setPaymentError(mapDemandePaymentLinkErrorToFr(e.code, e.message));
      } else {
        setPaymentError(mapApiErrorToFr((e as Error).message) || "Impossible de créer le lien de paiement.");
      }
    } finally {
      setPaymentBusy(false);
    }
  }

  async function copyCheckoutUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setBanner("Lien copié dans le presse-papiers.");
    } catch {
      setPaymentError("Impossible de copier automatiquement — sélectionnez l’URL manuellement.");
    }
  }

  const flatPayload = useMemo(() => (item?.flatPayload ?? {}) as Record<string, unknown>, [item?.flatPayload]);
  const extrasClient = useMemo(() => clientRowsFromFlat(flatPayload), [flatPayload]);
  const prestation = useMemo(() => prestationRowsFromFlat(flatPayload), [flatPayload]);
  const paiementFlat = useMemo(() => paiementRowsFromFlat(flatPayload), [flatPayload]);

  const pricing = useMemo(() => {
    if (!item?.pricingResult) return [];
    const raw = item.pricingResult as Record<string, unknown>;
    const paymentMethod = translatePayment(String(raw.paymentMethod ?? ""));
    const paymentStatusRaw = String(raw.paymentStatus ?? "");
    const paymentStatus = isUsefulValue(paymentStatusRaw) ? translateStatus(paymentStatusRaw) : "";
    return displayRows([
      { label: "Tarif total", value: raw.tarif ? formatPrice(raw.tarif) : "" },
      { label: "Mode de paiement", value: paymentMethod },
      { label: "Statut paiement", value: paymentStatus },
    ]);
  }, [item]);

  const kind = item?.kind ?? "";
  const status = item?.status ?? "";
  const actions = statusActionList(status, kind);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            eyebrow="Fiche demande"
            title={item ? labelKind(item.kind) : "Demande"}
            description="Consultez les informations client, mettez à jour le statut et suivez l'historique."
            action={
              <Link
                href="/pro/demandes"
                className="inline-flex rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-medium text-[var(--pro-text-soft)] hover:bg-[var(--pro-accent-soft)]"
              >
                Retour
              </Link>
            }
          />
          {item ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                {labelStatus(item.status)}
              </span>
              <span className="text-sm text-[var(--pro-text-muted)]">Référence : {pickReference(flatPayload, item.id)}</span>
              <span className="text-sm text-[var(--pro-text-muted)]">Créée le {formatDateTime(item.createdAt)}</span>
            </div>
          ) : null}
        </ProPanel>

        {banner ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{banner}</p> : null}
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {!item ? (
          <EmptyState message="Chargement de la demande..." />
        ) : (
          <>
            <ProPanel>
              <ProSectionHeader title="Actions" description="Choisissez une action operateur pour cette demande." />
              <div className="mt-5 flex flex-wrap gap-3">
                {actions.map((action) => (
                  <button
                    key={action.nextStatus}
                    type="button"
                    disabled={busy}
                    onClick={() => patchStatus(action.nextStatus as LeadStatus)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass(action.intent)}`}
                  >
                    {translateAction(action.action)}
                  </button>
                ))}
              </div>
              {(kind === "devis" || kind === "reservation") && (item.customerDecisionMailSentAt || item.customerDecisionMailLastError) ? (
                <div className="mt-4 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text-soft)]">
                  {item.customerDecisionMailSentAt ? <p>Le client a été notifié par e-mail le {formatDateTime(item.customerDecisionMailSentAt)}.</p> : null}
                  {item.customerDecisionMailLastError ? <p className="text-rose-700">La demande a été mise à jour, mais l&apos;e-mail client n&apos;a pas pu être envoyé.</p> : null}
                </div>
              ) : null}
            </ProPanel>

            <ProPanel>
              <ProSectionHeader
                title="Paiement en ligne"
                description="Créez un lien Stripe Checkout pour permettre au client de régler cette demande en ligne. Vous pouvez envoyer le lien automatiquement par e-mail si une adresse client est disponible."
              />
              <div className="mt-5 space-y-4 text-sm text-[var(--pro-text-muted)]">
                <p>Le paiement s’effectue sur une page sécurisée Stripe.</p>
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-accent)]">Statut paiement (demande)</p>
                  <p className="mt-3 inline-flex">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(item.paymentStatus)}`}
                    >
                      {labelLeadPaymentStatus(item.paymentStatus)}
                    </span>
                  </p>
                  {item.paymentStatus === "LINK_SENT" && !lastCheckout ? (
                    <p className="mt-2 text-xs text-[var(--pro-text-soft)]">
                      Un lien actif peut déjà exister. Cliquez sur « Créer le lien de paiement » pour récupérer l’URL si la session est encore valide
                      (l’API réutilise le lien ouvert).
                    </p>
                  ) : null}
                </div>
                {paymentError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{paymentError}</p>
                ) : null}
                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-4">
                  <label className={`flex cursor-pointer items-start gap-3 ${!hasValidClientEmail(item) ? "cursor-not-allowed opacity-80" : ""}`}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--pro-border)] disabled:cursor-not-allowed"
                      checked={sendPaymentEmail && hasValidClientEmail(item)}
                      disabled={!hasValidClientEmail(item)}
                      onChange={(e) => setSendPaymentEmail(e.target.checked)}
                    />
                    <span>
                      <span className="font-medium text-[var(--pro-text)]">Envoyer automatiquement le lien par e-mail au client</span>
                      {!hasValidClientEmail(item) ? (
                        <span className="mt-1 block text-xs text-[var(--pro-text-soft)]">Aucun e-mail client disponible.</span>
                      ) : null}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="payment-mode-select" className="block text-xs font-semibold text-[var(--pro-text-soft)]">
                      Mode de paiement Stripe
                    </label>
                    <select
                      id="payment-mode-select"
                      value={paymentModeChoice}
                      onChange={(e) => setPaymentModeChoice(e.target.value as "full" | "deposit")}
                      className="mt-1 w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none"
                    >
                      <option value="full">Paiement total</option>
                      <option value="deposit">Acompte</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={paymentBusy || busy}
                    onClick={() => void handleCreatePaymentLink()}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass("primary")}`}
                  >
                    {paymentBusy ? "Création…" : "Créer le lien de paiement"}
                  </button>
                </div>
                {lastCheckout ? (
                  <div className="rounded-[22px] border border-emerald-300/30 bg-[var(--pro-panel-muted)] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Lien Checkout</p>
                    <p className="mt-2 text-sm font-medium text-emerald-900">Lien créé</p>
                    {lastCheckout.emailDeliveryRequested && lastCheckout.emailSent === true ? (
                      <p className="mt-2 text-sm text-emerald-800">E-mail envoyé au client.</p>
                    ) : null}
                    {lastCheckout.emailDeliveryRequested && lastCheckout.emailSent === false ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                        <p className="font-medium">Lien créé, mais e-mail non envoyé</p>
                        <p className="mt-1 text-amber-900">
                          {mapPaymentLinkEmailErrorCodeToFr(lastCheckout.emailErrorCode ?? "")}
                        </p>
                      </div>
                    ) : null}
                    <p className="mt-3 text-sm text-[var(--pro-text)]">
                      Montant :{" "}
                      <span className="font-semibold text-[var(--pro-accent)]">
                        {formatAmountFromCents(lastCheckout.amountCents, lastCheckout.currency)}
                      </span>{" "}
                      · Mode :{" "}
                      <span className="font-medium">{lastCheckout.mode === "full" ? "Paiement total" : "Acompte"}</span>
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-[var(--pro-text-soft)]">{lastCheckout.url}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void copyCheckoutUrl(lastCheckout.url)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${actionButtonClass("neutral")}`}
                      >
                        Copier le lien
                      </button>
                      <a
                        href={lastCheckout.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition ${actionButtonClass("primary")}`}
                      >
                        Ouvrir le lien
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </ProPanel>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <ProPanel>
                <ProSectionHeader title="Client" description="Coordonnées et informations de contact." />
                <div className="mt-5 space-y-3 text-sm">
                  <p className="text-base font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                  {isUsefulValue(item.clientPhone) ? (
                    <a href={`tel:${String(item.clientPhone).replace(/\s/g, "")}`} className="block font-medium text-[var(--pro-accent)] hover:brightness-110">
                      {item.clientPhone}
                    </a>
                  ) : null}
                  {isUsefulValue(item.clientEmail) ? (
                    <a href={`mailto:${item.clientEmail}`} className="block text-[var(--pro-text-soft)] hover:text-[var(--pro-accent)]">
                      {item.clientEmail}
                    </a>
                  ) : null}
                  {extrasClient.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                </div>
              </ProPanel>

              <ProPanel>
                <ProSectionHeader title="Tarif et paiement" description="Montant, mode de paiement et suivi." />
                <div className="mt-5 space-y-3">
                  {pricing.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                  {paiementFlat.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                  {!pricing.length && !paiementFlat.length ? <EmptyState message="Aucune information de paiement disponible." /> : null}
                </div>
              </ProPanel>
            </div>

            <ProPanel>
              <ProSectionHeader title="Prestation et trajet" description="Informations utiles pour organiser la course." />
              {prestation.length ? (
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {prestation.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-sm text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucune information de prestation disponible." />
              )}
            </ProPanel>

            <ProPanel>
              <ProSectionHeader title="Note interne" description="Visible uniquement dans l'espace professionnel." />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                placeholder="Ajoutez une note utile pour votre équipe."
                className="mt-5 w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
              />
              <button type="button" disabled={busy} onClick={saveNote} className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass("primary")}`}>
                Enregistrer la note
              </button>
            </ProPanel>

            <ProPanel>
              <ProSectionHeader title="Historique" description="Suivi des changements effectués sur cette demande." />
              <div className="mt-5 space-y-3">
                {item.history.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                    <p className="text-sm text-[var(--pro-text-soft)]">
                      <span className="font-medium text-[var(--pro-text-muted)]">{formatDateTime(row.createdAt)}</span>
                      {" · "}
                      {row.previousStatus ? `${labelStatus(row.previousStatus)} -> ` : "Création -> "}
                      {labelStatus(row.newStatus)}
                    </p>
                    {row.changedByUser?.email ? <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Opérateur : {row.changedByUser.email}</p> : null}
                    {isUsefulValue(row.note) ? <p className="mt-2 text-sm text-[var(--pro-text-soft)]">{row.note}</p> : null}
                  </div>
                ))}
                {!item.history.length ? <EmptyState message="Aucun historique disponible." /> : null}
              </div>
            </ProPanel>
          </>
        )}
      </ProShell>
    </ProGuard>
  );
}
