import { proAuthenticatedFetch } from "@/lib/proApi";
import { ProPaymentsApiError, parseProData, type ProStripeStatusData } from "@/lib/proPaymentsClient";

/* -------------------------------------------------------------------------- */
/*  Compte Stripe : vue d'ensemble et Dashboard Express                       */
/* -------------------------------------------------------------------------- */

export type ProStripeOverviewData = {
  status: ProStripeStatusData;
  /** "cache" si Stripe était injoignable : on affiche alors les derniers drapeaux connus. */
  statusSource: "stripe" | "cache";
  recentPayments: Array<{
    id: string;
    leadRequestId: string;
    clientName: string;
    status: string;
    amount: number;
    refundedAmount: number;
    currency: string;
    paidAt: string | null;
  }>;
  recentRefunds: Array<{
    id: string;
    paymentId: string;
    leadRequestId: string;
    clientName: string;
    amount: number;
    currency: string;
    status: string;
    reason: string | null;
    createdAt: string;
  }>;
};

export async function getStripeOverview(): Promise<ProStripeOverviewData> {
  const res = await proAuthenticatedFetch("/pro/stripe/overview", { method: "GET" });
  return parseProData<ProStripeOverviewData>(res);
}

/** Lien Dashboard Express à usage unique ; ne jamais le stocker ni le mettre en cache. */
export async function createStripeLoginLink(): Promise<{ url: string }> {
  const res = await proAuthenticatedFetch("/pro/stripe/login-link", { method: "POST", body: JSON.stringify({}) });
  return parseProData<{ url: string }>(res);
}

/** Le navigateur ne suit que des liens hébergés par Stripe. */
export function isStripeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && (u.hostname === "stripe.com" || u.hostname.endsWith(".stripe.com"));
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Remboursements                                                            */
/* -------------------------------------------------------------------------- */

export type ProRefundPreview = {
  paymentId: string;
  currency: string;
  paidCents: number;
  refundedCents: number;
  inFlightCents: number;
  refundableCents: number;
  requestedCents: number;
  platformFeeTotalCents: number;
  platformFeeRefundedCents: number;
  platformFeeRefundCents: number;
  customerReceivesCents: number;
  driverNetDebitCents: number;
  paymentStatus: string;
  state: string;
};

export type ProRefundRow = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "REQUIRES_ACTION" | "SUCCEEDED" | "FAILED" | "CANCELED";
  reason: string | null;
  reasonNote: string | null;
  failureReason: string | null;
  initiatedBy: string;
  applicationFeeRefunded: number;
  applicationFeeRefundExpected: number;
  lastSyncedAt: string | null;
  createdAt: string;
};

export type ProPaymentDetail = {
  id: string;
  leadRequestId: string;
  status: string;
  mode: string;
  amount: number;
  currency: string;
  applicationFeeAmount: number;
  refundedAmount: number;
  applicationFeeRefundedAmount: number;
  stripeReceiptUrl: string | null;
  paidAt: string | null;
  refundsSyncedAt: string | null;
  leadRequest: { clientName: string; status: string } | null;
  refunds: ProRefundRow[];
};

export const REFUND_REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "driver_cancelled", label: "Course annulée par le chauffeur" },
  { value: "customer_request", label: "Demande du client" },
  { value: "service_issue", label: "Problème de prestation" },
  { value: "duplicate", label: "Paiement en double" },
  { value: "goodwill", label: "Geste commercial" },
  { value: "other", label: "Autre motif" },
];

export function labelRefundReason(raw?: string | null): string {
  if (raw === "stripe_dashboard") return "Dashboard Stripe";
  return REFUND_REASON_OPTIONS.find((o) => o.value === raw)?.label ?? (raw ? "Autre motif" : "—");
}

export function labelRefundStatus(raw?: string | null): string {
  switch (raw) {
    case "SUCCEEDED":
      return "Confirmé";
    case "PENDING":
      return "En cours";
    case "REQUIRES_ACTION":
      return "Action requise";
    case "FAILED":
      return "Échoué";
    case "CANCELED":
      return "Annulé";
    default:
      return "—";
  }
}

