import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";

const about = siteConfig.about;

const atouts = [
  {
    label: "Carte professionnelle VTC",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c0 1.306.835 2.418 2 2.83" />
      </svg>
    ),
  },
  {
    label: about.vehicleLabel,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2m-6 0H6m12 0a2 2 0 104 0m-4 0a2 2 0 014 0M4 17H2M3 7l2-2h10l3 4H3V7zm0 4v4" />
      </svg>
    ),
  },
  {
    label: "Paiement accepté à bord",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    label: "Suivi de vol en temps réel",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Disponible 7j / 7 · 24h / 24",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Bagages inclus · Aucun supplément",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export function AboutSection() {
  return (
    <section className="py-20 md:py-32 bg-dark-medium overflow-hidden relative">

      {/* Déco fond */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Portrait */}
          <div className="relative flex justify-center w-full lg:justify-start">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-3xl blur-3xl pointer-events-none" />

            <div className="relative w-64 sm:w-72 lg:w-96">
              <div className="absolute -top-3 -left-3 w-full h-full rounded-3xl border-2 border-primary/40" />
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-3xl border border-white/10" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={about.portraitSrc}
                  alt={about.portraitAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 384px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <p className="text-white font-black text-xl">{about.driverDisplayName}</p>
                  <p className="text-primary text-sm font-semibold">{about.roleLabel}</p>
                </div>
              </div>

              {/* Badge Google */}
              <div className="absolute -bottom-5 -right-5 glass-dark rounded-2xl p-3.5 shadow-xl border-glow">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-lg">★</div>
                  <div>
                    <p className="text-white font-black text-sm">5 / 5</p>
                    <p className="text-gray-400 text-[10px]">Satisfaction clients</p>
                  </div>
                </div>
              </div>

              {/* Badge VTC */}
              <div className="absolute -top-5 -right-5 glass-dark rounded-2xl p-3 shadow-xl">
                <p className="text-primary font-black text-xs uppercase tracking-wider">VTC Pro</p>
                <p className="text-gray-400 text-[10px]">Carte professionnelle</p>
              </div>
            </div>
          </div>

          {/* Texte */}
          <div className="space-y-6 text-center lg:text-left">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-5">
                {about.sectionTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Un chauffeur,<br />
                <span className="text-gradient">une passion</span>
              </h2>
            </div>

            <p className="text-gray-300 leading-relaxed text-base">{about.leadParagraph}</p>

            <p className="text-gray-400 leading-relaxed text-sm">{about.secondaryParagraph}</p>

            {/* Atouts — icônes SVG monochrome */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {atouts.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.04] transition-all duration-200 group"
                >
                  <span className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span className="text-gray-400 text-[11px] font-medium leading-tight">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/a-propos"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-primary/40 text-primary hover:bg-primary/10 font-bold transition-all duration-300 active:scale-95 group"
              >
                En savoir plus
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/calculateur"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all duration-300 shadow-glow active:scale-95"
              >
                {`Réserver avec ${about.ctaDriverName}`}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
