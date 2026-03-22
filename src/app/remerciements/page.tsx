import Link from "next/link";

export const metadata = {
  title: "Merci — Votre Demande a Bien Été Envoyée",
  description: "Votre demande de réservation VTC a bien été reçue. Nous vous recontactons dans les plus brefs délais.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RemerciementsPage() {
  return (
    <div className="min-h-[80vh] bg-dark flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">

        {/* Icône succès */}
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-glow-pulse">
            <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
          Message envoyé !
        </h1>
        <p className="text-gradient font-bold text-lg mb-2">Merci pour votre confiance.</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Votre demande a bien été reçue. Je vous recontacterai dans les plus brefs délais pour confirmer votre réservation.
        </p>

        {/* Infos rapides */}
        <div
          className="p-4 rounded-xl border border-white/[0.07] mb-8 text-left space-y-3"
          style={{ background: "linear-gradient(145deg, #1a1a1a, #111)" }}
        >
          {[
            { label: "Réponse sous", value: "2h en général" },
            { label: "Téléphone", value: "07 69 98 95 23" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-gray-600 text-xs uppercase tracking-wider">{item.label}</span>
              <span className="text-white text-sm font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
