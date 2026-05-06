import { getCentralApiConfig } from "@/lib/centralApi";

export type PaymentConfirmationData = {
  status: string;
  amount: number;
  currency: string;
  leadReference: string;
  receiptUrl: string | null;
  confirmationPending: boolean;
};

function extractErrorMessage(json: unknown): string {
  if (!json || typeof json !== "object") return "Une erreur est survenue";
  const o = json as Record<string, unknown>;
  if (o.error && typeof o.error === "object" && o.error !== null) {
    const inner = o.error as Record<string, unknown>;
    if (typeof inner.message === "string" && inner.message.length > 0) return inner.message;
  }
  return "Une erreur est survenue";
}

/**
 * Confirmation publique après Checkout Stripe (`session_id`), sans secrets.
 */
export async function fetchPublicPaymentConfirmation(sessionId: string): Promise<
  | { ok: true; data: PaymentConfirmationData }
  | { ok: false; status: number; message: string }
> {
  const cfg = getCentralApiConfig();
  if (!cfg) {
    return { ok: false, status: 0, message: "Configuration API manquante (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_TENANT_ID)." };
  }
  const url = `${cfg.baseUrl}/api/public/payment-confirmation?session_id=${encodeURIComponent(sessionId)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "X-Tenant-ID": cfg.tenantId },
      cache: "no-store",
    });
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { ok: false, status: res.status, message: "Réponse invalide du serveur." };
    }
    if (!res.ok || !json || typeof json !== "object" || (json as { success?: boolean }).success !== true) {
      return { ok: false, status: res.status, message: extractErrorMessage(json) };
    }
    const data = (json as { data: PaymentConfirmationData }).data;
    if (!data || typeof data !== "object") {
      return { ok: false, status: res.status, message: "Données de confirmation invalides." };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, message: "Réseau indisponible." };
  }
}
