import type { TenantPricingSettingsV1 } from "@/config/tenant-settings.types";

export type PricingValidationResult = {
  errors: string[];
  warnings: string[];
};

export function validatePricingSection(pricing: TenantPricingSettingsV1): PricingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { classicTrip, hourlyHire, surcharges, airportTransfers } = pricing;

  const checkNonNegative = (label: string, value: number) => {
    if (!Number.isFinite(value) || value < 0) {
      errors.push(`${label} : valeur invalide (doit être ≥ 0).`);
    }
  };

  checkNonNegative("Prix / km aller simple", classicTrip.oneWayPricePerKm);
  checkNonNegative("Prix / km aller-retour", classicTrip.roundTripPricePerKm);
  checkNonNegative("Prix minimum", classicTrip.minimumPrice);
  checkNonNegative("Approche chauffeur", classicTrip.approachPricePerKm);
  checkNonNegative("Tarif horaire", hourlyHire.hourlyRate);
  checkNonNegative("Minimum mise à disposition", hourlyHire.minimumTotal);
  checkNonNegative("Minimum majoration", surcharges.minimumAmount);

  if (!Number.isFinite(classicTrip.outOfZoneMultiplier) || classicTrip.outOfZoneMultiplier < 1) {
    errors.push("Multiplicateur hors zone : doit être ≥ 1.");
  }

  if (classicTrip.minimumPrice > 0 && classicTrip.oneWayPricePerKm > 0 && classicTrip.minimumPrice < classicTrip.oneWayPricePerKm) {
    warnings.push("Le prix minimum est inférieur au prix au km — vérifiez la cohérence.");
  }

  if (classicTrip.outOfZoneMultiplier > 3) {
    warnings.push("Multiplicateur hors zone élevé — le tarif hors zone peut devenir très cher.");
  }

  if (classicTrip.oneWayPricePerKm > 0 && classicTrip.oneWayPricePerKm < 0.5) {
    warnings.push("Prix au km très bas — risque de sous-facturation.");
  }

  for (const airport of airportTransfers.airports) {
    if (!airport.enabled) continue;
    checkNonNegative(`Aéroport ${airport.code} — €/km`, airport.pricePerKm);
    checkNonNegative(`Aéroport ${airport.code} — minimum aller`, airport.oneWayMinimumPrice);
    checkNonNegative(`Aéroport ${airport.code} — minimum A/R`, airport.roundTripMinimumPrice);
  }

  return { errors, warnings };
}
