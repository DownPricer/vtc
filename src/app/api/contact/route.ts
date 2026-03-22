import { NextResponse } from "next/server";
import { buildContactPayload } from "@/lib/n8n/payloads";
import { sendWebhookWithRetry } from "@/lib/n8n/webhook";

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://ygvtc.app.n8n.cloud/webhook/86ef72ac-6c05-4570-adf0-e1674934a780";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client, commentaires } = body;
    if (!client?.nom || !client?.prenom || !client?.email || !client?.telephone) {
      return NextResponse.json(
        { success: false, message: "Champs requis manquants" },
        { status: 400 }
      );
    }
    const payload = buildContactPayload({ client, commentaires });
    await sendWebhookWithRetry(WEBHOOK_URL, payload);
    return NextResponse.json({
      success: true,
      reservationId: payload.ID,
    });
  } catch (e) {
    console.error("[Contact API]", e);
    return NextResponse.json(
      { success: false, message: (e as Error).message },
      { status: 500 }
    );
  }
}
