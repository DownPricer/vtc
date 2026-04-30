import { getCentralApiConfig } from "@/lib/centralApi";

/**
 * Vérifie un jeton d’accès pro en appelant l’API centrale (`GET /api/auth/me`).
 * Ne lit aucun secret JWT côté Next : la validation reste sur le serveur métier.
 *
 * TODO(auth): si une session cookie Next dédiée au dashboard est ajoutée, l’utiliser en complément
 * pour les environnements sans `NEXT_PUBLIC_API_URL`.
 */
export async function verifyProBearerAllowed(
  authorization: string | null | undefined
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const token = authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, message: "Jeton d’authentification manquant." };
  }

  const cfg = getCentralApiConfig();
  if (!cfg) {
    return {
      ok: false,
      status: 503,
      message:
        "API centrale non configurée (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_TENANT_ID). Upload média refusé pour des raisons de sécurité.",
    };
  }

  const res = await fetch(`${cfg.baseUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-ID": cfg.tenantId,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { ok: false, status: 401, message: "Session professionnelle invalide ou expirée." };
  }

  return { ok: true };
}
