import Link from "next/link";
import Image from "next/image";
import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

const icons = {
  plane: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  shield_check: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
} as const;

function renderVehicleTitle(name: string) {
  const suffix = " Initiale Paris";
  if (name.endsWith(suffix)) {
    const prefix = name.slice(0, -suffix.length);
    return (
      <>
        {prefix} <span className="text-gradient">Initiale Paris</span>
      </>
    );
  }
  return name;
}

type Props = { tenantSettings?: TenantSettingsV1 };

export function ServicesSection({ tenantSettings = defaultTenantSettings }: Props) {
  const t = tenantSettings;
  const site = buildSiteConfigFromTenant(t);
  const commitments = t.home.commitments;
  const services = commitments.items.filter((x) => x.enabled);
  const vehicle = t.vehicles.featured;
  const gallery = vehicle.gallery;

  return (
    <section className="py-16 md:py-24 bg-dark-medium relative overflow-hidden">

      {/* Déco fond */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">

      {/* Header + cards — layout compact 2 colonnes */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-14 mb-14 md:mb-16">

          {/* Colonne gauche : titre */}
          <div className="lg:w-64 xl:w-72 flex-shrink-0 lg:pt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-3">
              {commitments.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
              {commitments.titlePrefix} <span className="text-gradient">{site.commercialName}</span> ?
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              {commitments.subtitle}
            </p>
            <Link
              href={commitments.ctaHref}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light text-xs font-semibold transition-colors group"
            >
              {commitments.ctaLabel}
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Colonne droite : 4 cards 2x2 */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            {services.map((s) => (
              <div
                key={s.title}
                className="group relative flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-primary/35 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
              >
                {/* Numéro fond */}
                <span className="absolute -bottom-2 -right-1 text-6xl font-black text-white/[0.03] group-hover:text-primary/[0.05] transition-colors duration-300 select-none leading-none">
                  {s.num}
                </span>
                {/* Ligne accent gauche */}
                <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative z-10">
                  {icons[s.iconKey as keyof typeof icons]}
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[10px] font-bold text-primary/50 tracking-widest uppercase leading-none mb-1">{s.num}</p>
                  <h3 className="text-xs font-bold text-white leading-tight mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-[10px] leading-relaxed hidden sm:block line-clamp-2">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-0.5">
                {renderVehicleTitle(vehicle.name)}
              </h3>
              <p className="text-gray-600 text-xs">{vehicle.headline}</p>
            </div>
            <Link
              href={commitments.ctaHref}
              className="hidden sm:flex items-center gap-1.5 text-primary hover:text-primary-light text-xs font-semibold transition-colors group"
            >
              Réserver
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Mosaic desktop */}
          <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2 h-[400px]">
            {gallery.slice(0, 6).map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl group ${i === 0 ? "col-span-1 row-span-2" : ""}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 1280px) 33vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-semibold bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {img.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile scroll */}
          <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar scroll-snap-x -mx-5 px-5 pb-2">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-56 h-36 rounded-lg overflow-hidden"
                style={{ scrollSnapAlign: "start" }}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="224px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 text-white text-[10px] font-semibold bg-black/40 px-1.5 py-0.5 rounded-full">
                  {img.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={commitments.ctaHref}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {commitments.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
