"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clientRowsFromFlat, paiementRowsFromFlat, prestationRowsFromFlat } from "@/components/pro/flatPresentation";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProActionLink, ProAlert, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
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
      return "Aucun lien de paiement cree pour cette demande.";
    case "PENDING":
      return "Preparation du paiement : session en cours de creation.";
    case "LINK_SENT":
      return "Lien de paiement envoye, paiement en attente cote client.";
    case "PAID":
      return "Paiement valide.";
    case "FAILED":
      return "Paiement echoue.";
    case "EXPIRED":
      return "Lien expire.";
    case "CANCELLED":
      return "Lien annule.";
    case "REFUNDED":
      return "Paiement rembourse.";
    default:
      return "";
  }
}

function bannerForPaymentLink(data: DemandePaymentLinkData, wantsEmail: boolean): string {
  const reused = data.reusedExistingCheckout === true;
  const base = reused ? "Lien existant recupere" : "Nouveau lien de paiement cree";
  if (wantsEmail && data.emailSent === true) {
    return `${base}. E-mail envoye au client.`;
  }
  if (wantsEmail && data.emailSent === false) {
    return `${base}. L'e-mail n'a pas pu etre envoye (${mapPaymentLinkEmailErrorCodeToFr(data.emailErrorCode ?? "")}).`;
  }
  if (!wantsEmail) {
    return reused ? `${base}. Partagez le lien manuellement.` : `${base}.`;
  }
  return base;
}

function commentFromFlat(flat: Record<string, unknown>): string {
  const raw = flat.Commentaires ?? flat.Observations;
  return isUsefulValue(raw) ? String(raw).trim() : "";
}

function shouldConfirmStatus(next: LeadStatus): boolean {
  return ["refused", "cancelled", "archived"].includes(next);
}

