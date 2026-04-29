import { siteConfig } from "@/config/site.config";
import { businessConfig } from "@/config/business.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";

const SITE_URL = getPublicSiteUrl();
const hq = businessConfig.headquarters;

export const metadata = {
  title: `Mentions légales — ${siteConfig.commercialName}`,
  description: `Mentions légales, cookies et confidentialité pour le site ${siteConfig.commercialName}.`,
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
        <p>{businessConfig.legalName}</p>
        <p>{businessConfig.displayName}</p>
        <p>
          {hq.street}, {hq.postalCode} {hq.city}, {hq.country}
        </p>
        <p className="mt-2">SIRET : {businessConfig.siret}</p>
        <p>Représentant légal : {businessConfig.legalRepresentative}</p>
        <p>Licence / carte VTC : {businessConfig.vtcLicenseNumber}</p>
      </>
    ),
  },
  {
    id: "hebergement",
    title: "Hébergement",
    content: (
      <>
        <p>{businessConfig.hosting.name}</p>
        <p>{businessConfig.hosting.address}</p>
        <p className="mt-2">
          <a href={businessConfig.hosting.website} className="text-primary hover:underline">
            {businessConfig.hosting.website}
          </a>
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <p>
        Ce site peut utiliser des cookies techniques pour le fonctionnement du service. Vous pouvez configurer votre
        navigateur pour refuser les cookies. Aucun cookie publicitaire tiers n&apos;est requis par ce modèle de site.
      </p>
    ),
  },
  {
    id: "confidentialite",
    title: "Confidentialité",
    content: <p>{businessConfig.privacySummary}</p>,
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-medium to-dark" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">
          <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase block mb-3">
            Informations légales
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">Mentions légales</h1>
        </div>
      </div>

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
              <div className="text-gray-500 text-sm leading-relaxed space-y-1">{s.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
