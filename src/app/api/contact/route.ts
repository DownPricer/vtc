import { NextResponse } from "next/server";
import { buildContactPayload } from "@/lib/leads/buildLeadRecord";
import { sendContactLeadEmail } from "@/lib/notifications/sendLeadEmails";

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
    await sendContactLeadEmail(payload, client.email);
    return NextResponse.json({
      success: true,
      leadId: payload.ID,
    });
  } catch (e) {
    console.error("[Contact API]", e);
    return NextResponse.json(
      { success: false, message: (e as Error).message },
      { status: 500 }
    );
  }
}
