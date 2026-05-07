import type { TenantPricingSettingsV1, TenantSettingsV1 } from "@/config/tenant-settings.types";
import {
  AIRPORT_BUFFERS,
  AIRPORTS,
  APPLY_AR_DISCOUNT,
  MAD_EVENT_MINIMUM_TOTAL,
  MAD_HOURLY_RATES,
  MAJ,
  OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER,
  PRIMARY_SERVICE_ZONE_COMMUNES,
  PUBLIC_HOLIDAYS,
  TA_TABLE,
  TC_TABLE,
  TIMEZONE,
} from "@/config/pricing.config";
import type {
  AirportPriceRule,
  DiscountRule,
  DistanceRule,
  PricingConfigPayload,
  SurchargeRule,
  ZoneDistanceBand,
} from "./pricingConfigPayload";

type PartialPricingSettings = Partial<TenantPricingSettingsV1>;

function buildDistanceBand(key: string): { fromKm?: number; toKm?: number } {
  const trimmed = key.trim();
  if (trimmed.startsWith("+")) return { fromKm: Number(trimmed.slice(1)) };
  const m = /^(\d+)-(\d+)$/.exec(trimmed);
  if (!m) return {};
  return { fromKm: Number(m[1]), toKm: Number(m[2]) };
}

function legacyClassicTripDefaults() {
  return {
    enabled: true,
    oneWayPricePerKm: TC_TABLE.SIMPLE.ZONES[1].tarifsKm["1-50"],
    roundTripPricePerKm: TC_TABLE.AR.ZONES[1].tarifsKm["1-50"],
    minimumPrice: TC_TABLE.SIMPLE.ZONES[1].min,
    approachPricePerKm: TC_TABLE.SIMPLE.APPROCHE,
    returnToBaseEnabled: true,
    outOfZoneMultiplier: OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER,
  };
}

function getPricingWithFallback(tenantSettings: TenantSettingsV1): TenantPricingSettingsV1 {
  const legacyClassic = legacyClassicTripDefaults();
  const source = (tenantSettings.pricing ?? {}) as PartialPricingSettings;

  const airportDefaults = Object.keys(TA_TABLE).map((code) => ({
    code,
    name: code,
    address: AIRPORTS[code]?.address ?? code,
    oneWayMinimumPrice: TA_TABLE[code].SIMPLE["1-2"].min,
    roundTripMinimumPrice: TA_TABLE[code].ALLER_RETOUR["1-2"].min,
    pricePerKm: TA_TABLE[code].SIMPLE["1-2"].tarifKm,
    enabled: true,
  }));

  return {
    classicTrip: {
      enabled: source.classicTrip?.enabled ?? legacyClassic.enabled,
      oneWayPricePerKm: source.classicTrip?.oneWayPricePerKm ?? legacyClassic.oneWayPricePerKm,
      roundTripPricePerKm: source.classicTrip?.roundTripPricePerKm ?? legacyClassic.roundTripPricePerKm,
      minimumPrice: source.classicTrip?.minimumPrice ?? legacyClassic.minimumPrice,
      approachPricePerKm: source.classicTrip?.approachPricePerKm ?? legacyClassic.approachPricePerKm,
      returnToBaseEnabled: source.classicTrip?.returnToBaseEnabled ?? legacyClassic.returnToBaseEnabled,
      outOfZoneMultiplier: source.classicTrip?.outOfZoneMultiplier ?? legacyClassic.outOfZoneMultiplier,
    },
    airportTransfers: {
      enabled: source.airportTransfers?.enabled ?? true,
      airports: source.airportTransfers?.airports?.length ? source.airportTransfers.airports : airportDefaults,
    },
    hourlyHire: {
      enabled: source.hourlyHire?.enabled ?? true,
      hourlyRate: source.hourlyHire?.hourlyRate ?? MAD_HOURLY_RATES.default,
      minimumTotal: source.hourlyHire?.minimumTotal ?? MAD_EVENT_MINIMUM_TOTAL,
    },
    surcharges: {
      nightPercent: source.surcharges?.nightPercent ?? MAJ.pctNight * 100,
      eveningPercent: source.surcharges?.eveningPercent ?? MAJ.pctEvening * 100,
      weekendPercent: source.surcharges?.weekendPercent ?? MAJ.pctWE * 100,
      holidayPercent: source.surcharges?.holidayPercent ?? MAJ.pctFerie * 100,
      minimumAmount: source.surcharges?.minimumAmount ?? MAJ.minEuros,
    },
    discounts: {
      roundTripEnabled: source.discounts?.roundTripEnabled ?? APPLY_AR_DISCOUNT,
    },
    cityRules: source.cityRules ?? [],
  };
}

