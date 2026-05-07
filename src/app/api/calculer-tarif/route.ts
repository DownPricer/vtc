import { NextResponse } from "next/server";
import { postCentralApiServer } from "@/lib/centralApiServer";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";
import { buildPricingConfigForTenant } from "@/lib/pricing/buildPricingConfigForTenant";

function extractApiErrorInfo(json: unknown): { code?: string; message?: string } {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  const err = o.error && typeof o.error === "object" ? (o.error as Record<string, unknown>) : null;
  const code = typeof err?.code === "string" ? err.code : undefined;
  const message =
    (typeof err?.message === "string" && err.message) ||
    (typeof o.message === "string" && o.message) ||
    (typeof o.error === "string" && o.error) ||
    undefined;
  return { code, message };
}

function isPricingConfigValidationFailure(status: number, json: unknown): boolean {
  if (status !== 400) return false;
  const { code, message } = extractApiErrorInfo(json);
  return code === "VALIDATION_ERROR" || message === "Configuration tarifaire invalide.";
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const clientPayload = { ...(raw as Record<string, unknown>) };
    delete clientPayload.pricingConfig;

    const tenantSettings = await getPublicTenantSettings();
    const pricingConfig = buildPricingConfigForTenant(tenantSettings);
    const centralPayload = { ...clientPayload, pricingConfig };

    if (process.env.NODE_ENV !== "production") {
      console.info("[next-api][calculer-tarif] pricingConfig injecte cote serveur");
    }

    const res = await postCentralApiServer("calculer-tarif", centralPayload);
    const json = await res.json().catch(() => ({}));
    if (isPricingConfigValidationFailure(res.status, json)) {
      // Fallback temporaire: si pricingConfig est rejeté par le validateur central, on réessaie sans pricingConfig.
      console.warn("[next-api][calculer-tarif] pricingConfig invalide, fallback sans pricingConfig", {
        status: res.status,
        apiResponse: json,
      });
      const fallbackRes = await postCentralApiServer("calculer-tarif", clientPayload);
      const fallbackJson = await fallbackRes.json().catch(() => ({}));
      return NextResponse.json(fallbackJson, { status: fallbackRes.status });
    }
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error("[calculer-tarif]", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
