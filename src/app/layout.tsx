import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site.config";
import { seoConfig } from "@/config/seo.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { TelemetryRoot } from "@/components/telemetry/TelemetryRoot";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-white text-slate-950">
        <TelemetryRoot />
        {children}
      </body>
    </html>
  );
}
