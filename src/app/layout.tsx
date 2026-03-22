import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { IntroScreen } from "@/components/layout/IntroScreen";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "VTC Le Havre, Fécamp, Pays de Caux | Navette Aéroport Orly CDG Beauvais — YGvtc VTC76",
    template: "%s | YGvtc VTC76 — Chauffeur Privé Normandie",
  },
  description:
    "VTC Le Havre, Fécamp, Goderville, Pays de Caux. Transferts aéroport vers Orly, Roissy CDG, Beauvais, Caen. Tarifs fixes, réservation en ligne 7j/7. Chauffeur privé professionnel en Seine-Maritime.",
  keywords: [
    "VTC Le Havre", "VTC Fécamp", "VTC Normandie", "VTC Seine-Maritime",
    "navette aéroport Normandie", "transfert Orly", "transfert CDG",
    "transfert Beauvais", "chauffeur privé Le Havre", "chauffeur privé Normandie",
    "VTC Pays de Caux", "VTC Goderville", "VTC Yvetot", "VTC Bolbec",
    "navette aéroport Le Havre", "YGvtc", "VTC76",
    "transport aéroport Seine-Maritime", "taxi aéroport Le Havre",
  ],
  authors: [{ name: "YGvtc — Yoann", url: SITE_URL }],
  creator: "YGvtc VTC76",
  publisher: "YGvtc VTC76",
  openGraph: {
    title: "VTC Le Havre & Normandie — Transferts Aéroport | YGvtc VTC76",
    description:
      "Chauffeur privé en Seine-Maritime. Transferts vers Orly, CDG, Beauvais, Caen. Tarifs fixes, prise en charge à domicile, réservation en ligne 7j/7.",
    url: SITE_URL,
    siteName: "YGvtc VTC76",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/og-vtc76.jpg`,
        width: 1200,
        height: 630,
        alt: "YGvtc VTC76 — Chauffeur privé et transferts aéroport en Normandie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VTC Le Havre & Normandie — Transferts Aéroport | YGvtc",
    description: "Chauffeur privé en Seine-Maritime. Transferts Orly, CDG, Beauvais. Tarifs fixes, réservation en ligne.",
    images: [`${SITE_URL}/images/og-vtc76.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Transport",
  metadataBase: new URL(SITE_URL),
  verification: {
    // google: "VOTRE_CODE_VERIFICATION_GOOGLE_SEARCH_CONSOLE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-dark text-white min-h-screen flex flex-col">
        <IntroScreen />
        <Header />
        {/* pb-24 sur mobile pour laisser place à la barre sticky bottom */}
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer />
        <FloatingButtons />
        <MobileCtaBar />
      </body>
    </html>
  );
}
