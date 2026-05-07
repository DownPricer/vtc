import { NextResponse } from "next/server";
import { postCentralApiServer } from "@/lib/centralApiServer";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";
import { buildPricingConfigForTenant } from "@/lib/pricing/buildPricingConfigForTenant";

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

    const res = await postCentralApiServer("devis", centralPayload);
    const json = await res.json();
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
