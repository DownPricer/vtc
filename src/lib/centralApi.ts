/**
 * Client HTTP vers l’API centrale (Express multi-tenant).
 * Base URL sans slash final ; les routes métier sont `/api/...`.
 */

export type CentralBusinessRoute = "calculer-tarif" | "devis" | "reservation" | "contact";

export type CentralApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type CentralApiFailure = {
  ok: false;
  status: number;
  message: string;
};

export type CentralApiResult<T> = CentralApiSuccess<T> | CentralApiFailure;

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

export function getCentralApiConfig(): { baseUrl: string; tenantId: string } | null {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ? normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) : "";
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim() ?? "";
  if (!baseUrl || !tenantId) return null;
  return { baseUrl, tenantId };
}

export function getCentralApiMissingEnvMessage(): string {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_API_URL?.trim()) missing.push("NEXT_PUBLIC_API_URL");
  if (!process.env.NEXT_PUBLIC_TENANT_ID?.trim()) missing.push("NEXT_PUBLIC_TENANT_ID");
  if (missing.length === 0) return "";
  return `Configuration incomplète : ${missing.join(", ")}`;
}

function extractErrorMessage(json: unknown): string {
  if (!json || typeof json !== "object") return "Une erreur est survenue";
  const o = json as Record<string, unknown>;
  if (o.error && typeof o.error === "object" && o.error !== null) {
    const inner = o.error as Record<string, unknown>;
    if (typeof inner.message === "string" && inner.message.length > 0) return inner.message;
  }
  if (typeof o.message === "string" && o.message.length > 0) return o.message;
  if (typeof o.error === "string") return o.error;
  return "Une erreur est survenue";
}

/**
 * POST JSON vers l’API centrale avec en-tête `X-Tenant-ID`.
 * Les réponses succès ont la forme `{ success: true, data?, meta? }`.
 */
export async function postCentralApi<T = Record<string, unknown>>(
  route: CentralBusinessRoute,
  body: unknown
): Promise<CentralApiResult<T>> {
  const cfg = getCentralApiConfig();
  if (!cfg) {
    return {
      ok: false,
      status: 0,
      message: getCentralApiMissingEnvMessage() || "Configuration API manquante",
    };
  }

  const url = `${cfg.baseUrl}/api/${route}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": cfg.tenantId,
      },
      body: JSON.stringify(body),
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return {
        ok: false,
        status: res.status,
        message: res.ok
          ? "Réponse invalide du serveur"
          : "Impossible de lire la réponse du serveur",
      };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, message: extractErrorMessage(json) };
    }

    if (
      json &&
      typeof json === "object" &&
      "success" in json &&
      (json as { success: boolean }).success === true
    ) {
      const j = json as { success: true; data?: T; meta?: Record<string, unknown> };
      return { ok: true, data: j.data as T, meta: j.meta };
    }

    return { ok: false, status: res.status, message: extractErrorMessage(json) };
  } catch {
    return {
      ok: false,
      status: 0,
      message:
        "Service temporairement indisponible. Vérifiez votre connexion ou réessayez plus tard.",
    };
  }
}
