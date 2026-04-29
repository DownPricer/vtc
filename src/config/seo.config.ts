import { siteConfig } from "./site.config";

const brand = siteConfig.commercialName;
const region = siteConfig.seo.regionLabel;

export const seoConfig = {
  /** Titre par défaut (onglet navigateur) */
  defaultTitle: `Chauffeur privé VTC — ${brand}`,
  titleTemplate: `%s | ${brand}`,
  defaultDescription: `${brand} : transferts aéroport, trajets sur mesure et mise à disposition. Réservation en ligne, tarifs transparents, service professionnel en ${region}.`,
  keywords: [
    "VTC",
    "chauffeur privé",
    "transfert aéroport",
    "navette aéroport",
    "mise à disposition",
    "réservation VTC",
    brand,
    ...siteConfig.seo.extraKeywords,
  ],
  openGraphLocale: "fr_FR",
  category: "Transport" as const,
} as const;
