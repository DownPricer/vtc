import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { IntroScreen } from "@/components/layout/IntroScreen";
import { siteConfig } from "@/config/site.config";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { getBrandCssVariables } from "@/lib/branding/cssVariables";

const SITE_URL = getPublicSiteUrl();
const ogUrl = `${SITE_URL}${siteConfig.branding.ogImageSrc}`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.keywords],
  authors: [{ name: siteConfig.legalName, url: SITE_URL }],
  creator: siteConfig.commercialName,
  publisher: siteConfig.legalName,
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: SITE_URL,
    siteName: siteConfig.commercialName,
    locale: seoConfig.openGraphLocale,
    type: "website",
    images: [
      {
        url: ogUrl,
        width: 1200,
        height: 630,
        alt: `${siteConfig.commercialName} — Chauffeur privé VTC`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [ogUrl],
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
  category: seoConfig.category,
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" style={getBrandCssVariables()}>
      <body className="antialiased bg-dark text-white min-h-screen flex flex-col">
        {siteConfig.features.introScreen ? <IntroScreen /> : null}
        <Header />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer />
        <FloatingButtons />
        <MobileCtaBar />
      </body>
    </html>
  );
}
