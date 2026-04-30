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
import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { buildBusinessConfigFromTenant } from "@/config/businessConfigFromTenant";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";

const SITE_URL = getPublicSiteUrl();

export const metadata: Metadata = {
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function HomePage() {
  const tenantSettings = await getPublicTenantSettings();
  const site = buildSiteConfigFromTenant(tenantSettings);
  const business = buildBusinessConfigFromTenant(tenantSettings);
  const hq = business.headquarters;
  const ogAbs = `${SITE_URL}${site.branding.ogImageSrc}`;
  const logoAbs = `${SITE_URL}${site.branding.logoSrc}`;

  const sameAs: string[] = [];
  if (site.urls.reviewsUrl) sameAs.push(site.urls.reviewsUrl);
  if (site.urls.primarySocialUrl) sameAs.push(site.urls.primarySocialUrl);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: site.legalName,
    alternateName: site.commercialName,
    description: seoConfig.defaultDescription,
    url: SITE_URL,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    image: ogAbs,
    logo: logoAbs,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Carte bancaire, Espèces, Virement, Chèque",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: site.openingHours.days,
      opens: site.openingHours.opens,
      closes: site.openingHours.closes,
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
    areaServed: site.serviceAreas.cities.map((name) => ({
      "@type": "City",
      name,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services VTC",
      itemListElement: site.schemaOffers.map((o, i) => ({
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
    name: site.commercialName,
    alternateName: site.legalName,
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
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL }],
  };

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
      <HeroSection tenantSettings={tenantSettings} />
      <AboutSection tenantSettings={tenantSettings} />
      <ServicesSection tenantSettings={tenantSettings} />
      <TarifsHighlightSection tenantSettings={tenantSettings} />
      <VideoSection tenantSettings={tenantSettings} />
      <PaymentSection tenantSettings={tenantSettings} />
      <TestimonialsSection tenantSettings={tenantSettings} />
      {site.features.radioHomeSection ? <RadioSection /> : null}
      <CTASection tenantSettings={tenantSettings} />
    </>
  );
}
