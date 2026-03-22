const avis = [
  {
    text: "Service impeccable. Yoann m'a pris en charge à domicile à 4h du matin pour un vol matinal. Ponctualité parfaite, voiture nickel, trajet excellent.",
    auteur: "Marie-Christine L.",
    trajet: "Le Havre → Orly",
    note: 5,
    date: "Décembre 2024",
  },
  {
    text: "Transfert Le Havre — Orly sans stress. Chauffeur courtois, véhicule impeccable et propre. Le suivi de vol m'a vraiment rassuré pour le retour.",
    auteur: "Thomas B.",
    trajet: "Fécamp → CDG",
    note: 5,
    date: "Novembre 2024",
  },
  {
    text: "Je prends régulièrement YGvtc pour mes déplacements professionnels. Ponctualité exemplaire, voiture confortable. Le tarif fixe est vraiment appréciable.",
    auteur: "Jean-Pierre M.",
    trajet: "Bolbec → Beauvais",
    note: 5,
    date: "Octobre 2024",
  },
  {
    text: "Excellente prestation pour notre mariage. Yoann était en avance, discret et très professionnel. Merci pour ce service 5 étoiles !",
    auteur: "Sophie & Romain",
    trajet: "Événement · Étretat",
    note: 5,
    date: "Septembre 2024",
  },
  {
    text: "Premier vol de ma fille, Yoann a tout géré avec calme et professionnalisme. Elle était rassurée dès le départ. Je recommande vivement.",
    auteur: "Nathalie F.",
    trajet: "Goderville → CDG",
    note: 5,
    date: "Août 2024",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < n ? "text-primary" : "text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ a }: { a: typeof avis[0] }) {
  return (
    <blockquote className="relative flex-shrink-0 w-[85vw] sm:w-[340px] md:w-auto glass-dark rounded-2xl p-6 flex flex-col group hover:border-primary/30 hover:shadow-glow transition-all duration-300 border border-white/6">
      {/* Guillemet déco */}
      <span className="absolute top-4 right-5 text-6xl text-primary/10 font-serif leading-none select-none pointer-events-none">
        &ldquo;
      </span>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Stars n={a.note} />
        <span className="text-[10px] text-gray-600">{a.date}</span>
      </div>

      {/* Texte */}
      <p className="text-gray-300 leading-relaxed text-sm flex-1 mb-5">
        &ldquo;{a.text}&rdquo;
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">
            {a.auteur.charAt(0)}
          </div>
          <div>
            <p className="text-white font-bold text-xs">{a.auteur}</p>
            <p className="text-gray-600 text-[10px]">Avis Google vérifié</p>
          </div>
        </div>
        <span className="text-[10px] text-primary/80 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full whitespace-nowrap">
          {a.trajet}
        </span>
      </div>
    </blockquote>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-dark relative overflow-hidden">

      {/* Fond subtil */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* En-tête */}
        <div className="text-center mb-12 px-5">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-5">
            Témoignages clients
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Ils nous font <span className="text-gradient">confiance</span>
          </h2>
          {/* Google rating */}
          <div className="inline-flex items-center gap-3 px-5 py-3 glass rounded-2xl">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <div className="flex items-center gap-1.5">
              <Stars n={5} />
              <span className="text-white font-black text-sm">5,0</span>
            </div>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-400 text-xs">Google Reviews</span>
          </div>
        </div>

        {/* Cards — scroll natif mobile, grille desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto no-scrollbar scroll-snap-x pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-8">
          {avis.slice(0, 3).map((a, i) => (
            <TestimonialCard key={i} a={a} />
          ))}
        </div>

        {/* 2 avis supplémentaires desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-5 px-8 mt-5">
          {avis.slice(3).map((a, i) => (
            <TestimonialCard key={i} a={a} />
          ))}
        </div>

        {/* CTA Google */}
        <div className="text-center mt-10 px-5">
          <a
            href="https://www.google.com/maps/search/YGvtc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border-white/10 text-gray-300 hover:text-white hover:border-primary/30 text-sm font-medium transition-all duration-300 group"
          >
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Voir tous les avis sur Google
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
