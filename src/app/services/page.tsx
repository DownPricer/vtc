import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";

const SITE_URL = getPublicSiteUrl();

export const metadata = {
  title: `Services VTC — ${siteConfig.commercialName}`,
  description: `Transferts aéroport, mise à disposition et chauffeur privé. ${seoConfig.defaultDescription}`,
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
};

const services = [
  {
    num: "01",
    title: "Transferts Aéroports",
    desc: "Liaisons directes vers Orly, Roissy CDG, Beauvais et Caen. Prise en charge à domicile, suivi des vols en temps réel. Aucun supplément en cas de retard.",
    href: "/calculateur",
    cta: "Réserver en ligne",
    tags: ["Orly", "CDG", "Beauvais", "Caen"],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Mise à Disposition",
    desc: "Votre chauffeur privé à l'heure pour vos événements : mariages, séminaires, déplacements professionnels, soirées. Service sur mesure et discret.",
    href: "/devis",
    cta: "Demander un devis",
    tags: ["Mariage", "Séminaire", "Événement", "À l'heure"],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Chauffeur Privé",
    desc: `Trajets locaux et longue distance. ${siteConfig.about.vehicleLabel} — flexibilité et tarifs annoncés clairement.`,
    href: "/devis",
    cta: "Devis gratuit",
    tags: siteConfig.serviceAreas.cities.slice(0, 4),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2m-6 0H6m12 0a2 2 0 104 0m-4 0a2 2 0 014 0M4 17H2M3 7l2-2h10l3 4H3V7zm0 4v4" />
      </svg>
    ),
  },
];

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Chauffeur privé VTC",
  provider: {
    "@type": "LocalBusiness",
    name: siteConfig.commercialName,
    url: SITE_URL,
  },
  areaServed: siteConfig.serviceAreas.cities.map((name) => ({
    "@type": "City",
    name,
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: `Services VTC — ${siteConfig.commercialName}`,
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Transferts Aéroports",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Transfert vers Orly" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Transfert vers Roissy CDG" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Transfert vers Beauvais" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Transfert vers Caen" } },
        ],
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Mise à Disposition",
          description: "Chauffeur privé à l'heure pour mariages, séminaires, événements professionnels",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Chauffeur Privé",
          description: siteConfig.serviceAreas.description,
        },
      },
    ],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
  ],
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero avec fond photo ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/car-airport-back.png"
            alt="Services VTC Normandie"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/88" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-5">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-primary text-[11px] font-bold tracking-widest uppercase">Nos services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            Un service<br />
            <span className="text-gradient">sur mesure</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed">
            Transferts aéroport, mise à disposition événementielle, trajets locaux. Confort premium à chaque course.
          </p>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">

        <div className="space-y-4 mb-12">
          {services.map((s) => (
            <div
              key={s.title}
              className="group relative p-6 md:p-7 rounded-2xl border border-white/[0.07] hover:border-primary/35 transition-all duration-300 overflow-hidden"
              style={{ background: "linear-gradient(145deg, #1a1a1a, #111)" }}
            >
              {/* Numéro fond */}
              <span className="absolute -bottom-2 -right-1 text-8xl font-black text-white/[0.025] group-hover:text-primary/[0.04] transition-colors select-none leading-none">
                {s.num}
              </span>
              {/* Ligne gauche au hover */}
              <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary/40 tracking-widest">{s.num}</span>
                    <h2 className="text-lg font-black text-white group-hover:text-primary/90 transition-colors">{s.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-500 border border-white/[0.06]">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-500 leading-relaxed text-sm mb-5 relative z-10 max-w-2xl">{s.desc}</p>

              <Link
                href={s.href}
                className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-glow active:scale-95"
              >
                {s.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* Véhicule */}
        <div
          className="p-5 md:p-6 rounded-2xl border border-white/[0.07]"
          style={{ background: "linear-gradient(145deg, #1a1a1a, #111)" }}
        >
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Votre confort</p>
          <p className="text-white font-bold text-base mb-1">
            Renault Espace 5 Initiale Paris
          </p>
          <p className="text-gray-500 text-sm mb-3">4 passagers max · Climatisation · Sièges confortables · Bagages inclus</p>
          <div className="flex flex-wrap gap-2">
            {["CB", "Virement", "Espèces", "Chèque"].map((m) => (
              <span key={m} className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-gray-400 font-medium">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
