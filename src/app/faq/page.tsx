import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";

const SITE_URL = getPublicSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getPublicTenantSettings();
  const site = buildSiteConfigFromTenant(tenant);
  return {
    title: `FAQ — ${site.commercialName}`,
    description: `Questions fréquentes : bagages, vols, paiements, zone d’intervention. ${seoConfig.defaultDescription}`,
    alternates: {
      canonical: `${SITE_URL}/faq`,
    },
  };
}

const icons = {
  luggage_check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  plane: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  credit_card: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
} as const;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
  ],
};

export default async function FAQPage() {
  const tenant = await getPublicTenantSettings();
  const site = buildSiteConfigFromTenant(tenant);
  const faqConfig = tenant.faq;

  const faqs = faqConfig.items
    .filter((x) => x.enabled)
    .map((x) => ({ q: x.question, a: x.answer, icon: icons[x.iconKey as keyof typeof icons] }));

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark-medium" />
        <div className="absolute inset-0 radial-brand-tl" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-22">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-5">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-primary text-[11px] font-bold tracking-widest uppercase">{faqConfig.pageHero.eyebrow}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            {faqConfig.pageHero.title}<br />
            <span className="text-gradient">{faqConfig.pageHero.titleHighlight}</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg">
            {faqConfig.pageHero.introTemplate.replace("{brand}", site.commercialName)}
          </p>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">

        <div className="space-y-3 mb-12">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-200"
              style={{ background: "linear-gradient(145deg, #161616, #111)" }}
            >
              {/* Numéro */}
              <span className="text-[10px] font-black text-primary/40 tracking-wider mt-1 flex-shrink-0 w-6 text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Icône */}
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                {faq.icon}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white mb-2 group-hover:text-primary/90 transition-colors leading-tight">{faq.q}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="p-6 rounded-2xl border border-white/[0.07] text-center"
          style={{ background: "linear-gradient(145deg, #1a1a1a, #111)" }}
        >
          <p className="text-gray-500 text-sm mb-5">{faqConfig.cta.missingAnswerText}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={faqConfig.cta.primaryHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow transition-all duration-300 active:scale-95"
            >
              {faqConfig.cta.primaryLabel}
            </Link>
            <Link
              href={faqConfig.cta.secondaryHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/[0.1] text-gray-300 hover:text-white hover:border-white/25 font-semibold text-sm transition-all"
            >
              {faqConfig.cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
