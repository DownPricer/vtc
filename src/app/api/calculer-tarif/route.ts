import { NextResponse } from "next/server";
import { postCentralApiServer } from "@/lib/centralApiServer";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";
import { buildPricingConfigForTenant } from "@/lib/pricing/buildPricingConfigForTenant";

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
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error("[calculer-tarif]", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