function confirmMessage(next: LeadStatus): string {
  switch (next) {
    case "refused":
      return "Confirmer le refus de cette demande ?";
    case "cancelled":
      return "Confirmer l'annulation de cette demande ?";
    case "archived":
      return "Confirmer l'archivage de cette demande ?";
    default:
      return "Confirmer cette action ?";
  }
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--pro-text)]">{value}</p>
    </div>
  );
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
  const [allowPaymentLinkDespitePreference, setAllowPaymentLinkDespitePreference] = useState(false);
  const [lastCheckout, setLastCheckout] = useState<{
    url: string;
    amountCents: number;
    currency: string;
    mode: "full" | "deposit";
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
    const timer = window.setTimeout(() => setBanner(""), 5000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  async function patchStatus(next: LeadStatus) {
    if (!item) return;
    if (shouldConfirmStatus(next) && !window.confirm(confirmMessage(next))) return;
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
      setError(mapApiErrorToFr((e as Error).message) || "Impossible de mettre a jour la demande pour le moment.");
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
      setBanner("Note enregistree.");
      await load();
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function handlePaymentLinkAction(forceNew: boolean) {
    if (!id || !item) return;
    const blockedByPreference = item.clientWantsOnlinePayment === false && !allowPaymentLinkDespitePreference && !forceNew;
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
        setPaymentError(mapApiErrorToFr((e as Error).message) || "Impossible de creer le lien de paiement.");
      }
    } finally {
      setPaymentBusy(false);
    }
  }

  async function handleRecreatePaymentLink() {
    if (!window.confirm("Creer une nouvelle session de paiement Stripe ? Le client devra utiliser le nouveau lien.")) {
      return;
    }
    setAllowPaymentLinkDespitePreference(true);
    await handlePaymentLinkAction(true);
  }

  async function copyCheckoutUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setBanner("Lien copie dans le presse-papiers.");
    } catch {
      setPaymentError("Impossible de copier automatiquement le lien.");
    }
  }

  const flatPayload = useMemo(() => (item?.flatPayload ?? {}) as Record<string, unknown>, [item?.flatPayload]);
  const extrasClient = useMemo(() => clientRowsFromFlat(flatPayload), [flatPayload]);
  const prestationRows = useMemo(() => prestationRowsFromFlat(flatPayload), [flatPayload]);
  const paymentFlatRows = useMemo(() => paiementRowsFromFlat(flatPayload), [flatPayload]);
  const clientComment = useMemo(() => commentFromFlat(flatPayload), [flatPayload]);

  const prestation = useMemo(
    () => prestationRows.filter((row) => row.label !== "Commentaire client"),
    [prestationRows]
  );

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
      { label: "Montant annonce", value: raw.tarif ? formatPrice(raw.tarif) : "" },
      { label: "Reglement choisi", value: paymentMethod },
      { label: "Etat saisi sur le formulaire", value: paymentStatus },
    ]);
  }, [item]);

  const summaryCards = useMemo(
    () => [
      { label: "Type", value: item ? labelKind(item.kind) : "" },
      { label: "Statut", value: item ? labelStatus(item.status) : "" },
      { label: "Montant", value: pricing[0]?.value || "Aucun montant" },
      { label: "Paiement", value: item ? labelLeadPaymentStatus(item.paymentStatus) : "" },
    ],
    [item, pricing]
  );

  const latestHistory = item?.history?.[0] ?? null;
  const actions = statusActionList(item?.status ?? "", item?.kind ?? "");

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        {!item ? (
          <>
            {error ? <ProAlert tone="error">{error}</ProAlert> : null}
            <EmptyState message="Chargement de la demande..." />
          </>
        ) : (
          <>
            <ProPanel>
              <ProSectionHeader
                eyebrow="Fiche demande"
                title={`${labelKind(item.kind)} · ${getDisplayName(item.clientName)}`}
                description="Vue operateur restructuree pour lire rapidement le dossier, agir sur le statut et suivre le paiement."
                action={<ProActionLink href="/pro/demandes">Retour aux demandes</ProActionLink>}
              />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                  {labelStatus(item.status)}
                </span>
                <span className="rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--pro-text-soft)]">
                  Reference : {pickReference(flatPayload, item.id)}
                </span>
                <span className="rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--pro-text-soft)]">
                  Creee le {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {actions.map((action) => (
                  <button
                    key={action.nextStatus}
                    type="button"
                    disabled={busy}
                    onClick={() => void patchStatus(action.nextStatus as LeadStatus)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass(action.intent)}`}
                  >
                    {translateAction(action.action)}
                  </button>
                ))}
              </div>
            </ProPanel>

            {banner ? <ProAlert tone="success">{banner}</ProAlert> : null}
            {error ? <ProAlert tone="error">{error}</ProAlert> : null}

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.32fr)_380px]">
              <div className="space-y-6">
                <ProPanel>
                  <ProSectionHeader title="Resume operationnel" description="Les informations essentielles a lire en premier." />
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                      <DetailCard key={card.label} label={card.label} value={card.value} />
                    ))}
                  </div>
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader title="Trajet et prestation" description="Details du service demande, organises de facon plus lisible." />
                  {prestation.length ? (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {prestation.map((row) => (
                        <DetailCard key={`${row.label}-${row.value}`} label={row.label} value={row.value} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="Aucune information de prestation disponible." />
                  )}
                </ProPanel>

                {clientComment ? (
                  <ProPanel>
                    <ProSectionHeader title="Commentaire client" description="Message libre laisse au moment de la demande." />
                    <div className="mt-6 rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-5 py-5 text-sm leading-7 text-[var(--pro-text-soft)]">
                      {clientComment}
                    </div>
                  </ProPanel>
                ) : null}

                <ProPanel>
                  <ProSectionHeader
                    title="Tarif et paiement"
                    description="Montants annonces, preference du client et pilotage du paiement en ligne."
                  />

                  <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="space-y-4">
                      {pricing.map((row) => (
                        <DetailCard key={row.label} label={row.label} value={row.value} />
                      ))}
                      {paymentFlatRows.map((row) => (
                        <DetailCard key={row.label} label={row.label} value={row.value} />
                      ))}
                      {!pricing.length && !paymentFlatRows.length ? <EmptyState message="Aucune information tarifaire disponible." /> : null}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--pro-text-muted)]">Preference client</span>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${clientOnlinePaymentPreferenceBadgeClass(item.clientWantsOnlinePayment)}`}
                          >
                            {labelClientOnlinePaymentPreference(item.clientWantsOnlinePayment)}
                          </span>
                        </div>
                        <div className="mt-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${leadPaymentStatusBadgeClass(item.paymentStatus)}`}>
                            {labelLeadPaymentStatus(item.paymentStatus)}
                          </span>
                          {paymentStatusExplanation(item.paymentStatus) ? (
                            <p className="mt-3 text-sm leading-6 text-[var(--pro-text-soft)]">{paymentStatusExplanation(item.paymentStatus)}</p>
                          ) : null}
                        </div>
                      </div>

                      {item.paymentStatus === "PAID" && paidPayment ? (
                        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-5 text-emerald-950">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Paiement valide</p>
                          <p className="mt-3 text-sm">
                            Montant encaisse : <span className="font-semibold">{formatAmountFromCents(paidPayment.amount, paidPayment.currency)}</span>
                          </p>
                          {paidPayment.stripeReceiptUrl?.trim() ? (
                            <a
                              href={paidPayment.stripeReceiptUrl.trim()}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-4 inline-flex rounded-2xl px-4 py-2.5 text-sm font-semibold ${actionButtonClass("primary")}`}
                            >
                              Voir le recu Stripe
                            </a>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          {item.clientWantsOnlinePayment === false ? (
                            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-amber-950">
                              <p className="font-semibold">Paiement en ligne non demande par le client</p>
                              <p className="mt-2 text-sm leading-6 text-amber-900">
                                Le lien de paiement est masque par defaut. Activez-le seulement si cela a ete convenu avec le client.
                              </p>
                              <label className="mt-4 flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--pro-border)]"
                                  checked={allowPaymentLinkDespitePreference}
                                  onChange={(e) => setAllowPaymentLinkDespitePreference(e.target.checked)}
                                />
                                <span className="text-sm font-medium">Afficher quand meme le paiement en ligne</span>
                              </label>
                            </div>
                          ) : null}

                          {item.clientWantsOnlinePayment === false && !allowPaymentLinkDespitePreference ? null : (
                            <>
                              {paymentError ? <ProAlert tone="error">{paymentError}</ProAlert> : null}

                              <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-5 py-5">
                                <label className={`flex cursor-pointer items-start gap-3 ${!hasValidClientEmail(item) ? "cursor-not-allowed opacity-70" : ""}`}>
                                  <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--pro-border)]"
                                    checked={sendPaymentEmail && hasValidClientEmail(item)}
                                    disabled={!hasValidClientEmail(item)}
                                    onChange={(e) => setSendPaymentEmail(e.target.checked)}
                                  />
                                    <span>
                                      <span className="font-medium text-[var(--pro-text)]">Envoyer automatiquement le lien par e-mail</span>
                                    {!hasValidClientEmail(item) ? (
                                      <span className="mt-1 block text-xs text-[var(--pro-text-soft)]">Aucun e-mail client valide disponible.</span>
                                    ) : null}
                                  </span>
                                </label>

                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                                  <div className="flex-1">
                                    <label htmlFor="payment-mode-select" className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">
                                      Mode de paiement Stripe
                                    </label>
                                    <select
                                      id="payment-mode-select"
                                      value={paymentModeChoice}
                                      onChange={(e) => setPaymentModeChoice(e.target.value as "full" | "deposit")}
                                      className="mt-2 w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 text-sm text-[var(--pro-text)] focus:border-[var(--pro-accent)] focus:outline-none"
                                    >
                                      <option value="full">Paiement total</option>
                                      <option value="deposit">Acompte</option>
                                    </select>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={paymentBusy || busy || (item.clientWantsOnlinePayment === false && !allowPaymentLinkDespitePreference)}
                                    onClick={() => void handlePaymentLinkAction(false)}
                                    className={`rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass("primary")}`}
                                  >
                                    {paymentBusy
                                      ? checkoutUrlToShow
                                        ? "Recuperation..."
                                        : "Creation..."
                                      : checkoutUrlToShow
                                        ? "Recuperer ou ouvrir le lien"
                                        : "Creer le lien de paiement"}
                                  </button>
                                </div>
                              </div>

                              {checkoutUrlToShow ? (
                                <div className="rounded-[24px] border border-emerald-300/40 bg-emerald-50 px-5 py-5 text-emerald-950">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                                    {item.paymentStatus === "LINK_SENT" ? "Lien envoye ou paiement en attente" : "Lien Stripe disponible"}
                                  </p>
                                  <p className="mt-3 text-sm leading-6">
                                    Montant :{" "}
                                    <span className="font-semibold">
                                      {formatAmountFromCents(
                                        lastCheckout?.amountCents ?? pendingLinkPayment?.amount ?? 0,
                                        lastCheckout?.currency ?? pendingLinkPayment?.currency ?? "eur"
                                      )}
                                    </span>
                                    {" · "}
                                    <span className="font-medium">
                                      {lastCheckout?.mode === "deposit" || pendingLinkPayment?.mode === "DEPOSIT" ? "Acompte" : "Paiement total"}
                                    </span>
                                  </p>

                                  {lastCheckout?.emailDeliveryRequested && lastCheckout.emailSent === true ? (
                                    <p className="mt-2 text-sm">E-mail envoye au client.</p>
                                  ) : null}
                                  {lastCheckout?.emailDeliveryRequested && lastCheckout.emailSent === false ? (
                                    <p className="mt-2 text-sm">{mapPaymentLinkEmailErrorCodeToFr(lastCheckout.emailErrorCode ?? "")}</p>
                                  ) : null}

                                  <p className="mt-3 break-all rounded-2xl bg-white/80 px-3 py-3 font-mono text-xs text-emerald-900">{checkoutUrlToShow}</p>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => void copyCheckoutUrl(checkoutUrlToShow)}
                                      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${actionButtonClass("neutral")}`}
                                    >
                                      Copier le lien
                                    </button>
                                    <a
                                      href={checkoutUrlToShow}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`inline-flex rounded-2xl px-4 py-2.5 text-sm font-semibold ${actionButtonClass("primary")}`}
                                    >
                                      Ouvrir le lien
                                    </a>
                                    <button
                                      type="button"
                                      disabled={paymentBusy || busy}
                                      onClick={() => void handleRecreatePaymentLink()}
                                      className="rounded-2xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                                    >
                                      Recreer un lien
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader title="Historique" description="Chronologie des actions et changements de statut." />
                  <div className="mt-6 space-y-4">
                    {item.history.map((row) => (
                      <div key={row.id} className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-5 py-5">
                        <p className="text-sm text-[var(--pro-text-soft)]">
                          <span className="font-semibold text-[var(--pro-text)]">{formatDateTime(row.createdAt)}</span>
                          {" · "}
                          {row.previousStatus ? `${labelStatus(row.previousStatus)} -> ` : "Creation -> "}
                          {labelStatus(row.newStatus)}
                        </p>
                        {row.changedByUser?.email ? <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Operateur : {row.changedByUser.email}</p> : null}
                        {isUsefulValue(row.note) ? <p className="mt-3 text-sm leading-6 text-[var(--pro-text-soft)]">{row.note}</p> : null}
                      </div>
                    ))}
                    {!item.history.length ? <EmptyState message="Aucun historique disponible." /> : null}
                  </div>
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader
                    title="Documents"
                    description="Acces rapide au devis imprimable ou telechargeable en PDF via le navigateur."
                  />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/pro/demandes/${item.id}/devis`}
                      className={`inline-flex rounded-2xl px-5 py-3 text-sm font-semibold transition ${actionButtonClass("primary")}`}
                    >
                      Imprimer ou telecharger le PDF
                    </Link>
                  </div>
                </ProPanel>
              </div>

              <div className="space-y-6 2xl:sticky 2xl:top-28 2xl:self-start">
                <ProPanel>
                  <ProSectionHeader title="Client" description="Coordonnees et contact rapide." />
                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-xl font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                      <p className="mt-2 text-sm text-[var(--pro-text-muted)]">{labelKind(item.kind)}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {isUsefulValue(item.clientPhone) ? (
                        <a
                          href={`tel:${String(item.clientPhone).replace(/\s/g, "")}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
                        >
                          Appeler · {item.clientPhone}
                        </a>
                      ) : null}
                      {isUsefulValue(item.clientEmail) ? (
                        <a
                          href={`mailto:${item.clientEmail}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
                        >
                          Envoyer un e-mail
                        </a>
                      ) : null}
                    </div>

                    {extrasClient.length ? (
                      <div className="space-y-3">
                        {extrasClient.map((row) => (
                          <DetailCard key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader title="Suivi du dossier" description="Statut actuel, derniere action et notifications envoyees." />
                  <div className="mt-6 space-y-4">
                    <DetailCard label="Statut actuel" value={labelStatus(item.status)} />
                    <DetailCard label="Paiement en ligne" value={labelLeadPaymentStatus(item.paymentStatus)} />
                    <DetailCard
                      label="Preference paiement"
                      value={labelClientOnlinePaymentPreference(item.clientWantsOnlinePayment)}
                    />
                    {latestHistory ? <DetailCard label="Derniere action" value={`${labelStatus(latestHistory.newStatus)} · ${formatDateTime(latestHistory.createdAt)}`} /> : null}

                    {(item.customerDecisionMailSentAt || item.customerDecisionMailLastError) ? (
                      <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4 text-sm text-[var(--pro-text-soft)]">
                        {item.customerDecisionMailSentAt ? <p>Notification client envoyee le {formatDateTime(item.customerDecisionMailSentAt)}.</p> : null}
                        {item.customerDecisionMailLastError ? <p className="mt-2 text-rose-700">La mise a jour a ete faite, mais le message client reste non envoye.</p> : null}
                      </div>
                    ) : null}
                  </div>
                </ProPanel>

                <ProPanel>
                  <ProSectionHeader title="Note interne" description="Visible uniquement dans l'espace professionnel." />
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={6}
                    placeholder="Ajoutez une note utile pour votre equipe."
                    className="mt-6 w-full rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveNote()}
                    className={`mt-4 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass("primary")}`}
                  >
                    Enregistrer la note
                  </button>
                </ProPanel>
              </div>
            </div>
          </>
        )}
      </ProShell>
    </ProGuard>
  );
}
