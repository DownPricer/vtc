import { proAuthenticatedFetch } from "@/lib/proApi";

export class ProPaymentsApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ProPaymentsApiError";
    this.code = code;
    this.status = status;
  }
}

async function parseJsonRecord(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function parseProData<T>(res: Response): Promise<T> {
  const json = await parseJsonRecord(res);
  const success = json.success === true;
  if (!success || !res.ok) {
    const err = json.error as { code?: string; message?: string } | undefined;
    throw new ProPaymentsApiError(
      err?.message || "Erreur API",
      err?.code || "API_ERROR",
      res.status
    );
  }
  return json.data as T;
}

export type ProStripeSnapshot = {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingStatus: string;
};

export type ProPaymentSettingsData = {
  paymentOnlineEnabled: boolean;
  paymentMode: "FULL" | "DEPOSIT";
  depositPercent: number | null;
  depositFixedAmount: number | null;
  paymentCurrency: string;
  stripe: ProStripeSnapshot;
};

export type ProStripeStatusData = ProStripeSnapshot & {
  requirements?: {
    currentlyDueCount: number;
    pastDueCount: number;
    disabledReason: string | null;
  };
};

export type ProStripeConnectData = {
  stripeAccountId: string;
  onboardingStatus: string;
};

export type ProStripeOnboardingLinkData = {
  stripeAccountId: string;
  url: string;
  expiresAt: string;
};

export type ProPaymentSettingsPatch = {
  paymentOnlineEnabled: boolean;
  paymentMode: "FULL" | "DEPOSIT";
  depositPercent: number | null;
  depositFixedAmount: number | null;
  paymentCurrency: "eur";
};

export async function getStripeStatus(): Promise<ProStripeStatusData> {
  const res = await proAuthenticatedFetch("/pro/stripe/status", { method: "GET" });
  return parseProData<ProStripeStatusData>(res);
}

export async function connectStripe(): Promise<ProStripeConnectData> {
  const res = await proAuthenticatedFetch("/pro/stripe/connect", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return parseProData<ProStripeConnectData>(res);
}

export async function createStripeOnboardingLink(): Promise<ProStripeOnboardingLinkData> {
  const res = await proAuthenticatedFetch("/pro/stripe/onboarding-link", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return parseProData<ProStripeOnboardingLinkData>(res);
}

export async function getPaymentSettings(): Promise<ProPaymentSettingsData> {
  const res = await proAuthenticatedFetch("/pro/payment-settings", { method: "GET" });
  return parseProData<ProPaymentSettingsData>(res);
}

export async function updatePaymentSettings(
  payload: ProPaymentSettingsPatch
): Promise<Omit<ProPaymentSettingsData, "stripe">> {
  const res = await proAuthenticatedFetch("/pro/payment-settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return parseProData<Omit<ProPaymentSettingsData, "stripe">>(res);
}

export type DemandePaymentLinkPayload = {
  mode: "full" | "deposit";
  sendEmail?: boolean;
  message?: string;
  forceNewCheckoutSession?: boolean;
};

export type DemandePaymentLinkData = {
  paymentId: string;
  checkoutUrl: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  applicationFeeAmount: number;
  reusedExistingCheckout?: boolean;
  emailSent?: boolean;
  emailErrorCode?: string;
};

/**
 * POST /api/pro/demandes/:id/payment-link — création ou réutilisation d’un lien Checkout.
 */
export async function createDemandePaymentLink(
  demandeId: string,
  payload: DemandePaymentLinkPayload
): Promise<DemandePaymentLinkData> {
  const res = await proAuthenticatedFetch(`/pro/demandes/${demandeId}/payment-link`, {
    method: "POST",
    body: JSON.stringify({
      mode: payload.mode,
      sendEmail: payload.sendEmail ?? false,
      ...(payload.message ? { message: payload.message } : {}),
      ...(payload.forceNewCheckoutSession ? { forceNewCheckoutSession: true } : {}),
    }),
  });
  return parseProData<DemandePaymentLinkData>(res);
}

export type ProPaymentsListItem = {
  id: string;
  createdAt: string;
  status: string;
  mode: string;
  amount: number;
  currency: string;
  stripeReceiptUrl: string | null;
  leadRequestId: string;
  clientName: string;
};

export type ProPaymentsListData = {
  items: ProPaymentsListItem[];
  total: number;
  summary: {
    paidTotalCents: number;
    paidCount: number;
    pendingCheckoutCount: number;
  };
};

export async function listProPayments(params: {
  status?: string;
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
}): Promise<ProPaymentsListData> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.offset != null) q.set("offset", String(params.offset));
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  const qs = q.toString();
  const res = await proAuthenticatedFetch(`/pro/payments${qs ? `?${qs}` : ""}`, { method: "GET" });
  return parseProData<ProPaymentsListData>(res);
}

export function mapDemandePaymentLinkErrorToFr(code: string, apiMessage?: string): string {
  switch (code) {
    case "STRIPE_NOT_CONFIGURED":
      return "Stripe n’est pas encore configuré côté plateforme.";
    case "STRIPE_NOT_CONNECTED":
      return "Le compte Stripe du VTC n’est pas encore connecté.";
    case "ONBOARDING_INCOMPLETE":
      return "Le compte Stripe doit terminer son activation avant d’encaisser.";
    case "PAYMENT_DISABLED":
      return "Le paiement en ligne est désactivé dans /pro/paiements.";
    case "PAYMENT_AMOUNT_NOT_FOUND":
      return "Impossible de déterminer le montant de cette demande.";
    case "PAYMENT_DEPOSIT_NOT_CONFIGURED":
      return "L’acompte n’est pas configuré dans /pro/paiements.";
    case "AMOUNT_TOO_LOW_FOR_FEE":
      return "Le montant est trop faible pour créer un paiement avec commission.";
    case "PAYMENT_ALREADY_PAID":
      return "Cette demande est déjà payée.";
    case "LEAD_NOT_PAYABLE":
      return "Cette demande ne peut pas recevoir de paiement dans son état actuel.";
    case "STRIPE_PAYMENT_URLS_NOT_CONFIGURED":
      return "Les URLs de paiement Stripe ne sont pas configurées côté serveur.";
    case "PAYMENT_AMOUNT_TOO_LOW":
      return "Le montant à payer est trop faible.";
    case "PAYMENT_AMOUNT_INVALID":
      return "Le montant d’acompte n’est pas valide pour cette demande.";
    case "STRIPE_ERROR":
      return "Erreur Stripe lors de la création du lien.";
    case "VALIDATION_ERROR":
      return apiMessage?.trim() || "Données invalides.";
    case "NOT_FOUND":
      return "Demande introuvable.";
    case "CLIENT_EMAIL_REQUIRED_FOR_PAYMENT_EMAIL":
      return "Le client n’a pas d’e-mail valide ; impossible d’envoyer le lien par e-mail.";
    default:
      return apiMessage?.trim() || "Impossible de créer le lien de paiement.";
  }
}

/** Message UX quand le lien est créé mais l’envoi e-mail a échoué (réponse 200 avec emailSent: false). */
export function mapPaymentLinkEmailErrorCodeToFr(code: string): string {
  switch (code) {
    case "SMTP_CONFIGURATION_ERROR":
      return "Le lien a été créé, mais l’e-mail n’a pas pu être envoyé car la configuration SMTP est incomplète.";
    case "SMTP_SEND_FAILED":
      return "Le lien a été créé, mais l’envoi de l’e-mail a échoué.";
    case "CLIENT_EMAIL_REQUIRED_FOR_PAYMENT_EMAIL":
      return "Le client n’a pas d’e-mail valide.";
    case "TENANT_CONFIG_NOT_FOUND":
    case "LEAD_NOT_FOUND":
      return "Le lien a été créé, mais l’e-mail n’a pas pu être envoyé.";
    default:
      return "Le lien a été créé, mais l’e-mail n’a pas pu être envoyé.";
  }
}
