import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TarifsHighlightSection } from "@/components/sections/TarifsHighlightSection";
import { VideoSection } from "@/components/sections/VideoSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { PaymentSection } from "@/components/sections/PaymentSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { RadioSection } from "@/components/sections/RadioSection";
import { CTASection } from "@/components/sections/CTASection";
import { siteConfig } from "@/config/site.config";
import { businessConfig } from "@/config/business.config";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";

const SITE_URL = getPublicSiteUrl();
const hq = businessConfig.headquarters;
const ogAbs = `${SITE_URL}${siteConfig.branding.ogImageSrc}`;
const logoAbs = `${SITE_URL}${siteConfig.branding.logoSrc}`;

export const metadata: Metadata = {
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  alternates: {
    canonical: SITE_URL,
  },
};

const sameAs: string[] = [];
if (siteConfig.urls.reviewsUrl) sameAs.push(siteConfig.urls.reviewsUrl);
if (siteConfig.urls.primarySocialUrl) sameAs.push(siteConfig.urls.primarySocialUrl);

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#localbusiness`,
  name: siteConfig.legalName,
  alternateName: siteConfig.commercialName,
  description: seoConfig.defaultDescription,
  url: SITE_URL,
  telephone: siteConfig.contact.phoneE164,
  email: siteConfig.contact.email,
  image: ogAbs,
  logo: logoAbs,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Carte bancaire, Espèces, Virement, Chèque",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: siteConfig.openingHours.days,
    opens: siteConfig.openingHours.opens,
    closes: siteConfig.openingHours.closes,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: hq.street,
    addressLocality: hq.city,
    postalCode: hq.postalCode,
    addressCountry: hq.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: hq.latitude,
    longitude: hq.longitude,
  },
  areaServed: siteConfig.serviceAreas.cities.map((name) => ({
    "@type": "City",
    name,
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services VTC",
    itemListElement: siteConfig.schemaOffers.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: o.name,
          description: o.description,
        },
      },
    })),
  },
  ...(sameAs.length ? { sameAs } : {}),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: siteConfig.commercialName,
  alternateName: siteConfig.legalName,
  url: SITE_URL,
  description: seoConfig.defaultDescription,
  publisher: { "@id": `${SITE_URL}/#localbusiness` },
  inLanguage: "fr-FR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/calculateur`,
    },
    "query-input": undefined,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TarifsHighlightSection />
      <VideoSection />
      <PaymentSection />
      <TestimonialsSection />
      {siteConfig.features.radioHomeSection ? <RadioSection /> : null}
      <CTASection />
    </>
  );
}
