import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";

const SITE_URL = getPublicSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getPublicTenantSettings();
  const site = buildSiteConfigFromTenant(tenant);
  return {
    title: `Tarifs VTC — ${site.commercialName}`,
    description: `Exemples de trajets et grille indicative. ${seoConfig.defaultDescription} Utilisez le calculateur pour un tarif personnalisé.`,
    alternates: {
      canonical: `${SITE_URL}/tarifs`,
    },
  };
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Tarifs", item: `${SITE_URL}/tarifs` },
  ],
};

const guaranteeIconByBadgeId: Partial<Record<string, string>> = {
  fixed_price: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  luggage_included: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  home_pickup: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  flight_tracking: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  availability_24_7: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  no_surcharge: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
};

type Garantie = { label: string; icon: string };

export default async function TarifsPage() {
  const tenant = await getPublicTenantSettings();
  const site = buildSiteConfigFromTenant(tenant);
  const exCity = site.serviceAreas.cities[0] || "Ville";
  const pricing = tenant.pricingDisplay.tarifsPage;
  const tarifs = pricing.transfers
    .filter((x) => x.enabled)
    .map((x) => (x.depart === tenant.general.serviceAreas.cities[0] ? { ...x, depart: exCity } : x));

  const codeColors = tenant.pricingDisplay.codeColors;

  const badgeLib = new Map(tenant.badges.library.filter((b) => b.enabled).map((b) => [b.id, b] as const));
  const garanties: Garantie[] = tenant.badges.placements.pricing_page_guarantees.flatMap((p) => {
    const b = badgeLib.get(p.badgeId);
    const icon = guaranteeIconByBadgeId[p.badgeId];
    if (!b || !icon) return [];
    return [{ label: p.textOverride ?? b.text, icon }];
  });

  const tarifsSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Transferts aéroport VTC — ${site.commercialName}`,
    provider: {
      "@type": "LocalBusiness",
      name: site.commercialName,
      url: SITE_URL,
    },
    offers: [
      {
        "@type": "Offer",
        name: "VTC zone centre → Orly",
        price: "260",
        priceCurrency: "EUR",
        description: "Exemple indicatif : zone centre vers Paris-Orly (prix à confirmer via calculateur).",
      },
      {
        "@type": "Offer",
        name: "VTC ville côte → Roissy CDG",
        price: "270",
        priceCurrency: "EUR",
        description: "Exemple indicatif : ville côte vers Roissy CDG (prix à confirmer via calculateur).",
      },
      {
        "@type": "Offer",
        name: "VTC ville est → Roissy CDG",
        price: "260",
        priceCurrency: "EUR",
        description: "Exemple indicatif : ville est vers Roissy CDG.",
      },
      {
        "@type": "Offer",
        name: "VTC site touristique → Orly",
        price: "260",
        priceCurrency: "EUR",
        description: "Exemple indicatif : site touristique vers Orly.",
      },
      {
        "@type": "Offer",
        name: `VTC ${exCity} → Caen`,
        price: "165",
        priceCurrency: "EUR",
        description: `Exemple de transfert depuis ${exCity} vers l'aéroport de Caen (indicatif).`,
      },
      {
        "@type": "Offer",
        name: "VTC ville voisine → Beauvais",
        price: "215",
        priceCurrency: "EUR",
        description: "Exemple indicatif : ville voisine vers Beauvais-Tillé.",
      },
      {
        "@type": "Offer",
        name: "Mise à Disposition — Chauffeur Privé",
        price: "80",
        priceCurrency: "EUR",
        unitText: "HOUR",
        description: "Chauffeur privé à l'heure pour mariages, séminaires, événements. À partir de 80€/h TTC.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tarifsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero avec fond photo ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={pricing.heroImageSrc}
            alt={pricing.heroImageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Fond sombre homogène — pas de zone « transparente » sur une photo claire */}
          <div className="absolute inset-0 bg-black/82" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
        </div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/35 border border-primary/35 backdrop-blur-sm mb-5 shadow-[0_2px_20px_rgba(0,0,0,0.45)]">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-primary text-[11px] font-bold tracking-widest uppercase">{pricing.heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.85),0_8px_32px_rgba(0,0,0,0.55)]">
              {pricing.heroTitle}&amp;<br />
              <span className="text-gradient drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">{pricing.heroTitleHighlight}</span>
            </h1>
            <p className="text-gray-200/95 text-base md:text-lg max-w-lg leading-relaxed mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {pricing.heroIntro}
            </p>

            {/* Garanties inline */}
            <div className="flex flex-wrap gap-2">
              {garanties.map((g) => (
                <span key={g.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/15 text-gray-200 text-xs font-medium shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
                  <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={g.icon} />
                  </svg>
                  {g.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* Titre section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-gray-500 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">Transferts aéroport</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Grid de cards tarifs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {tarifs.map((t) => {
            const c = codeColors[t.code] ?? codeColors.CDG;
            return (
              <div
                key={`${t.depart}-${t.code}`}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 group hover:-translate-y-0.5 ${
                  t.featured
                    ? "border border-primary/50 ring-1 ring-primary/15 shadow-glow"
                    : "border border-white/[0.07] hover:border-white/[0.14]"
                }`}
                style={{ background: "linear-gradient(145deg, #1a1a1a, #111)" }}
              >
                {/* Ligne accent top */}
                <div className={`h-0.5 w-full ${t.featured ? "bg-gradient-to-r from-transparent via-primary to-transparent" : "bg-white/[0.04]"}`} />

                <div className="p-5">
                  {t.featured && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest mb-3">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Populaire
                    </div>
                  )}

                  {/* Route */}
                  <div className="mb-4">
                    <p className="text-white font-black text-base leading-none mb-2">{t.depart}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-white/10" />
                      <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-semibold text-sm">{t.destination}</p>
                  </div>

                  {/* Méta */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${c.bg} ${c.text} border-current/20`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {t.code}
                    </span>
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.duree}
                    </span>
                    <span className="text-[10px] text-gray-600">{t.km}</span>
                  </div>

                  {/* Prix */}
                  <div className="border-t border-white/[0.06] pt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Aller simple</span>
                      <span className="text-base font-bold text-gray-300">{t.prixAller} €</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Aller-Retour</span>
                      <span className="text-2xl font-black text-primary leading-none">{t.prixAR} €</span>
                    </div>
                    <p className="text-[9px] text-gray-700 text-right">Prix fixe TTC · Indicatif</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note indicative */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-10">
          <svg className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-xs leading-relaxed">
            Ces tarifs sont donnés à titre indicatif depuis les villes mentionnées. Le prix exact dépend de votre adresse précise de prise en charge.
            Utilisez le calculateur pour obtenir votre tarif personnalisé en 30 secondes.
          </p>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-gray-500 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">{pricing.servicesSpecialEyebrow}</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Mise à disposition */}
        <div className="relative rounded-2xl overflow-hidden border border-primary/25 mb-10 group hover:border-primary/40 transition-colors card-brand-glow">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg mb-1">Mise à Disposition</p>
                <p className="text-gray-400 text-sm mb-1">{pricing.madSubtitle}</p>
                <p className="text-gray-600 text-xs">Durée libre · {pricing.madVehicleHint}</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-4xl font-black text-white">{pricing.madHourlyFrom}</span>
                <span className="text-primary text-xl font-bold">€</span>
                <span className="text-gray-500 text-sm">/heure</span>
              </div>
              <p className="text-[10px] text-gray-600">À partir de · TTC</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/calculateur"
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {pricing.ctaPrimaryLabel}
          </Link>
          <Link
            href="/devis"
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border border-white/[0.1] text-gray-300 hover:text-white hover:border-white/25 font-semibold text-sm transition-all"
          >
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {pricing.ctaSecondaryLabel}
          </Link>
        </div>

      </div>
    </div>
  );
}
