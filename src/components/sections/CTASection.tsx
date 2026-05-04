import Link from "next/link";
import Image from "next/image";

import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

type Props = { tenantSettings?: TenantSettingsV1 };

export function CTASection({ tenantSettings = defaultTenantSettings }: Props) {
  const t = tenantSettings;
  const site = buildSiteConfigFromTenant(t);
  const phoneTel = site.contact.phoneE164.replace(/\s/g, "");
  const phoneDisplay = site.contact.phoneDisplay;
  const cta = t.home.ctaFinal;
  const lib = new Map(t.badges.library.filter((b) => b.enabled).map((b) => [b.id, b] as const));
  const ctaGuaranteeIds = new Set(t.home.ctaFinal.guarantees.filter((g) => g.enabled).map((g) => g.badgeId));
  const garanties = t.badges.placements.home_cta_guarantees
    .map((p) => {
      if (!ctaGuaranteeIds.has(p.badgeId)) return null;
      const badge = lib.get(p.badgeId);
      if (!badge) return null;
      return p.textOverride ?? badge.text;
    })
    .filter(Boolean);

  if (!cta.enabled) {
    return null;
  }

  const ctaLinks = cta.ctas.filter((c) => c.enabled);

  return (
    <section className="relative py-24 md:py-40 overflow-hidden">

      {/* Fond photo série 2 */}
      <div className="absolute inset-0 z-0">
        <Image
          src={cta.backgroundImageSrc}
          alt={`${site.commercialName} — Chauffeur privé VTC`}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/90" />
      </div>

      {/* Lignes */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Lueur centrale */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/8 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-6 text-center">

        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold tracking-widest uppercase mb-6 animate-glow-pulse">
          {cta.eyebrow}
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 leading-[1.05] tracking-tight">
          {cta.title}{" "}
          <span className="text-gradient">{cta.titleHighlight}</span>
        </h2>

        <p className="text-gray-300 text-base sm:text-lg mb-6 leading-relaxed">
          {cta.subtitle}
        </p>

        {/* Téléphone */}
        <a
          href={`tel:${phoneTel}`}
          className="inline-flex items-center gap-3 px-6 py-3 glass rounded-2xl text-white hover:border-primary/50 transition-all mb-10 group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{cta.phoneLabel}</p>
            <p className="text-white font-black text-lg tracking-wide">{phoneDisplay}</p>
          </div>
        </a>

        {/* CTA buttons */}
        {ctaLinks.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {ctaLinks.map((c, idx) => (
              <Link
                key={c.id}
                href={c.href}
                className={
                  idx === 0
                    ? "flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-base shadow-glow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    : "flex-1 flex items-center justify-center gap-3 py-4 rounded-xl glass border-white/20 text-white hover:border-primary/40 hover:bg-primary/10 font-semibold text-base transition-all duration-300 active:scale-95"
                }
              >
                {idx === 0 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {c.label}
              </Link>
            ))}
        </div>
        ) : null}

        {/* Garanties */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto">
          {garanties.map((g) => (
            <div key={g as string} className="flex items-center gap-2 glass rounded-lg px-3 py-2.5">
              <svg className="w-3 h-3 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300 text-xs font-medium leading-tight">{g as string}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
