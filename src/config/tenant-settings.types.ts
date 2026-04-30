export type FieldPriority = "CRITIQUE" | "V1_INDISPENSABLE" | "V1_UTILE" | "V2" | "HORS_SCOPE";

export type BadgeId =
  | "vtc_card"
  | "payment_onboard"
  | "premium_vehicle"
  | "flight_tracking"
  | "availability_24_7"
  | "luggage_included"
  | "fixed_price"
  | "home_pickup"
  | "punctuality"
  | "professional_driver"
  | "no_surcharge";

export type BadgePlacementId =
  | "home_about_atouts"
  | "home_cta_guarantees"
  | "pricing_page_guarantees"
  | "calculator_hero_guarantees";

export type IconKey =
  | "id_card"
  | "car"
  | "credit_card"
  | "globe"
  | "clock"
  | "luggage_check"
  | "shield_check"
  | "home"
  | "check"
  | "user_badge"
  | "users"
  | "building"
  | "refresh"
  | "calendar"
  | "plane"
  | "sparkle"
  | "bank"
  | "cash"
  | "document"
  | "ban";

export type TenantBadge = {
  id: BadgeId;
  text: string;
  iconKey: IconKey;
  enabled: boolean;
};

export type BadgePlacementItem = {
  badgeId: BadgeId;
  /** Permet de conserver un libellé spécifique selon l’emplacement (sans dupliquer la bibliothèque). */
  textOverride?: string;
};

export type TenantBadgePlacements = Record<BadgePlacementId, BadgePlacementItem[]>;

export type PaymentMethod = {
  id: "card" | "transfer" | "cash" | "cheque";
  label: string;
  sub: string;
  iconKey: IconKey;
  enabled: boolean;
};

export type HomeHeroCta = {
  id: "calculator" | "quote";
  label: string;
  href: string;
  enabled: boolean;
};

export type FeaturedVehicle = {
  id: string;
  name: string;
  headline: string;
  passengerMax: number;
  highlightText?: string;
  paymentChips: string[];
  gallery: Array<{ src: string; alt: string; tag: string }>;
};

export type TestimonialItem = {
  id: string;
  text: string;
  author: string;
  trajet?: string;
  rating: number;
  date?: string;
  enabled: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  iconKey: IconKey;
  enabled: boolean;
};

export type ServiceItem = {
  id: string;
  num: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  tags: string[];
  iconKey: IconKey;
  enabled: boolean;
};

export type CommitmentItem = {
  id: string;
  num: string;
  title: string;
  description: string;
  iconKey: IconKey;
  enabled: boolean;
};

export type PricingTransferCard = {
  id: string;
  depart: string;
  destination: string;
  code: string;
  prixAller: string;
  prixAR: string;
  duree: string;
  km: string;
  featured: boolean;
  enabled: boolean;
};

export type PricingHighlights = {
  popularTransfersEnabled: boolean;
  popularTransfers: Array<{
    id: string;
    depart: string;
    destination: string;
    code: string;
    prixAller: string;
    prixAR: string;
    duree: string;
    featured: boolean;
    enabled: boolean;
  }>;
  madEnabled: boolean;
  madHourlyFrom: number;
  madSubtitle: string;
};

/** Paramètres « vitrine » du calculateur (affichage / limites UI) — distinct du moteur de tarification. */
export type CalculatorServiceTypeDisplay = {
  id: string;
  label: string;
  sublabel: string;
  enabled: boolean;
};

export type CalculatorAirportDisplay = {
  code: string;
  label: string;
  address: string;
};

export type CalculatorExtraOptionDisplay = {
  id: string;
  label: string;
  enabled: boolean;
};

export type TenantCalculatorDisplayV1 = {
  serviceTypes: CalculatorServiceTypeDisplay[];
  maxPassengers: number;
  /** Indice max du sélecteur bagages (0 = aucun, 8 = 8 bagages) — 9 options au total. */
  maxBaggageIndex: number;
  airports: CalculatorAirportDisplay[];
  extrasOptions: CalculatorExtraOptionDisplay[];
};

