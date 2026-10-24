import { getCentralApiConfig } from "@/lib/centralApi";

export type PublicBookingView = {
  companyName: string;
  reference: string;
  kind: string;
  status: string;
  rideDate: string | null;
  tripSummary: string | null;
  payment: null | { paidCents: number; refundedCents: number; currency: string; state: string };
  policy: null | { version: number; capturedAt: string; lines: Array<{ label: string; text: string }> };
  cancellationRequest: null | { status: "PENDING" | "ACCEPTED" | "REFUSED" | "MANUAL"; requestedAt: string };
  canRequestCancellation: boolean;
};

type Result<T> = { ok: true; data: T } | { ok: false; status: number; code: string; message: string };

async function post<T>(path: string, body: Record<string, unknown>): Promise<Result<T>> {
  const cfg = getCentralApiConfig();
  if (!cfg) return { ok: false, status: 0, code: "CONFIG", message: "Configuration API manquante." };
  try {
    const res = await fetch(`${cfg.baseUrl}/api/public${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "X-Tenant-ID": cfg.tenantId },
      body: JSON.stringify(body),
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    let json: { success?: boolean; data?: T; error?: { code?: string; message?: string } } = {};
    try {
      json = await res.json();
    } catch {
      /* corps non JSON */
    }
    if (!res.ok || json.success !== true || json.data === undefined) {
      return {
        ok: false,
        status: res.status,
        code: json.error?.code ?? "API_ERROR",
        message: json.error?.message ?? "Une erreur est survenue.",
      };
    }
    return { ok: true, data: json.data };
  } catch {
    return { ok: false, status: 0, code: "NETWORK", message: "Réseau indisponible. Réessayez dans un instant." };
  }
}

/** Consultation d'une réservation via son jeton secret (jamais via un simple identifiant). */
export function fetchBookingView(token: string): Promise<Result<PublicBookingView>> {
  return post<PublicBookingView>("/booking/view", { token });
}

export function requestBookingCancellation(token: string, reason: string): Promise<Result<{ requestId: string; status: string }>> {
  return post<{ requestId: string; status: string }>("/booking/cancellation-request", { token, reason });
}
