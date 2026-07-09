import type { TenantPricingSettingsV1, TenantSettingsV1 } from "@/config/tenant-settings.types";
import {
  AIRPORT_BUFFERS,
  AIRPORTS,
  APPLY_AR_DISCOUNT,
  MAD_EVENT_MINIMUM_TOTAL,
  MAD_HOURLY_RATES,
  MAJ,
  OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER,
  PRIMARY_SERVICE_ZONE_SET_ID,
  PUBLIC_HOLIDAYS,
  TA_TABLE,
  TC_TABLE,
  TIMEZONE,
} from "@/config/pricing.config";
import type {
  AirportPriceRule,
  DiscountRule,
  PricingConfigPayload,
  SurchargeRule,
} from "./pricingConfigPayload";

type PartialPricingSettings = Partial<TenantPricingSettingsV1>;

function legacyClassicTripDefaults() {
  return {
    enabled: true,
    oneWayPricePerKm: TC_TABLE.SIMPLE.ZONES[1].tarifsKm["1-50"],
    roundTripPricePerKm: TC_TABLE.AR.ZONES[1].tarifsKm["1-50"],
    minimumPrice: TC_TABLE.SIMPLE.ZONES[1].min,
    approachPricePerKm: TC_TABLE.SIMPLE.APPROCHE,
    returnToBaseEnabled: true,
    outOfZoneMultiplier: OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER,
    primaryServiceZoneSetId: PRIMARY_SERVICE_ZONE_SET_ID,
  };
}

export function getPricingWithFallback(tenantSettings: TenantSettingsV1): TenantPricingSettingsV1 {
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
      primaryServiceZoneSetId:
        source.classicTrip?.primaryServiceZoneSetId ?? legacyClassic.primaryServiceZoneSetId,
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
      zoneBands: [
        {
          zoneId: "1",
          label: "Zone 1",
          minPrincipalDistanceKm: 0,
          minimumPrice: pricing.classicTrip.minimumPrice,
          enabled: true,
        },
      ],
      distanceRulesOneWay: [
        {
          id: "zone-1-one-way",
          label: "Trajet aller simple zone 1",
          pricePerKm: pricing.classicTrip.oneWayPricePerKm,
          minimumPrice: pricing.classicTrip.minimumPrice,
          enabled: true,
        },
      ],
      distanceRulesRoundTrip: [
        {
          id: "zone-1-round-trip",
          label: "Trajet aller-retour zone 1",
          pricePerKm: pricing.classicTrip.roundTripPricePerKm,
          minimumPrice: pricing.classicTrip.minimumPrice,
          enabled: true,
        },
      ],
      approach: {
        enabled: true,
        /** Aligné sur le calculateur : approche base→prise en charge toujours facturée (€/km APPROCHE). */
        mode: "always_approach",
        pricePerKm: pricing.classicTrip.approachPricePerKm,
      },
      returnToBase: {
        enabled: pricing.classicTrip.returnToBaseEnabled,
        /** Retour destination→base : facturé au même €/km que l’approche lorsque activé dans les paramètres. */
        mode: pricing.classicTrip.returnToBaseEnabled ? "always_return_base" : "none",
        pricePerKm: pricing.classicTrip.approachPricePerKm,
      },
      outOfPrimaryZone: {
        enabled: true,
        mode: "multiplier",
        value: pricing.classicTrip.outOfZoneMultiplier,
        /** Même jeu que le moteur JSON legacy (registry API). */
        zoneSetId: pricing.classicTrip.primaryServiceZoneSetId ?? PRIMARY_SERVICE_ZONE_SET_ID,
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
