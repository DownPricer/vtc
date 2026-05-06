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
  clientOnlinePaymentPreferenceBadgeClass,
  labelClientOnlinePaymentPreference,
} from "@/lib/clientPaymentPreferenceUi";
import {
  createDemandePaymentLink,
  mapDemandePaymentLinkErrorToFr,
  mapPaymentLinkEmailErrorCodeToFr,
  ProPaymentsApiError,
  type DemandePaymentLinkData,
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

type PaymentSnapshot = {
  id: string;
  status: string;
  mode: string;
  amount: number;
  currency: string;
  stripePaymentLinkUrl: string | null;
  stripeReceiptUrl: string | null;
  stripeCheckoutSessionId: string | null;
  checkoutExpiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
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
  clientWantsOnlinePayment?: boolean | null;
  payments?: PaymentSnapshot[];
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

function paymentStatusExplanation(ps?: string | null): string {
  switch (ps) {
    case "NONE":
      return "Aucun lien de paiement créé pour cette demande.";
    case "PENDING":
      return "Préparation du paiement : session en cours de création.";
    case "LINK_SENT":
      return "Lien de paiement envoyé — paiement en attente côté client.";
    case "PAID":
      return "Paiement validé.";
    case "FAILED":
      return "Paiement échoué.";
    case "EXPIRED":
      return "Lien expiré.";
    case "CANCELLED":
      return "Lien annulé.";
    case "REFUNDED":
      return "Remboursé.";
    default:
      return "";
  }
}

function bannerForPaymentLink(data: DemandePaymentLinkData, wantsEmail: boolean): string {
  const reused = data.reusedExistingCheckout === true;
  const base = reused ? "Lien existant récupéré" : "Nouveau lien de paiement créé";
  if (wantsEmail && data.emailSent === true) {
    return `${base} — e-mail envoyé au client.`;
  }
  if (wantsEmail && data.emailSent === false) {
    return `${base} — l’e-mail n’a pas pu être envoyé (${mapPaymentLinkEmailErrorCodeToFr(data.emailErrorCode ?? "")}).`;
  }
  if (!wantsEmail) {
    return reused ? `${base}. Partagez le lien manuellement.` : `${base}.`;
  }
  return base;
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
  /** Si le client a choisi « sur place », permet tout de même d’afficher les contrôles de lien. */
  const [allowPaymentLinkDespitePreference, setAllowPaymentLinkDespitePreference] = useState(false);
  const [lastCheckout, setLastCheckout] = useState<{
    url: string;
    amountCents: number;
    currency: string;
    mode: "full" | "deposit";
    /** True si l’utilisateur a demandé l’envoi auto (sinon l’API renvoie aussi emailSent: false). */
    emailDeliveryRequested: boolean;
    emailSent?: boolean;
    emailErrorCode?: string;
    reusedExistingCheckout?: boolean;
  } | null>(null);

  useEffect(() => {
    const email = item?.clientEmail?.trim() ?? "";
    if (!item?.id) return;
    setSendPaymentEmail(email.includes("@"));
  }, [item?.id, item?.clientEmail]);

  useEffect(() => {
    setAllowPaymentLinkDespitePreference(false);
    setLastCheckout(null);
  }, [item?.id]);

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

  async function handlePaymentLinkAction(forceNew: boolean) {
    if (!id || !item) return;
    const blockedByPreference =
      item.clientWantsOnlinePayment === false && !allowPaymentLinkDespitePreference && !forceNew;
    if (blockedByPreference) return;
    setPaymentError("");
    setPaymentBusy(true);
    try {
      const wantsEmail = Boolean(sendPaymentEmail && hasValidClientEmail(item));
      const data = await createDemandePaymentLink(String(id), {
        mode: paymentModeChoice,
        sendEmail: wantsEmail,
        forceNewCheckoutSession: forceNew,
      });
      setLastCheckout({
        url: data.checkoutUrl,
        amountCents: data.amount,
        currency: data.currency,
        mode: paymentModeChoice,
        emailDeliveryRequested: wantsEmail,
        emailSent: data.emailSent,
        emailErrorCode: data.emailErrorCode,
        reusedExistingCheckout: data.reusedExistingCheckout,
      });
      setBanner(bannerForPaymentLink(data, wantsEmail));
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

  async function handleRecreatePaymentLink() {
    if (
      !confirm(
        "Créer une nouvelle session de paiement Stripe ? Le client devra utiliser le nouveau lien ; les anciennes sessions ouvertes peuvent être invalidées."
      )
    ) {
      return;
    }
    setAllowPaymentLinkDespitePreference(true);
    await handlePaymentLinkAction(true);
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

  const paidPayment = useMemo(() => item?.payments?.find((p) => p.status === "PAID"), [item?.payments]);

  const pendingLinkPayment = useMemo(
    () => item?.payments?.find((p) => p.status === "LINK_SENT" || p.status === "PENDING"),
    [item?.payments]
  );

  const checkoutUrlFromServer = pendingLinkPayment?.stripePaymentLinkUrl?.trim() ?? "";
  const checkoutUrlToShow = lastCheckout?.url || checkoutUrlFromServer || "";

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
                description="Stripe Checkout — le client paie sur une page sécurisée. La confirmation définitive est traitée par le webhook Stripe ; cet écran reflète l’état en base."
              />

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Préférence client</span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${clientOnlinePaymentPreferenceBadgeClass(item.clientWantsOnlinePayment)}`}
                >
                  {labelClientOnlinePaymentPreference(item.clientWantsOnlinePayment)}
                </span>
                {item.clientWantsOnlinePayment === true ? (
                  <span className="text-xs text-[var(--pro-text-soft)]">Le client a demandé un lien s&apos;il souhaite payer en ligne après accord.</span>
                ) : null}
              </div>

              <div className="mt-5 space-y-4 text-sm text-[var(--pro-text-muted)]">
                <p>Les paiements en ligne transitent par Stripe ; aucune carte n&apos;est saisie sur votre site.</p>

                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-accent)]">Statut paiement (demande)</p>
                  <p className="mt-3 inline-flex">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(item.paymentStatus)}`}
                    >
                      {labelLeadPaymentStatus(item.paymentStatus)}
                    </span>
                  </p>
                  {paymentStatusExplanation(item.paymentStatus) ? (
                    <p className="mt-3 text-xs text-[var(--pro-text-soft)]">{paymentStatusExplanation(item.paymentStatus)}</p>
                  ) : null}
                </div>

                {item.paymentStatus === "PAID" && paidPayment ? (
                  <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Paiement validé</p>
                    <p className="mt-2 text-sm">
                      Montant encaissé :{" "}
                      <span className="font-semibold">{formatAmountFromCents(paidPayment.amount, paidPayment.currency)}</span>
                    </p>
                    {paidPayment.stripeReceiptUrl?.trim() ? (
                      <a
                        href={paidPayment.stripeReceiptUrl.trim()}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-4 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold ${actionButtonClass("primary")}`}
                      >
                        Voir le reçu Stripe
                      </a>
                    ) : (
                      <p className="mt-2 text-xs text-emerald-800">Le reçu Stripe sera disponible dès qu&apos;il est émis par Stripe.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {item.clientWantsOnlinePayment === false ? (
                      <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
                        <p className="font-semibold">Paiement en ligne non demandé par le client</p>
                        <p className="mt-2 text-sm text-amber-900">
                          La création de lien est masquée par défaut. Cochez l&apos;option ci-dessous uniquement si vous l&apos;avez convenu avec le client.
                        </p>
                        <label className="mt-4 flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--pro-border)]"
                            checked={allowPaymentLinkDespitePreference}
                            onChange={(e) => setAllowPaymentLinkDespitePreference(e.target.checked)}
                          />
                          <span className="text-sm font-medium">Créer quand même un lien de paiement en ligne</span>
                        </label>
                      </div>
                    ) : null}

                    {item.clientWantsOnlinePayment === false && !allowPaymentLinkDespitePreference ? null : (
                      <>
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
                            disabled={
                              paymentBusy ||
                              busy ||
                              (item.clientWantsOnlinePayment === false && !allowPaymentLinkDespitePreference)
                            }
                            onClick={() => void handlePaymentLinkAction(false)}
                            className={`rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass("primary")}`}
                          >
                            {paymentBusy
                              ? checkoutUrlToShow
                                ? "Récupération…"
                                : "Création…"
                              : checkoutUrlToShow
                                ? "Récupérer / ouvrir le lien"
                                : "Créer le lien de paiement"}
                          </button>
                        </div>

                        {checkoutUrlToShow ? (
                          <div className="rounded-[22px] border border-emerald-300/30 bg-[var(--pro-panel-muted)] px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                              {item.paymentStatus === "LINK_SENT"
                                ? "Lien envoyé / paiement en attente"
                                : lastCheckout?.reusedExistingCheckout === false
                                  ? "Lien Checkout"
                                  : "Lien Checkout"}
                            </p>
                            <p className="mt-2 text-sm font-medium text-emerald-900">
                              {lastCheckout?.reusedExistingCheckout === true
                                ? "Lien existant récupéré — aucune nouvelle session créée."
                                : lastCheckout?.reusedExistingCheckout === false
                                  ? "Nouvelle session Stripe générée."
                                  : "Session Stripe disponible pour cette demande."}
                            </p>

                            {lastCheckout?.emailDeliveryRequested && lastCheckout.emailSent === true ? (
                              <p className="mt-2 text-sm text-emerald-800">E-mail envoyé au client.</p>
                            ) : null}
                            {lastCheckout?.emailDeliveryRequested && lastCheckout.emailSent === false ? (
                              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                                <p className="font-medium">Lien disponible, mais e-mail non envoyé</p>
                                <p className="mt-1 text-amber-900">{mapPaymentLinkEmailErrorCodeToFr(lastCheckout.emailErrorCode ?? "")}</p>
                              </div>
                            ) : null}

                            <p className="mt-3 text-sm text-[var(--pro-text)]">
                              Montant :{" "}
                              <span className="font-semibold text-[var(--pro-accent)]">
                                {formatAmountFromCents(
                                  lastCheckout?.amountCents ?? pendingLinkPayment?.amount ?? 0,
                                  lastCheckout?.currency ?? pendingLinkPayment?.currency ?? "eur"
                                )}
                              </span>{" "}
                              · Mode :{" "}
                              <span className="font-medium">
                                {lastCheckout?.mode === "deposit" || pendingLinkPayment?.mode === "DEPOSIT"
                                  ? "Acompte"
                                  : "Paiement total"}
                              </span>
                            </p>
                            <p className="mt-2 break-all font-mono text-xs text-[var(--pro-text-soft)]">{checkoutUrlToShow}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => void copyCheckoutUrl(checkoutUrlToShow)}
                                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${actionButtonClass("neutral")}`}
                              >
                                Copier le lien
                              </button>
                              <a
                                href={checkoutUrlToShow}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition ${actionButtonClass("primary")}`}
                              >
                                Ouvrir le lien
                              </a>
                              <button
                                type="button"
                                disabled={paymentBusy || busy}
                                onClick={() => void handleRecreatePaymentLink()}
                                className={`rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-accent-soft)] disabled:opacity-50`}
                              >
                                Recréer un lien
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </>
                )}
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
