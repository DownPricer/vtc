const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

export const metadata = {
  title: "Mentions Légales — YGvtc VTC76, Goderville (76110)",
  description:
    "Mentions légales, politique de confidentialité et informations sur les cookies du site YGvtc VTC76. Éditeur : YGvtc, 30 rue Jean Prévost, 76110 Goderville. Hébergé par Vercel.",
  alternates: {
    canonical: `${SITE_URL}/mentions-legales`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    id: "editeur",
    title: "Éditeur",
    content: (
      <>
        <p>YGvtc — VTC76</p>
        <p>30 rue Jean Prévost</p>
        <p>76110 Goderville, France</p>
        <p className="mt-2">SIRET : disponible sur demande</p>
        <p>Carte professionnelle VTC délivrée par la préfecture</p>
      </>
    ),
  },
  {
    id: "hebergement",
    title: "Hébergement",
    content: (
      <>
        <p>Vercel Inc.</p>
        <p>440 N Barranca Ave #4133</p>
        <p>Covina, CA 91723, USA</p>
        <p className="mt-2"><a href="https://vercel.com" className="text-primary hover:underline">vercel.com</a></p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <p>
        Ce site peut utiliser des cookies pour améliorer votre expérience de navigation.
        Vous pouvez configurer votre navigateur pour refuser les cookies à tout moment.
        Aucun cookie publicitaire n&apos;est utilisé.
      </p>
    ),
  },
  {
    id: "confidentialite",
    title: "Confidentialité",
    content: (
      <p>
        Les données collectées via les formulaires (nom, prénom, email, téléphone, adresses)
        sont utilisées uniquement pour traiter vos demandes de réservation ou de devis.
        Elles ne sont pas vendues à des tiers. Conformément au RGPD, vous disposez d&apos;un droit
        d&apos;accès, de rectification et de suppression de vos données. Contactez-nous pour
        exercer ces droits.
      </p>
    ),
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-dark">

      {/* Hero minimal */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-medium to-dark" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">
          <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block mb-3">Informations légales</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Mentions légales
          </h1>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="space-y-4">
          {sections.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="p-5 md:p-6 rounded-2xl border border-white/[0.07]"
              style={{ background: "linear-gradient(145deg, #161616, #111)" }}
            >
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-primary flex-shrink-0" />
                {s.title}
              </h2>
              <div className="text-gray-500 text-sm leading-relaxed space-y-1">
                {s.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
