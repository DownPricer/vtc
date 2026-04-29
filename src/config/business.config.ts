/**
 * Informations légales et société — personnaliser par client VTC.
 */

export const businessConfig = {
  /** Raison sociale affichée aux mentions légales */
  legalName: "SAS Exemple VTC",
  /** Forme courte pour le pied de page */
  displayName: "Exemple VTC",
  /** Représentant légal (placeholder) */
  legalRepresentative: "À compléter",
  /** SIREN / SIRET (placeholder) */
  siret: "000 000 000 00000",
  /** Numéro de licence / carte VTC si applicable */
  vtcLicenseNumber: "À compléter",
  /** Siège social */
  headquarters: {
    street: "Adresse à compléter",
    postalCode: "00000",
    city: "Ville",
    country: "FR",
    /** Coordonnées pour schema.org (ex. centre-ville) */
    latitude: 48.8566,
    longitude: 2.3522,
  },
  /** Hébergeur du site (mention légale type) */
  hosting: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, USA",
    website: "https://vercel.com",
  },
  /** Texte court RGPD / traitement des données (compléter avec votre DPO / juriste) */
  privacySummary:
    "Les données collectées via les formulaires servent uniquement à traiter vos demandes de contact, devis et réservation. Durée de conservation et destinataires : à préciser dans votre politique de confidentialité.",
} as const;
