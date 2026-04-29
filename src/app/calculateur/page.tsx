import { CalculatorForm } from "@/components/forms/CalculatorForm";
import Link from "next/link";

import { getPublicSiteUrl } from "@/lib/siteUrl";
import { siteConfig } from "@/config/site.config";
import { seoConfig } from "@/config/seo.config";

const SITE_URL = getPublicSiteUrl();

export const metadata = {
  title: `Calculateur de tarif — ${siteConfig.commercialName}`,
  description: `Estimez votre course en ligne. ${seoConfig.defaultDescription}`,
  alternates: {
    canonical: `${SITE_URL}/calculateur`,
  },
};

export default function CalculateurPage() {
  return (
    <main className="min-h-screen bg-dark">
      <div className="relative overflow-hidden page-hero-calculator">
        <div className="absolute inset-0 page-hero-calculator__bg-base" />
        <div className="absolute inset-0 page-hero-calculator__radial-primary" />
        <div className="absolute inset-0 page-hero-calculator__radial-warm" />

        <div className="absolute inset-0 opacity-[0.03] page-hero-calculator__grid" />

        <div className="absolute top-0 left-0 right-0 h-px page-hero-calculator__rule" />
        <div className="absolute bottom-0 left-0 right-0 h-px page-hero-calculator__rule" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 py-12 md:py-16">
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md page-hero-calculator__badge">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-primary">Réservation</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white mb-2.5 tracking-tight leading-tight">
            Calculer mon<br />
            <span className="text-primary">tarif VTC</span>
          </h1>

          <div className="w-24 h-0.5 mb-3 rounded-full page-hero-calculator__accent-line" />

          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Estimation immédiate, tarif fixe garanti. Réservez en quelques clics.
          </p>

          <div className="flex items-center gap-5 mt-6 flex-wrap">
            {[
              { label: "Prix fixe garanti", icon: "M5 13l4 4L19 7" },
              { label: "Bagages inclus", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { label: "Prise en charge domicile", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { label: "Suivi de vol", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
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

      <div className="max-w-3xl mx-auto px-5 py-10 pb-20">
        <CalculatorForm />
      </div>
    </main>
  );
}
