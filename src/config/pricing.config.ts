/**
 * Moteur de tarification — données métier par client VTC.
 * Éditer ce fichier (ou le dupliquer par déploiement) pour adapter grilles, base, zones, jours fériés.
 */
import { COMMUNES_76 } from "@/lib/communes76";

export const TIMEZONE = "Europe/Paris";

/** Adresse de référence du véhicule (point de départ des calculs d’approche / retour base). */
export const BASE_ADDRESS = "Paris, France";

/** Liste des jours fériés au format JJ/MM/AAAA (fuseau TIMEZONE). Étendez par années. */
export const PUBLIC_HOLIDAYS: readonly string[] = [
  // 2025
  "01/01/2025",
  "14/04/2025",
  "01/05/2025",
  "08/05/2025",
  "22/05/2025",
  "02/06/2025",
  "14/07/2025",
  "15/08/2025",
  "01/11/2025",
  "11/11/2025",
  "25/12/2025",
  // 2026 (France métropolitaine — à valider / compléter selon calendrier officiel)
  "01/01/2026",
  "06/04/2026",
  "01/05/2026",
  "08/05/2026",
  "14/05/2026",
  "25/05/2026",
  "14/07/2026",
  "15/08/2026",
  "01/11/2026",
  "11/11/2026",
  "25/12/2026",
];

/** @deprecated alias — utiliser PUBLIC_HOLIDAYS */
export const JOURS_FERIES_2025 = PUBLIC_HOLIDAYS;

export const AIRPORT_BUFFERS: Record<
  string,
  { preFlightMin: number; arrivalMin: number; dropoffMarginMin: number }
> = {
  default: { preFlightMin: 120, arrivalMin: 30, dropoffMarginMin: 10 },
  ORY: { preFlightMin: 120, arrivalMin: 30, dropoffMarginMin: 10 },
  CDG: { preFlightMin: 150, arrivalMin: 35, dropoffMarginMin: 10 },
  BVA: { preFlightMin: 120, arrivalMin: 45, dropoffMarginMin: 10 },
  CC: { preFlightMin: 90, arrivalMin: 15, dropoffMarginMin: 5 },
};

export const AIRPORTS: Record<string, { names: string[]; address: string }> = {
  ORY: {
    names: ["ory", "orly", "paris orly", "paris-orly"],
    address: "Aéroport de Paris-Orly, 94390 Orly, France",
  },
  CDG: {
    names: ["cdg", "roissy", "charles de gaulle", "charles-de-gaulle", "paris cdg", "paris-cdg"],
    address: "Aéroport Charles de Gaulle, 95700 Roissy-en-France, France",
  },
  BVA: {
    names: ["bva", "beauvais", "paris beauvais", "paris-beauvais", "beauvais-tillé", "tille", "tillé"],
    address: "Aéroport de Beauvais-Tillé, Route de l'Aéroport, 60000 Tillé, France",
  },
  CC: {
    names: ["cc", "caen", "carpiquet", "caen-carpiquet"],
    address: "Aéroport de Caen-Carpiquet, 14650 Carpiquet, France",
  },
};

export const TA_TABLE: Record<
  string,
  Record<string, Record<string, { tarifKm: number; min: number }>>
> = {
  ORY: {
    SIMPLE: { "1-2": { tarifKm: 0.54, min: 225 }, "3-4": { tarifKm: 0.58, min: 235 } },
    ALLER_RETOUR: { "1-2": { tarifKm: 0.54, min: 450 }, "3-4": { tarifKm: 0.58, min: 470 } },
  },
  CDG: {
    SIMPLE: { "1-2": { tarifKm: 0.54, min: 230 }, "3-4": { tarifKm: 0.58, min: 240 } },
    ALLER_RETOUR: { "1-2": { tarifKm: 0.54, min: 460 }, "3-4": { tarifKm: 0.58, min: 480 } },
  },
  BVA: {
    SIMPLE: { "1-2": { tarifKm: 0.62, min: 220 }, "3-4": { tarifKm: 0.62, min: 230 } },
    ALLER_RETOUR: { "1-2": { tarifKm: 0.62, min: 440 }, "3-4": { tarifKm: 0.62, min: 460 } },
  },
  CC: {
    SIMPLE: { "1-2": { tarifKm: 0.64, min: 165 }, "3-4": { tarifKm: 0.64, min: 180 } },
    ALLER_RETOUR: { "1-2": { tarifKm: 0.64, min: 330 }, "3-4": { tarifKm: 0.64, min: 360 } },
  },
};

export const TC_TABLE = {
  SIMPLE: {
    ZONES: {
      1: { min: 30, tarifsKm: { "1-50": 2.0, "51-90": 1.8, "91-150": 1.6, "+150": 1.4 } },
      2: { min: 60, tarifsKm: { "1-50": 2.0, "51-90": 1.8, "91-150": 1.6, "+150": 1.4 } },
      3: { min: 140, tarifsKm: { "1-50": 2.2, "51-90": 2.0, "91-150": 1.8, "+150": 1.5 } },
      4: { min: 180, tarifsKm: { "1-50": 2.2, "51-90": 2.0, "91-150": 1.8, "+150": 1.5 } },
      5: { min: 300, tarifsKm: { "51-90": 2.0, "91-200": 1.8, "+200": 1.6 } },
    },
    APPROCHE: 0.5,
  },
  AR: {
    ZONES: {
      1: { min: 60, tarifsKm: { "1-50": 2.0, "51-90": 1.8, "91-150": 1.6, "+150": 1.4 } },
      2: { min: 120, tarifsKm: { "1-50": 2.0, "51-90": 1.8, "91-150": 1.6, "+150": 1.4 } },
      3: { min: 250, tarifsKm: { "1-50": 2.2, "51-90": 2.0, "91-150": 1.8, "+150": 1.5 } },
      4: { min: 350, tarifsKm: { "1-50": 2.2, "51-90": 2.0, "91-150": 1.8, "+150": 1.5 } },
      5: { min: 500, tarifsKm: { "51-90": 2.0, "91-200": 1.8, "+200": 1.6 } },
    },
    APPROCHE: 0.5,
  },
} as const;

export const MAJ = {
  pctNight: 0.2,
  pctEvening: 0.1,
  pctWE: 0.2,
  pctFerie: 0.25,
  minEuros: 0,
};

export const APPLY_AR_DISCOUNT = true;

/** Multiplicateur appliqué si le départ n’est pas dans la zone « service principal » (communes listées). */
export const OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER = 1.05;

/** @deprecated utiliser OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER */
export const MAJORATION_HORS_76 = OUT_OF_PRIMARY_SERVICE_ZONE_MULTIPLIER;

/**
 * Communes normalisées (slug) pour détecter le départ dans la zone tarifaire préférentielle.
 * Par défaut : jeu de données Seine-Maritime (76). Remplacez par votre liste ou importez un autre fichier.
 */
export const PRIMARY_SERVICE_ZONE_COMMUNES = COMMUNES_76;

/** Tarifs horaires MAD « classique » / soir / nuit & WE+férié (€/h) — ajustez par client. */
export const MAD_HOURLY_RATES = {
  default: 80,
  eveningOrNight: 100,
  weekendOrHoliday: 120,
} as const;

export const MAD_EVENT_MINIMUM_TOTAL = 200;

/** Titre par défaut des liens Google Calendar générés */
export const CALENDAR_EVENT_TITLE_PREFIX = "Course VTC";
