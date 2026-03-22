import Link from "next/link";
import Image from "next/image";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

export const metadata = {
  title: "À Propos — Yoann, Chauffeur Privé VTC Le Havre, Goderville, Normandie",
  description:
    "Yoann, votre chauffeur privé VTC basé à Goderville (76110). Ponctualité, confort premium en Renault Espace Initiale, service personnalisé 7j/7. Transferts aéroport et déplacements en Seine-Maritime.",
  alternates: {
    canonical: `${SITE_URL}/a-propos`,
  },
};

const valeurs = [
  {
    label: "Ponctualité",
    desc: "Jamais en retard, suivi GPS en temps réel.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Confort premium",
    desc: "Renault Espace 5 Initiale, climatisé, silencieux.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    label: "Service 7j/7",
    desc: "Disponible de nuit comme de jour, jours fériés inclus.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Tarifs fixes",
    desc: "Prix annoncé = prix payé. Aucune mauvaise surprise.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yoann",
  jobTitle: "Chauffeur privé VTC",
  image: `${SITE_URL}/images/prensation.jpg`,
  worksFor: {
    "@type": "LocalBusiness",
    name: "YGvtc VTC76",
    url: SITE_URL,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Goderville",
    postalCode: "76110",
    addressRegion: "Normandie",
    addressCountry: "FR",
  },
  knowsAbout: ["VTC", "Transfert aéroport", "Chauffeur privé", "Normandie", "Seine-Maritime"],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "À propos", item: `${SITE_URL}/a-propos` },
  ],
};

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero avec photo de présentation ── */}
      <div className="relative overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-end md:items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/prensation.jpg"
            alt="Yoann, chauffeur privé VTC devant son Renault Espace — YGvtc VTC76 Normandie"
            fill
            priority
            className="object-cover object-[75%_30%] md:object-[center_20%]"
            sizes="100vw"
          />
          {/* Overlay global pour assurer la lisibilité */}
          <div className="absolute inset-0 bg-black/55" />
          {/* Dégradé fort côté gauche pour le texte */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
          {/* Dégradé bas pour mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 md:from-transparent" />
        </div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-28 w-full">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-sm mb-5">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-primary text-[11px] font-bold tracking-widest uppercase">À propos</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight drop-shadow-lg">
              Yoann,<br />
              <span className="text-gradient">votre chauffeur privé</span>
            </h1>
            <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-md drop-shadow-md">
              Basé à Goderville, en Seine-Maritime. À votre service pour tous vos déplacements en Normandie.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <span className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Disponible 7j/7
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs text-gray-300 font-medium">24h/24</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs text-gray-300 font-medium">Seine-Maritime</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* Présentation */}
        <div className="space-y-4 text-gray-400 leading-relaxed text-base mb-12">
          <p>
            Je suis Yoann, votre chauffeur privé dédié à rendre vos trajets en Normandie agréables et sans stress.
            Basé à Goderville, je mets mon expérience et mon sens du service au profit de vos déplacements vers
            les aéroports et les grandes gares.
          </p>
          <p>
            Que vous ayez besoin d&apos;un VTC Le Havre — Orly ou d&apos;un transfert depuis le Pays de Caux vers
            Roissy CDG, je m&apos;engage à vous transporter avec une ponctualité rigoureuse, un confort premium
            et toujours avec le sourire.
          </p>
          <p className="text-white font-semibold text-base md:text-lg">
            Prêt à voyager différemment ? Montez à bord et profitez de l&apos;expérience YGvtc.
          </p>
        </div>

        {/* Valeurs */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-gray-500 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">Mes engagements</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {valeurs.map((v) => (
            <div
              key={v.label}
              className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                {v.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{v.label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Véhicule */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-gray-500 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">Votre véhicule</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <div
          className="p-5 md:p-6 rounded-2xl border border-white/[0.07] mb-10 group"
          style={{ background: "linear-gradient(145deg, #1a1a1a, #111)" }}
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 104 0m-4 0a2 2 0 014 0m0 0h2m-6 0H6m12 0a2 2 0 104 0m-4 0a2 2 0 014 0M4 17H2M3 7l2-2h10l3 4H3V7zm0 4v4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">Renault Espace 5 Initiale Paris</p>
              <p className="text-gray-500 text-sm mb-2">Véhicule haut de gamme · 4 passagers max · Climatisé · Sièges premium</p>
              <div className="flex flex-wrap gap-2">
                {["CB", "Virement", "Espèces", "Chèque"].map((m) => (
                  <span key={m} className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-gray-400 font-medium">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/calculateur"
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            Réserver maintenant
          </Link>
          <Link
            href="/contact"
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border border-white/[0.1] text-gray-300 hover:text-white hover:border-white/25 font-semibold text-sm transition-all"
          >
            Me contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
