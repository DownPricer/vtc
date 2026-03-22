import Link from "next/link";
import Image from "next/image";

const tarifs = [
  { depart: "Le Havre",  destination: "Orly",      code: "ORY", prix: "480", prixAller: "260", duree: "~2h30", featured: false },
  { depart: "Fécamp",    destination: "Roissy CDG", code: "CDG", prix: "490", prixAller: "270", duree: "~2h45", featured: true },
  { depart: "Bolbec",    destination: "Roissy CDG", code: "CDG", prix: "480", prixAller: "260", duree: "~2h30", featured: false },
  { depart: "Étretat",   destination: "Orly",      code: "ORY", prix: "480", prixAller: "260", duree: "~2h20", featured: false },
];

export function TarifsHighlightSection() {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/s1/s1-2.png"
          alt="Transferts aéroport Normandie"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/90" />
      </div>

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header — compact */}
        <div className="text-center mb-8 md:mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-3">
            Tarifs transparents
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
            Nos transferts <span className="text-gradient">les plus demandés</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Prix fixes aller-retour. Pas de surprise, pas de compteur.
          </p>
        </div>

        {/* Tarif cards — compact horizontal layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {tarifs.map((t) => (
            <div
              key={`${t.depart}-${t.code}`}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                t.featured
                  ? "border border-primary/40 ring-1 ring-primary/20"
                  : "border border-white/[0.06]"
              }`}
            >
              <div className={`p-4 h-full bg-white/[0.03] ${t.featured ? "bg-primary/[0.04]" : ""}`}>

                {t.featured && (
                  <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/15 px-2 py-0.5 rounded-full mb-2">
                    Populaire
                  </span>
                )}

                {/* Route */}
                <p className="text-white font-bold text-sm leading-none mb-1">{t.depart}</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xs mb-2">{t.destination}</p>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400">
                    {t.code}
                  </span>
                  <span className="text-[9px] text-gray-600">{t.duree}</span>
                </div>

                {/* Price */}
                <div className="border-t border-white/[0.06] pt-2.5 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] text-gray-600 uppercase">Aller</span>
                    <span className="text-sm font-bold text-gray-400">{t.prixAller} €</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] text-gray-600 uppercase">A/R</span>
                    <span className="text-xl font-black text-primary">{t.prix} €</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MAD — inline compact */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Mise à Disposition</p>
              <p className="text-gray-500 text-[11px]">Mariage · Soirée · Événement</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">80</span>
            <span className="text-primary text-sm font-bold">€/h</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/calculateur"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Calculer mon tarif exact
          </Link>
          <p className="text-[10px] text-gray-600 mt-2">Prix indicatifs — le calculateur donne votre tarif précis</p>
        </div>

      </div>
    </section>
  );
}
