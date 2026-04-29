import { NextResponse } from "next/server";
import { calculerDistances, calculerTarif } from "@/lib/pricing/calculator";
import { normalizeTypeService } from "@/lib/pricing/utils";
import { buildDevisPayload } from "@/lib/leads/buildLeadRecord";
import { sendDevisLeadEmails } from "@/lib/notifications/sendLeadEmails";

const API_KEY = process.env.DISTANCE_MATRIX_API_KEY;

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

    const lead = buildDevisPayload({
      payload,
      result,
      distances,
    });

    const displayName = `${client.prenom} ${client.nom}`.trim();
    const summaryLines = [
      `Référence : ${lead.ID}`,
      `Tarif estimé : ${result.tarif} €`,
      `Service : ${lead.TypeService || ""}`,
      `Trajet : ${lead.RésuméTrajet || ""}`,
    ];

    await sendDevisLeadEmails(lead, client.email, displayName, summaryLines);

    return NextResponse.json({
      success: true,
      devisId: lead.ID,
      tarif: result.tarif,
      message: "Devis envoyé avec succès",
    });
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
