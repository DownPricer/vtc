import type { Metadata } from "next";
import { ProTarifsClient } from "@/components/pro/tarifs/ProTarifsClient";
import { getTenantSettings } from "@/config/getTenantSettings";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Tarifs — ${siteConfig.commercialName}`,
  description: "Configuration des tarifs VTC (trajets, aéroports, mise à disposition).",
  robots: { index: false, follow: false },
};

export default function ProTarifsPage() {
  const tenant = getTenantSettings();
  return <ProTarifsClient defaults={tenant} />;
}
