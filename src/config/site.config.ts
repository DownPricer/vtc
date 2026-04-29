/**
 * Configuration vitrine & contact — modèle white-label VTC.
 * Dupliquez ce fichier par client ou surchargez via variables d’environnement documentées dans README.
 */

export type SocialLink = { id: string; href: string; label: string };

export type Testimonial = {
  text: string;
  author: string;
  trajet?: string;
  rating: number;
  /** Affiché en badge (ex. « Janvier 2026 ») */
  date?: string;
};

export const siteConfig = {
  /** Raison ou enseigne longue */
  legalName: "SAS Exemple VTC",
  /** Nom commercial court (header, meta) */
  commercialName: "Exemple VTC",
  /** Sous-titre court sous le logo */
  tagline: "Chauffeur privé & transferts",

  urls: {
    /** Utilisé si NEXT_PUBLIC_SITE_URL est absent */
    defaultSiteUrl: "http://localhost:3000",
    /** Lien « avis clients » (Google Business, Trustpilot, etc.) */
    reviewsUrl: "https://www.google.com/search?q=VTC",
    /** Page réseaux ou site pro (optionnel) */
    primarySocialUrl: "",
  },

  branding: {
    logoSrc: "/images/logo.png",
    logoAlt: "Logo VTC",
    ogImageSrc: "/images/og-default.jpg",
    /**
     * Palette complète — injectée en variables CSS (`getBrandCssVariables`, `globals.css`).
     * Ajustez par client pour rebranding sans toucher aux composants.
     */
    colors: {
      primary: "#FF8533",
      primaryDark: "#E07A2E",
      primaryLight: "#FFA366",
      /** Accent froid (pages devis, mode `[data-mode="devis"]`, touches UI secondaires) */
      secondary: "#6496FF",
      secondaryDark: "#5080E0",
      /** Reflets / badges / fin des dégradés texte */
      accentHighlight: "#FFD580",
      /** Halo chaud secondaire (grilles hero, halos) */
      accentWarm: "#FF5520",
      /** Néon jeu arcade (optionnel visuel) */
      gameNeon: "#00D2FF",
      background: "#0A0A0A",
      foreground: "#FFFFFF",
      surface: "#1C1C1C",
      surfaceHover: "#252525",
      darkMedium: "#1A1A1A",
      darkLight: "#2A2A2A",
      /** Textes atténués & bordures UI */
      muted: "#808080",
      mutedStrong: "#606060",
      grayDeep: "#404040",
      borderSubtle: "rgba(255,255,255,0.1)",
      success: "#22C55E",
      warning: "#EAB308",
    },
  },

  contact: {
    /** Affichage humain */
    phoneDisplay: "06 00 00 00 00",
    /** Lien tel: sans espaces */
    phoneE164: "+33600000000",
    /** WhatsApp : indicatif + numéro sans + ni espaces (ex: 33600000000) */
    whatsappDigits: "33600000000",
    email: "contact@example.com",
  },

  /** Fuseau d’affichage légal */
  timezoneLabel: "Europe/Paris",

  /** Heures d’ouverture schema.org (ajustez) */
  openingHours: {
    opens: "00:00",
    closes: "23:59",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ] as const,
  },

  /** Zones desservies (texte marketing + schema) */
  serviceAreas: {
    headline: "Votre région et au-delà",
    cities: [
      "Ville exemple 1",
      "Ville exemple 2",
      "Ville exemple 3",
      "Aéroports nationaux",
    ],
    /** Texte long pour FAQ / à propos */
    description:
      "Intervention sur la métropole et trajets longue distance sur demande. Transferts aéroport et courses professionnelles.",
  },

  seo: {
    regionLabel: "France",
    extraKeywords: ["course VTC", "transport avec chauffeur"],
  },

  /** Contenu page d’accueil — bloc « à propos » court */
  about: {
    /** Titre section */
    sectionTitle: "Votre chauffeur privé",
    /** Nom affiché du chauffeur / de l’équipe (pas de données personnelles réelles dans le template) */
    driverDisplayName: "Votre équipe VTC",
    roleLabel: "Chauffeur privé professionnel",
    /** Ligne véhicule (modèle réel à renseigner par client) */
    vehicleLabel: "Véhicule premium · jusqu’à 4 passagers",
    leadParagraph:
      "Nous assurons des transferts fiables, un véhicule haut de gamme et une disponibilité adaptée aux professionnels comme aux particuliers.",
    secondaryParagraph:
      "Réservez en ligne, obtenez un tarif indicatif immédiat et recevez une confirmation par e-mail.",
    storyLead:
      "Une équipe dédiée à rendre vos trajets confortables, ponctuels et sans stress.",
    storyLocation:
      "Basés sur votre zone d’intervention, nous couvrons les trajets locaux comme les transferts longue distance.",
    storyClosing:
      "Prêt à voyager différemment ? Contactez-nous pour une réservation ou un devis personnalisé.",
    ctaDriverName: "notre équipe",
    portraitSrc: "/images/portrait.jpg",
    portraitAlt: "Portrait équipe VTC",
  },

  testimonials: [
    {
      text: "Service ponctuel, véhicule impeccable et tarif annoncé respecté. Je recommande pour les trajets aéroport.",
      author: "Client particulier",
      trajet: "Domicile → aéroport",
      rating: 5,
      date: "Janvier 2026",
    },
    {
      text: "Très professionnel pour nos déplacements d’entreprise. Réactivité au top.",
      author: "Responsable administratif",
      trajet: "Mise à disposition",
      rating: 5,
      date: "Décembre 2025",
    },
    {
      text: "Conducteur courtois, conduite souple, excellent rapport qualité-prix.",
      author: "Voyageur",
      trajet: "Longue distance",
      rating: 5,
      date: "Novembre 2025",
    },
    {
      text: "Organisation parfaite pour notre événement : plusieurs allers-retours, aucun retard.",
      author: "Coordinateur événementiel",
      trajet: "Navette événement",
      rating: 5,
      date: "Octobre 2025",
    },
    {
      text: "Première expérience VTC : accueil chaleureux, trajet fluide, je referai appel à ce service.",
      author: "Famille L.",
      trajet: "Transfert famille",
      rating: 5,
      date: "Septembre 2025",
    },
  ] satisfies Testimonial[],

  socialLinks: [] satisfies SocialLink[],

  /** Préfixe titre événements calendrier (Google Calendar) */
  booking: {
    calendarEventTitlePrefix: "Course VTC",
  },

  /** Accueil — bloc héros */
  hero: {
    badge: "Disponible 7j / 7",
    imageAlt: "Véhicule VTC premium",
    titleLine1: "Chauffeur privé",
    titleHighlight: "Transferts & trajets",
    subtitle: "Transferts aéroport, courses longue distance et mise à disposition.",
    bullets: "Prise en charge à domicile · Tarif transparent · Service professionnel",
  },

  /** Offres génériques pour schema.org LocalBusiness (JSON-LD) */
  schemaOffers: [
    {
      name: "Transfert aéroport",
      description: "Navette et prise en charge vers les principaux aéroports.",
    },
    {
      name: "Mise à disposition",
      description: "Chauffeur privé à l’heure pour événements professionnels ou privés.",
    },
    {
      name: "Chauffeur privé",
      description: "Trajets sur mesure, confort et ponctualité.",
    },
  ] as const,

  /** Fonctionnalités optionnelles */
  features: {
    introScreen: true,
    miniGame: false,
    radioPage: false,
    radioHomeSection: true,
    floatingRadioButton: true,
    payPal: false,
    sendCustomerConfirmationEmail: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
