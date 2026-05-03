import type { TenantSettingsV1 } from "./tenant-settings.types";

export type SocialLink = { id: string; href: string; label: string };

export type Testimonial = {
  text: string;
  author: string;
  trajet?: string;
  rating: number;
  /** Affiché en badge (ex. « Janvier 2026 ») */
  date?: string;
};

export function buildSiteConfigFromTenant(t: TenantSettingsV1) {
  const exKeywords = ["course VTC", "transport avec chauffeur"];

  return {
    legalName: t.general.legalName,
    commercialName: t.general.commercialName,
    tagline: t.general.tagline,

    urls: {
      defaultSiteUrl: "http://localhost:3000",
      reviewsUrl: t.testimonials.reviewsUrl ?? "",
      primarySocialUrl: "",
    },

    branding: {
      logoSrc: t.branding.logoSrc,
      logoAlt: t.branding.logoAlt,
      ogImageSrc: t.branding.ogImageSrc,
      colors: { ...t.branding.colors },
    },

    contact: {
      phoneDisplay: t.contact.phoneDisplay,
      phoneE164: t.contact.phoneE164,
      whatsappDigits: t.contact.whatsappDigits ?? "",
      email: t.contact.emailPublic,
    },

    timezoneLabel: "Europe/Paris",

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

    serviceAreas: {
      headline: t.general.serviceAreas.headline,
      cities: [...t.general.serviceAreas.cities],
      description: t.general.serviceAreas.description,
    },

    seo: {
      regionLabel: t.general.regionLabel,
      extraKeywords: exKeywords,
    },

    about: {
      sectionTitle: t.home.aboutPreview.sectionTitle,
      driverDisplayName: t.home.aboutPreview.driverDisplayName,
      roleLabel: t.home.aboutPreview.roleLabel,
      vehicleLabel: t.home.aboutPreview.vehicleLabel,
      leadParagraph: t.home.aboutPreview.leadParagraph,
      secondaryParagraph: t.home.aboutPreview.secondaryParagraph,
      storyLead: t.aboutPage.storyLead,
      storyLocation: t.aboutPage.storyLocation,
      storyClosing: t.aboutPage.storyClosing,
      ctaDriverName: t.home.aboutPreview.ctaDriverName,
      portraitSrc: t.home.aboutPreview.portraitSrc,
      portraitAlt: t.home.aboutPreview.portraitAlt,
    },

    testimonials: t.testimonials.items
      .filter((x) => x.enabled)
      .map((x) => ({
        text: x.text,
        author: x.author,
        trajet: x.trajet,
        rating: x.rating,
        date: x.date,
      })) satisfies Testimonial[],

    socialLinks: [] satisfies SocialLink[],

    booking: {
      calendarEventTitlePrefix: "Course VTC",
    },

    hero: {
      badge: t.home.hero.badgeText,
      imageAlt: t.home.hero.imageAlt,
      titleLine1: t.home.hero.titleLine1,
      titleHighlight: t.home.hero.titleHighlight,
      subtitle: t.home.hero.subtitle,
      bullets: t.home.hero.bullets,
    },

    schemaOffers: [
      { name: "Transfert aéroport", description: "Navette et prise en charge vers les principaux aéroports." },
      { name: "Mise à disposition", description: "Chauffeur privé à l’heure pour événements professionnels ou privés." },
      { name: "Chauffeur privé", description: "Trajets sur mesure, confort et ponctualité." },
    ] as const,

    features: {
      introScreen: true,
      miniGame: false,
      radioPage: false,
      radioHomeSection: false,
      floatingRadioButton: false,
      payPal: false,
      sendCustomerConfirmationEmail: true,
    },
  } as const;
}

export type SiteConfig = ReturnType<typeof buildSiteConfigFromTenant>;