export function refundStatusBadgeClass(raw?: string | null): string {
  switch (raw) {
    case "SUCCEEDED":
      return "pro-badge pro-badge--accepted";
    case "PENDING":
    case "REQUIRES_ACTION":
      return "pro-badge pro-badge--pending";
    case "FAILED":
      return "pro-badge pro-badge--refused";
    default:
      return "pro-badge pro-badge--archived";
  }
}

export async function getPaymentDetail(paymentId: string): Promise<ProPaymentDetail> {
  const res = await proAuthenticatedFetch(`/pro/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
  return parseProData<ProPaymentDetail>(res);
}

export async function getRefundPreview(paymentId: string, amountCents?: number): Promise<ProRefundPreview> {
  const qs = amountCents ? `?amountCents=${Math.trunc(amountCents)}` : "";
  const res = await proAuthenticatedFetch(`/pro/payments/${encodeURIComponent(paymentId)}/refund-preview${qs}`, { method: "GET" });
  return parseProData<ProRefundPreview>(res);
}

export type CreateRefundPayload = {
  full: boolean;
  amountCents?: number;
  reason: string;
  note?: string;
  /** Identifiant d'intention : conservé tant que la modale reste ouverte (double clic / nouvel essai sans doublon). */
  clientRequestId: string;
};

export type CreateRefundResult = {
  refundId: string;
  status: ProRefundRow["status"];
  /** true uniquement si Stripe a confirmé le remboursement. */
  confirmed: boolean;
  deduplicated: boolean;
  amount: number;
  currency: string;
  paymentStatus: string;
  refundedAmount: number;
};

export async function createRefund(paymentId: string, payload: CreateRefundPayload): Promise<CreateRefundResult> {
  const res = await proAuthenticatedFetch(`/pro/payments/${encodeURIComponent(paymentId)}/refunds`, {
    method: "POST",
    body: JSON.stringify({
      full: payload.full,
      ...(payload.full ? {} : { amountCents: payload.amountCents }),
      reason: payload.reason,
      ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
      clientRequestId: payload.clientRequestId,
      confirmed: true,
    }),
  });
  return parseProData<CreateRefundResult>(res);
}

export async function syncPayment(paymentId: string): Promise<{ paymentStatus: string; refundedAmount: number }> {
  const res = await proAuthenticatedFetch(`/pro/payments/${encodeURIComponent(paymentId)}/sync`, { method: "POST", body: JSON.stringify({}) });
  return parseProData<{ paymentStatus: string; refundedAmount: number }>(res);
}

export function newClientRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/* -------------------------------------------------------------------------- */
/*  Annulation                                                                */
/* -------------------------------------------------------------------------- */

export type RefundPlan = { mode: "none" } | { mode: "full" } | { mode: "partial"; amountCents: number };

export type CancelPreview = {
  leadId: string;
  leadStatus: string;
  paymentStatus: string;
  hasOpenPaymentLink: boolean;
  payment: null | { id: string; status: string; refund: ProRefundPreview };
  pendingRequest: null | { id: string; reason: string; requestedAt: string };
  cancellable: boolean;
};

export type CancelResult = {
  leadId: string;
  status: string;
  paymentStatus: string;
  unpaidPaymentsCancelled?: number;
  refund: null | { refundId: string; status: string; confirmed: boolean; amount: number; currency: string };
  refundUncertain?: boolean;
  customerMailSent?: boolean | null;
};

export async function getCancelPreview(leadId: string): Promise<CancelPreview> {
  const res = await proAuthenticatedFetch(`/pro/demandes/${encodeURIComponent(leadId)}/cancel-preview`, { method: "GET" });
  return parseProData<CancelPreview>(res);
}

export async function cancelBookingRequest(
  leadId: string,
  payload: { reason: string; refund: RefundPlan; refundConfirmed: boolean; clientRequestId: string; notifyCustomer: boolean }
): Promise<CancelResult> {
  const res = await proAuthenticatedFetch(`/pro/demandes/${encodeURIComponent(leadId)}/cancel`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseProData<CancelResult>(res);
}

export async function resolveCancellationRequestApi(
  leadId: string,
  payload: {
    decision: "accept" | "refuse" | "manual";
    refund: RefundPlan;
    refundConfirmed: boolean;
    clientRequestId: string;
    note?: string;
    notifyCustomer: boolean;
  }
): Promise<CancelResult> {
  const res = await proAuthenticatedFetch(`/pro/demandes/${encodeURIComponent(leadId)}/cancellation-request/resolve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseProData<CancelResult>(res);
}

export type PendingCancellationRequests = {
  items: Array<{
    id: string;
    leadRequestId: string;
    reason: string;
    requestedAt: string;
    leadRequest: { clientName: string; scheduledStart: string | null; paymentStatus: string };
  }>;
  total: number;
};

export async function getPendingCancellationRequests(): Promise<PendingCancellationRequests> {
  const res = await proAuthenticatedFetch("/pro/cancellation-requests", { method: "GET" });
  return parseProData<PendingCancellationRequests>(res);
}

/* -------------------------------------------------------------------------- */
/*  Conditions d'annulation                                                   */
/* -------------------------------------------------------------------------- */

export type CancellationPolicyInput = {
  freeCancellationHours: number | null;
  partialRefundConditions: string;
  lateCancellationConditions: string;
  specialReasons: string;
  customerText: string;
};

export type CancellationPolicy = CancellationPolicyInput & { version: number; updatedAt: string };

export async function getCancellationPolicy(): Promise<CancellationPolicy | null> {
  const res = await proAuthenticatedFetch("/pro/cancellation-policy", { method: "GET" });
  return (await parseProData<{ policy: CancellationPolicy | null }>(res)).policy;
}

export async function saveCancellationPolicy(input: CancellationPolicyInput): Promise<CancellationPolicy | null> {
  const res = await proAuthenticatedFetch("/pro/cancellation-policy", { method: "PUT", body: JSON.stringify(input) });
  return (await parseProData<{ policy: CancellationPolicy | null }>(res)).policy;
}

/* -------------------------------------------------------------------------- */
/*  Messages d'erreur                                                         */
/* -------------------------------------------------------------------------- */

export function mapRefundErrorToFr(e: unknown): string {
  if (!(e instanceof ProPaymentsApiError)) return e instanceof Error ? e.message : "Erreur inattendue.";
  switch (e.code) {
    case "STRIPE_NOT_CONFIGURED":
      return "Stripe n'est pas configuré côté plateforme.";
    case "PAYMENT_NOT_FOUND":
    case "NOT_FOUND":
      return "Paiement ou réservation introuvable.";
    case "PAYMENT_NOT_REFUNDABLE":
      return e.message || "Ce paiement ne peut pas être remboursé dans son état actuel.";
    case "AMOUNT_EXCEEDS_REFUNDABLE":
      return "Le montant dépasse le solde remboursable de ce paiement.";
    case "REFUND_IN_PROGRESS":
      return "Un remboursement est déjà en cours pour ce paiement. Attendez sa confirmation.";
    case "STRIPE_ACCOUNT_MISMATCH":
      return "Le compte Stripe du paiement ne correspond plus à celui de votre espace. Contactez le support.";
    case "UNSUPPORTED_CHARGE_TYPE":
      return "Ce paiement ne peut pas être remboursé automatiquement. Utilisez votre Dashboard Stripe.";
    case "STRIPE_REFUND_REJECTED":
      return e.message || "Stripe a refusé le remboursement.";
    case "STRIPE_UNCERTAIN":
      return "La réponse de Stripe n'a pas pu être lue. Le remboursement n'est pas dupliqué si vous réessayez : cliquez de nouveau sur « Confirmer ».";
    case "STRIPE_UNREACHABLE":
      return "Stripe est momentanément injoignable. Réessayez dans un instant.";
    case "PAYMENT_AMOUNT_MISMATCH":
      return "Le montant Stripe diffère du montant enregistré : vérification manuelle nécessaire.";
    case "REFUND_CONFIRMATION_REQUIRED":
      return "Confirmez explicitement le remboursement pour continuer.";
    case "ALREADY_CANCELLED":
      return "Cette réservation est déjà annulée.";
    case "NOT_CANCELLABLE":
      return "Cette réservation ne peut plus être annulée dans son état actuel.";
    case "NO_PAID_PAYMENT":
      return "Aucun paiement encaissé à rembourser pour cette réservation.";
    case "NO_PENDING_REQUEST":
      return "Aucune demande d'annulation en attente (déjà traitée ?).";
    case "PAYMENT_COMPLETED_DURING_CANCEL":
      return e.message;
    case "VALIDATION_ERROR":
      return e.message || "Données invalides.";
    default:
      return e.message || "Erreur lors de l'opération.";
  }
}