function mapZoneBands(minimumPrice: number) {
  const zones = TC_TABLE.SIMPLE.ZONES;
  const ids = Object.keys(zones)
    .map((id) => Number(id))
    .sort((a, b) => a - b);
  const zoneStartById: Record<number, number> = { 1: 0, 2: 16, 3: 36, 4: 81, 5: 121 };
  return ids.map((zoneId, index): ZoneDistanceBand => {
    const nextZone = ids[index + 1];
    return {
      zoneId: String(zoneId),
      label: `Zone ${zoneId}`,
      minPrincipalDistanceKm: zoneStartById[zoneId] ?? 0,
      maxPrincipalDistanceKm: nextZone ? (zoneStartById[nextZone] ?? 0) - 1 : undefined,
      minimumPrice,
      enabled: true,
    };
  });
}

function mapDistanceRules(type: "SIMPLE" | "AR", pricePerKm: number): DistanceRule[] {
  const zones = TC_TABLE[type].ZONES;
  const ids = Object.keys(zones).map((id) => Number(id)).sort((a, b) => a - b);
  const out: DistanceRule[] = [];
  for (const zoneId of ids) {
    const table = zones[zoneId as keyof typeof zones].tarifsKm;
    for (const bandKey of Object.keys(table)) {
      const band = buildDistanceBand(bandKey);
      out.push({
        id: `${type.toLowerCase()}-zone-${zoneId}-${bandKey}`,
        label: `${type} zone ${zoneId} (${bandKey} km)`,
        fromKm: band.fromKm,
        toKm: band.toKm,
        pricePerKm,
        enabled: true,
      });
    }
  }
  return out;
}

function mapAirportRules(pricing: TenantPricingSettingsV1): AirportPriceRule[] {
  return pricing.airportTransfers.airports.map((airport) => {
    const code = airport.code;
    return {
      id: `airport-${code.toLowerCase()}`,
      code,
      name: airport.name,
      aliases: AIRPORTS[code]?.names ?? [code.toLowerCase()],
      address: airport.address,
      oneWay: ["1-2", "3-4"].map((band) => {
        const [passengerMinRaw, passengerMaxRaw] = band.split("-");
        return {
          passengerMin: Number(passengerMinRaw) || 1,
          passengerMax: Number(passengerMaxRaw) || 4,
          pricePerKm: airport.pricePerKm,
          minimumPrice: airport.oneWayMinimumPrice,
        };
      }),
      roundTrip: ["1-2", "3-4"].map((band) => {
        const [passengerMinRaw, passengerMaxRaw] = band.split("-");
        return {
          passengerMin: Number(passengerMinRaw) || 1,
          passengerMax: Number(passengerMaxRaw) || 4,
          pricePerKm: airport.pricePerKm,
          minimumPrice: airport.roundTripMinimumPrice,
        };
      }),
      enabled: airport.enabled,
    };
  });
}