export type TenantSettingsV1 = {
  general: {
    commercialName: string;
    legalName: string;
    tagline: string;
    regionLabel: string;
    serviceAreas: {
      headline: string;
      cities: string[];
      description: string;
    };
  };

  branding: {
    logoSrc: string;
    logoAlt: string;
    ogImageSrc: string;
    colors: {
      primary: string;
      primaryDark: string;
      primaryLight: string;
      secondary: string;
      secondaryDark: string;
      accentHighlight: string;
      accentWarm: string;
      gameNeon: string;
      background: string;
      foreground: string;
      surface: string;
      surfaceHover: string;
      darkMedium: string;
      darkLight: string;
      muted: string;
      mutedStrong: string;
      grayDeep: string;
      borderSubtle: string;
      success: string;
      warning: string;
    };
  };

  contact: {
    phoneDisplay: string;
    phoneE164: string;
    whatsappDigits?: string;
    emailPublic: string;
    address: {
      street: string;
      postalCode: string;
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    whatsappPrefillText: string;
  };

  home: {
    hero: {
      backgroundImageSrc: string;
      imageAlt: string;
      badgeText: string;
      titleLine1: string;
      titleHighlight: string;
      subtitle: string;
      bullets: string;
      ctas: HomeHeroCta[];
    };
    aboutPreview: {
      sectionTitle: string;
      driverDisplayName: string;
      roleLabel: string;
      vehicleLabel: string;
      leadParagraph: string;
      secondaryParagraph: string;
      portraitSrc: string;
      portraitAlt: string;
      ctaDriverName: string;
    };
    commitments: {
      eyebrow: string;
      titlePrefix: string;
      titleBrand: string;
      subtitle: string;
      ctaLabel: string;
      ctaHref: string;
      items: CommitmentItem[];
    };
    featuredVehicle: FeaturedVehicle;
    video: {
      enabled: boolean;
      eyebrow: string;
      titlePrefix: string;
      titleBrand: string;
      description: string;
      posterSrc: string;
      videoSrc: string;
      markers: Array<{ id: string; label: string; sub: string; iconKey: IconKey; enabled: boolean }>;
    };
    paymentMethods: {
      enabled: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      items: PaymentMethod[];
    };
    ctaFinal: {
      enabled: boolean;
      backgroundImageSrc: string;
      eyebrow: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      phoneLabel: string;
      ctas: Array<{ id: string; label: string; href: string; enabled: boolean }>;
      guarantees: Array<{ id: string; badgeId: BadgeId; enabled: boolean }>;
    };
  };

  pricingDisplay: {
    tarifsPage: {
      heroImageSrc: string;
      heroImageAlt: string;
      heroBadge: string;
      heroTitle: string;
      heroTitleHighlight: string;
      heroIntro: string;
      guarantees: Array<{ id: string; badgeId: BadgeId; enabled: boolean }>;
      transfers: PricingTransferCard[];
      servicesSpecialEyebrow: string;
      madTitle: string;
      madSubtitle: string;
      madVehicleHint: string;
      madHourlyFrom: number;
      ctaPrimaryLabel: string;
      ctaSecondaryLabel: string;
    };
    highlights: PricingHighlights;
    codeColors: Record<string, { bg: string; text: string; dot: string }>;
  };

  services: {
    pageHero: {
      imageSrc: string;
      imageAlt: string;
      eyebrow: string;
      title: string;
      titleHighlight: string;
      intro: string;
    };
    items: ServiceItem[];
    comfortBlock: {
      eyebrow: string;
      vehicleName: string;
      bullets: string;
      paymentChips: string[];
    };
  };

  faq: {
    enabled: boolean;
    pageHero: {
      eyebrow: string;
      title: string;
      titleHighlight: string;
      introTemplate: string;
    };
    items: FaqItem[];
    cta: {
      missingAnswerText: string;
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel: string;
      secondaryHref: string;
    };
  };

  testimonials: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    titleHighlight: string;
    ratingLabel: string;
    ratingValueText: string;
    ratingCountLabel: string;
    reviewsUrl?: string;
    items: TestimonialItem[];
  };

  aboutPage: {
    heroImageSrc: string;
    heroImageAlt: string;
    values: Array<{ id: string; label: string; desc: string; iconKey: IconKey; enabled: boolean }>;
    vehicleBlock: {
      title: string;
      helperText: string;
      paymentChips: string[];
    };
    ctas: Array<{ id: string; label: string; href: string; enabled: boolean }>;
    storyLead: string;
    storySecondary: string;
    storyClosing: string;
    storyLocation: string;
  };

  contactPage: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    intro: string;
    formTitle: string;
    directTitle: string;
  };

  thanksPage: {
    title: string;
    description: string;
    heading: string;
    highlight: string;
    body: string;
    infoResponseLabel: string;
    infoResponseValue: string;
    infoPhoneLabel: string;
  };

  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    openGraphLocale: string;
    category: string;
  };

  legal: {
    displayName: string;
    legalRepresentative: string;
    siret: string;
    vtcLicenseNumber: string;
    hosting: { name: string; address: string; website: string };
    privacySummary: string;
  };

  badges: {
    library: TenantBadge[];
    placements: TenantBadgePlacements;
  };

  vehicles: {
    featuredVehicleId: string;
    featured: FeaturedVehicle;
  };

  /** Référentiel d’affichage du calculateur (limites, listes) — ne pilote pas le moteur pricing. */
  calculatorDisplay: TenantCalculatorDisplayV1;
};

