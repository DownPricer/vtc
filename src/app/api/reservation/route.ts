import { NextResponse } from "next/server";
import { calculerDistances, calculerTarif } from "@/lib/pricing/calculator";
import { normalizeTypeService } from "@/lib/pricing/utils";
import { buildReservationPayload } from "@/lib/n8n/payloads";
import { sendWebhookWithRetry } from "@/lib/n8n/webhook";

const API_KEY = process.env.DISTANCE_MATRIX_API_KEY;
const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://ygvtc.app.n8n.cloud/webhook/86ef72ac-6c05-4570-adf0-e1674934a780";

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, message: "DISTANCE_MATRIX_API_KEY manquant" },
      { status: 500 }
    );
  }
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { success: false, message: "Payload invalide" },
        { status: 400 }
      );
    }

    const client = (payload?.client || {}) as Record<string, string>;
    if (!client?.nom || !client?.prenom || !client?.telephone || !client?.email) {
      return NextResponse.json(
        { success: false, message: "Champs client requis : nom, prenom, telephone, email" },
        { status: 400 }
      );
    }

    const ts = normalizeTypeService(
      (payload?.general as Record<string, unknown>)?.TypeService as string
    );
    const typeKey =
      ts === "Trajet Classique"
        ? "classique"
        : ts === "Transfert Aéroport"
          ? "aeroport"
          : ts === "MAD Evenementiel"
            ? "mad-evenementiel"
            : null;

    if (!typeKey) {
      return NextResponse.json(
        { success: false, message: `Type de service inconnu: ${ts}` },
        { status: 400 }
      );
    }

    const distances = await calculerDistances(API_KEY, payload);
    const result = await calculerTarif(typeKey, payload, distances);

    const paymentMethod =
      (payload?.general as Record<string, string>)?.PaymentMethode ||
      (payload?.paymentMethod as string) ||
      "N/A";
    const paye =
      (payload?.general as Record<string, string>)?.Paye ||
      (payload?.paye as string) ||
      "Non";

    const n8nPayload = buildReservationPayload({
      payload,
      result,
      paymentMethod,
      paye,
    });

    await sendWebhookWithRetry(WEBHOOK_URL, n8nPayload);

    return NextResponse.json({
      success: true,
      reservationId: n8nPayload.ID,
      tarif: result.tarif,
      message: "Réservation envoyée avec succès",
    });
  } catch (e) {
    console.error("[Reservation API]", e);
    return NextResponse.json(
      {
        success: false,
        message: (e as Error).message,
      },
      { status: 500 }
    );
  }
}
