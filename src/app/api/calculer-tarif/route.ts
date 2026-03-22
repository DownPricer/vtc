import { NextResponse } from "next/server";
import { calculerDistances, calculerTarif } from "@/lib/pricing/calculator";
import { normalizeTypeService } from "@/lib/pricing/utils";

const API_KEY = process.env.DISTANCE_MATRIX_API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "DISTANCE_MATRIX_API_KEY manquant" },
      { status: 500 }
    );
  }
  try {
    const payload = await request.json();
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
        { error: `Type de service inconnu: ${ts}` },
        { status: 400 }
      );
    }
    const distances = await calculerDistances(API_KEY, payload);
    const result = await calculerTarif(typeKey, payload, distances);
    return NextResponse.json({
      tarif: result.tarif,
      distances: result.distances,
      tarifs: result.tarifs,
      majorations: result.majorations,
      googleCreneaux: result.googleCreneaux,
      creneauGlobal: result.creneauGlobal,
      creneauxDouble: result.creneauxDouble,
    });
  } catch (e) {
    console.error("[calculer-tarif]", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