function mapSurcharges(pricing: TenantPricingSettingsV1): SurchargeRule[] {
  return [
    { id: "night-percent", label: "Majoration nuit", type: "night", mode: "percent", value: pricing.surcharges.nightPercent, minAmount: pricing.surcharges.minimumAmount, enabled: true },
    { id: "evening-percent", label: "Majoration soiree", type: "evening", mode: "percent", value: pricing.surcharges.eveningPercent, minAmount: pricing.surcharges.minimumAmount, enabled: true },
    { id: "weekend-percent", label: "Majoration week-end", type: "weekend", mode: "percent", value: pricing.surcharges.weekendPercent, minAmount: pricing.surcharges.minimumAmount, enabled: true },
    { id: "holiday-percent", label: "Majoration ferie", type: "holiday", mode: "percent", value: pricing.surcharges.holidayPercent, minAmount: pricing.surcharges.minimumAmount, enabled: true },
  ];
}

function mapDiscounts(pricing: TenantPricingSettingsV1): DiscountRule[] {
  return [
    {
      id: "round-trip-discount",
      label: "Remise aller-retour",
      trigger: "round_trip",
      mode: "percent",
      value: 5,
      enabled: pricing.discounts.roundTripEnabled,
    },
  ];
}

export function buildPricingConfigForTenant(tenantSettings: TenantSettingsV1): PricingConfigPayload {
  const pricing = getPricingWithFallback(tenantSettings);
  const baseFromSettings = tenantSettings.calculatorDisplay?.vtcBaseAddress?.trim();
  const vtcBaseAddress = baseFromSettings && baseFromSettings.length > 0 ? baseFromSettings : tenantSettings.contact.address.street || "Paris, France";

  return {
    version: "v1",
    currency: "EUR",
    timezone: TIMEZONE,
    vtcBaseAddress,
    publicHolidays: [...PUBLIC_HOLIDAYS],
    airportBuffers: { ...AIRPORT_BUFFERS },
    classicTrip: {
      enabled: pricing.classicTrip.enabled,
      zoneBands: mapZoneBands(pricing.classicTrip.minimumPrice),
      distanceRulesOneWay: mapDistanceRules("SIMPLE", pricing.classicTrip.oneWayPricePerKm),
      distanceRulesRoundTrip: mapDistanceRules("AR", pricing.classicTrip.roundTripPricePerKm),
      approach: {
        enabled: true,
        mode: "min_of_approach_or_return_base",
        pricePerKm: pricing.classicTrip.approachPricePerKm,
      },
      returnToBase: {
        enabled: pricing.classicTrip.returnToBaseEnabled,
        mode: "min_of_approach_or_return_base",
        pricePerKm: pricing.classicTrip.approachPricePerKm,
      },
      outOfPrimaryZone: {
        enabled: true,
        mode: "multiplier",
        value: pricing.classicTrip.outOfZoneMultiplier,
        primaryCities: Array.from(PRIMARY_SERVICE_ZONE_COMMUNES),
      },
      supplementShortDistance: {
        enabled: true,
        fromKm: 1,
        toKm: 50,
        addPricePerKm: 0.2,
      },
    },
    airportTransfers: {
      enabled: pricing.airportTransfers.enabled,
      rules: mapAirportRules(pricing),
      fallbackAirportCode: "ORY",
    },
    hourlyHire: {
      enabled: pricing.hourlyHire.enabled,
      minimumTotal: pricing.hourlyHire.minimumTotal,
      rateRules: [
        { id: "hourly-default", label: "Taux horaire standard", hourlyRate: pricing.hourlyHire.hourlyRate, enabled: true },
        { id: "hourly-evening-night", label: "Taux soiree/nuit", startsAtHour: 19, hourlyRate: pricing.hourlyHire.hourlyRate, enabled: true },
        { id: "hourly-weekend-holiday", label: "Taux week-end/ferie", appliesOnWeekend: true, appliesOnHoliday: true, hourlyRate: pricing.hourlyHire.hourlyRate, enabled: true },
      ],
    },
    surcharges: mapSurcharges(pricing),
    discounts: mapDiscounts(pricing),
    cityRules: pricing.cityRules,
    options: [],
    passengerBagPolicy: { minPassengers: 1, maxPassengers: 4, bagPricingEnabled: false },
    rounding: { classic: "ceil", airport: "ceil_to_5", hourlyHire: "ceil" },
  };
}

