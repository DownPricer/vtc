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
      return NextResponse.json(
        { success: false, message: "Payload invalide" },
        { status: 400 }
      );
    }
    const clientPayload = { ...(raw as Record<string, unknown>) };
    delete clientPayload.pricingConfig;

    const tenantSettings = await getPublicTenantSettings();
    const pricingConfig = buildPricingConfigForTenant(tenantSettings);
    const centralPayload = { ...clientPayload, pricingConfig };

    if (process.env.NODE_ENV !== "production") {
      console.info("[next-api][devis] pricingConfig injecte cote serveur");
    }

    console.warn("[pricingConfig debug]", {
      classicTripIsArray: Array.isArray(pricingConfig.classicTrip),
      classicTripKeys: Object.keys(pricingConfig.classicTrip ?? {}),
      classicTripLength: Array.isArray(pricingConfig.classicTrip) ? pricingConfig.classicTrip.length : undefined,
      zoneBandsLength: pricingConfig.classicTrip?.zoneBands?.length,
      oneWayRulesLength: pricingConfig.classicTrip?.distanceRulesOneWay?.length,
      roundTripRulesLength: pricingConfig.classicTrip?.distanceRulesRoundTrip?.length,
    });

    const res = await postCentralApiServer("devis", centralPayload);
    const json = await res.json().catch(() => ({}));
    if (isPricingConfigValidationFailure(res.status, json)) {
      console.error(
        "[next-api][devis] pricingConfig rejeté par l’API — pas de repli silencieux (évite un tarif différent avec tenant_engine)",
        JSON.stringify({ status: res.status, apiResponse: json }, null, 2)
      );
    }
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error("[Devis API]", e);
    return NextResponse.json(
      {
        success: false,
        message: (e as Error).message,
      },
      { status: 500 }
    );
  }
}
