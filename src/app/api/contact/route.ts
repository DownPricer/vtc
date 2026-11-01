import { NextResponse } from "next/server";
import { resolveVisitorIpFromHeaders } from "@/lib/bffClientIp";
import { checkContactRateLimit } from "@/lib/contactRateLimit";
import { validateContactBody } from "@/lib/contactValidation";
import { buildContactPayload } from "@/lib/leads/buildLeadRecord";
import { sendContactLeadEmail } from "@/lib/notifications/sendLeadEmails";

const GENERIC_MAIL_ERROR =
  "Impossible d'envoyer votre message pour le moment. Réessayez plus tard.";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const validated = validateContactBody(body);
    if (!validated.ok) {
      return NextResponse.json({ success: false, message: validated.message }, { status: 400 });
    }

    const ip =
      resolveVisitorIpFromHeaders((name) => request.headers.get(name)) ?? "unknown";
    const limited = checkContactRateLimit(ip, validated.data.email);
    if (limited) {
      return NextResponse.json(
        { success: false, message: "Trop de messages envoyés. Réessayez dans quelques minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const { commentaires, ...client } = validated.data;
    const payload = buildContactPayload({ client, commentaires });
    try {
      await sendContactLeadEmail(payload, client.email);
    } catch (e) {
      console.error("[Contact API] SMTP:", e instanceof Error ? e.message : e);
      return NextResponse.json({ success: false, message: GENERIC_MAIL_ERROR }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      leadId: payload.ID,
    });
  } catch (e) {
    console.error("[Contact API]", e instanceof Error ? e.message : e);
    return NextResponse.json({ success: false, message: GENERIC_MAIL_ERROR }, { status: 500 });
  }
}
