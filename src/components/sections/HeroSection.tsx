import Link from "next/link";
import Image from "next/image";
import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

type Props = { tenantSettings?: TenantSettingsV1 };

export function HeroSection({ tenantSettings = defaultTenantSettings }: Props) {
  const t = tenantSettings;
  const hero = t.home.hero;
  const site = buildSiteConfigFromTenant(t);
  const heroCtas = hero.ctas.filter((c) => c.enabled);

  return (
    <section className="relative h-svh flex flex-col justify-center overflow-hidden bg-black">

      {/* ── Image de fond ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.backgroundImageSrc}
          alt={hero.imageAlt}
          fill
          priority
          className="object-cover object-bottom brightness-110"
          sizes="100vw"
        />
        {/* Couche sombre globale */}
        <div className="absolute inset-0 bg-black/25" />
        {/* Dégradé bas → haut (lisibilité texte) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        {/* Dégradé gauche (desktop) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent hidden md:block" />
        {/* Ligne orange bas */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      {/* ── Contenu ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-lg md:max-w-2xl">

          {/* Badge "DISPONIBLE 7J/7" — court, tient sur une ligne */}
          <div className="animate-fade-down inline-flex items-center gap-2 mb-5 md:mb-6">
            <span className="w-6 h-px bg-primary flex-shrink-0" />
            <span className="text-primary text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
              {hero.badgeText} · {site.seo.regionLabel}
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="animate-fade-up text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-3 md:mb-4 tracking-tight">
            {hero.titleLine1}<br />
            <span className="text-gradient">{hero.titleHighlight}</span>
          </h1>

          {/* Sous-titre */}
          <p className="animate-fade-up delay-100 text-gray-300 text-sm md:text-base leading-relaxed mb-2 max-w-sm md:max-w-md">
            {hero.subtitle}
          </p>
          <p className="animate-fade-up delay-100 text-gray-400 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 max-w-sm md:max-w-md">
            {hero.bullets}
          </p>

          {/* CTA buttons */}
          {heroCtas.length > 0 ? (
            <div className="animate-fade-up delay-200 mb-8 flex flex-col gap-3 md:mb-10 sm:flex-row">
              {heroCtas.map((c, idx) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className={
                    idx === 0
                      ? "animate-glow-pulse flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-4 text-sm font-bold text-white shadow-glow-lg transition-all duration-300 hover:bg-primary-dark active:scale-95"
                      : "flex items-center justify-center gap-2.5 rounded-xl border border-white/20 px-7 py-4 text-sm font-medium text-white transition-all duration-300 hover:border-primary/50 hover:bg-white/5 active:scale-95"
                  }
                >
                  {idx === 0 ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {c.label}
                </Link>
              ))}
            </div>
          ) : null}

        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="animate-bounce absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1.5 opacity-40">
        <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
