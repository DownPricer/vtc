import { CalculatorForm } from "@/components/forms/CalculatorForm";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

export const metadata = {
  title: "Calculateur de Tarif VTC Le Havre, Fécamp → Orly, CDG, Beauvais — Réservation en Ligne",
  description:
    "Calculez instantanément le tarif de votre course VTC en Seine-Maritime. Transfert aéroport Orly, CDG, Beauvais, trajet local ou mise à disposition. Prix fixe garanti, bagages inclus, réservation en quelques clics.",
  alternates: {
    canonical: `${SITE_URL}/calculateur`,
  },
};

export default function CalculateurPage() {
  return (
    <main className="min-h-screen bg-dark">

      {/* Hero – style dashboard/grille orange */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,133,51,0.1)' }}>
        {/* Fond : dégradé sombre avec touche orange */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a0c 0%, #12100d 40%, #0e0c0a 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(255,133,51,0.07) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(255,80,0,0.04) 0%, transparent 50%)' }} />

        {/* Grille technique / dashboard orange */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,133,51,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,133,51,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Lignes en haut et bas */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,133,51,0.2) 30%, rgba(255,80,0,0.15) 70%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,133,51,0.2) 30%, rgba(255,80,0,0.15) 70%, transparent 100%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-5 py-12 md:py-16">
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

          {/* Badge calculateur */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md" style={{
              background: 'linear-gradient(135deg, rgba(255,133,51,0.12) 0%, rgba(255,80,0,0.06) 100%)',
              border: '1px solid rgba(255,133,51,0.25)',
              boxShadow: '0 0 12px rgba(255,133,51,0.08)'
            }}>
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-primary">Réservation</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white mb-2.5 tracking-tight leading-tight">
            Calculer mon<br />
            <span className="text-primary">tarif VTC</span>
          </h1>

          {/* Ligne de séparation façon gauge */}
          <div className="w-24 h-0.5 mb-3 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(255,133,51,0.5), rgba(255,80,0,0.3))' }} />

          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Estimation immédiate, tarif fixe garanti. Réservez en quelques clics.
          </p>

          {/* Indicateurs façon tableau de bord */}
          <div className="flex items-center gap-5 mt-6 flex-wrap">
            {[
              { label: "Prix fixe garanti", icon: "M5 13l4 4L19 7" },
              { label: "Bagages inclus", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { label: "Prise en charge domicile", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { label: "Suivi de vol", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
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

      {/* Formulaire */}
      <div className="max-w-3xl mx-auto px-5 py-10 pb-20">
        <CalculatorForm />
      </div>
    </main>
  );
}
