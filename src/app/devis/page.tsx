import Link from "next/link";
import { DevisForm } from "@/components/forms/DevisForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

export const metadata = {
  title: "Devis Gratuit VTC Le Havre, Fécamp, Normandie — Transfert Aéroport & Chauffeur Privé",
  description:
    "Demandez un devis gratuit et sans engagement pour votre course VTC en Seine-Maritime. Transfert aéroport Orly, CDG, Beauvais, Caen, mise à disposition mariage/séminaire ou trajet longue distance. Réponse rapide.",
  alternates: {
    canonical: `${SITE_URL}/devis`,
  },
};

export default function DevisPage() {
  return (
    <div className="min-h-screen bg-dark">

      {/* ── Hero – style blueprint/technique ── */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid rgba(100,180,255,0.1)' }}>
        {/* Fond : dégradé sombre avec touche bleutée */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a0c 0%, #0d1117 40%, #0a0e14 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(100,160,255,0.06) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(255,133,51,0.04) 0%, transparent 50%)' }} />

        {/* Grille technique / blueprint */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(100,180,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Lignes de cote en haut et bas */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(100,160,255,0.15) 30%, rgba(255,133,51,0.2) 70%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(100,160,255,0.15) 30%, rgba(255,133,51,0.2) 70%, transparent 100%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l&apos;accueil
            </Link>
          </div>

          {/* Badge devis avec accent bleu */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md" style={{
              background: 'linear-gradient(135deg, rgba(100,160,255,0.1) 0%, rgba(255,133,51,0.08) 100%)',
              border: '1px solid rgba(100,160,255,0.2)',
              boxShadow: '0 0 12px rgba(100,160,255,0.06)'
            }}>
              <svg className="w-3.5 h-3.5" style={{ color: '#7eb8ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#7eb8ff' }}>Demande de devis</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white mb-2.5 tracking-tight leading-tight">
            Votre estimation<br />
            <span className="text-primary">sur mesure</span>
          </h1>

          {/* Ligne de séparation façon règle technique */}
          <div className="w-24 h-0.5 mb-3 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(100,160,255,0.4), rgba(255,133,51,0.5))' }} />

          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Décrivez votre trajet et recevez votre devis détaillé par email. Gratuit, sans engagement.
          </p>

          {/* Indicateurs façon tableau de bord */}
          <div className="flex items-center gap-5 mt-6 flex-wrap">
            {[
              { label: "Gratuit", icon: "M5 13l4 4L19 7" },
              { label: "Sans engagement", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              { label: "Réponse rapide", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((g) => (
              <span key={g.label} className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium uppercase tracking-wider">
                <svg className="w-3 h-3 text-primary/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={g.icon} />
                </svg>
                {g.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formulaire ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <DevisForm />
      </div>
    </div>
  );
}
