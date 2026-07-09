import type { Metadata } from "next";
import { ProSiteClient } from "@/components/pro/site/ProSiteClient";
import { getTenantSettings } from "@/config/getTenantSettings";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Site internet — ${siteConfig.commercialName}`,
  description: "Gestion du site : identité, coordonnées, présentation, véhicules, services et SEO.",
  robots: { index: false, follow: false },
};

export default function ProSitePage() {
  const tenant = getTenantSettings();
  return <ProSiteClient defaults={tenant} siteFeatures={siteConfig.features} />;
}
