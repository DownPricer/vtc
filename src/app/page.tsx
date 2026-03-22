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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

export const metadata: Metadata = {
  title: "VTC Le Havre, Fécamp, Pays de Caux — Navette Aéroport Orly CDG Beauvais | YGvtc VTC76",
  description:
    "Chauffeur privé VTC en Seine-Maritime : Le Havre, Fécamp, Goderville, Yvetot. Transferts aéroport Orly, Roissy CDG, Beauvais, Caen. Tarifs fixes, prise en charge à domicile, réservation en ligne 7j/7. Service premium, ponctualité garantie.",
  alternates: {
    canonical: SITE_URL,
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#localbusiness`,
  name: "YGvtc VTC76",
  alternateName: "VTC76",
  description: "Chauffeur privé VTC en Seine-Maritime. Transferts aéroport vers Orly, Roissy CDG, Beauvais et Caen. Service premium au départ du Havre, Fécamp, Goderville, Pays de Caux.",
  url: SITE_URL,
  telephone: "+33769989523",
  email: "contact@vtc76.fr",
  image: `${SITE_URL}/images/og-vtc76.jpg`,
  logo: `${SITE_URL}/images/vtc76.png`,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Carte bancaire, Espèces, Virement, Chèque",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "30 rue Jean Prévost",
    addressLocality: "Goderville",
    postalCode: "76110",
    addressRegion: "Normandie",
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.6481,
    longitude: 0.3706,
  },
  areaServed: [
    { "@type": "City", name: "Le Havre" },
    { "@type": "City", name: "Fécamp" },
    { "@type": "City", name: "Goderville" },
    { "@type": "City", name: "Yvetot" },
    { "@type": "City", name: "Bolbec" },
    { "@type": "City", name: "Étretat" },
    { "@type": "City", name: "Saint-Romain-de-Colbosc" },
    { "@type": "AdministrativeArea", name: "Pays de Caux" },
    { "@type": "AdministrativeArea", name: "Seine-Maritime" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services VTC",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Transfert Aéroport Orly", description: "Navette VTC vers l'aéroport Paris-Orly depuis la Seine-Maritime" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Transfert Aéroport Roissy CDG", description: "Navette VTC vers l'aéroport Roissy Charles de Gaulle" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Transfert Aéroport Beauvais", description: "Navette VTC vers l'aéroport de Beauvais-Tillé" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Mise à Disposition", description: "Chauffeur privé à l'heure pour mariages, séminaires et événements" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Chauffeur Privé", description: "Trajets locaux et longue distance en Seine-Maritime et Normandie" },
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    bestRating: "5",
    worstRating: "1",
    reviewCount: "30",
    ratingCount: "30",
  },
  sameAs: [
    "https://www.google.com/maps/place/YGvtc+VTC76",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "YGvtc VTC76",
  alternateName: "VTC76",
  url: SITE_URL,
  description: "Site officiel de YGvtc VTC76 — Chauffeur privé et transferts aéroport en Normandie",
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
      <RadioSection />
      <CTASection />
    </>
  );
}
