import Link from "next/link";
import { DevisForm } from "@/components/forms/DevisForm";

import { getPublicSiteUrl } from "@/lib/siteUrl";
import { siteConfig } from "@/config/site.config";
import { seoConfig } from "@/config/seo.config";

const SITE_URL = getPublicSiteUrl();

export const metadata = {
  title: `Devis gratuit — ${siteConfig.commercialName}`,
  description: `Demandez un devis sans engagement. ${seoConfig.defaultDescription}`,
  alternates: {
    canonical: `${SITE_URL}/devis`,
  },
};

export default function DevisPage() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="relative overflow-hidden page-hero-devis">
        <div className="absolute inset-0 page-hero-devis__bg-base" />
        <div className="absolute inset-0 page-hero-devis__radial-secondary" />
        <div className="absolute inset-0 page-hero-devis__radial-primary-soft" />

        <div className="absolute inset-0 opacity-[0.03] page-hero-devis__grid" />

        <div className="absolute top-0 left-0 right-0 h-px page-hero-devis__rule" />
        <div className="absolute bottom-0 left-0 right-0 h-px page-hero-devis__rule" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l&apos;accueil
            </Link>
          </div>

          <div className="mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md page-hero-devis__badge">
              <svg className="w-3.5 h-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-secondary">Demande de devis</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white mb-2.5 tracking-tight leading-tight">
            Votre estimation<br />
            <span className="text-primary">sur mesure</span>
          </h1>

          <div className="w-24 h-0.5 mb-3 rounded-full page-hero-devis__accent-line" />

          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Décrivez votre trajet et recevez votre devis détaillé par email. Gratuit, sans engagement.
          </p>

          <div className="flex items-center gap-5 mt-6 flex-wrap">
            {[
              { label: "Gratuit", icon: "M5 13l4 4L19 7" },
              { label: "Sans engagement", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              { label: "Réponse rapide", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((g) => (
              <span key={g.label} className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium uppercase tracking-wider">
                <svg className="w-3 h-3 text-primary/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={g.icon} />
                </svg>
                {g.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <DevisForm />
      </div>
    </div>
  );
}
