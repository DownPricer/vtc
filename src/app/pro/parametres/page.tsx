import type { Metadata } from "next";
import { getTenantSettings } from "@/config/getTenantSettings";
import { siteConfig } from "@/config/site.config";
import { ProSettingsClient } from "@/components/pro/settings/ProSettingsClient";
import type { ProSettingsMailMeta } from "@/components/pro/settings/types";

export const metadata: Metadata = {
  title: `Paramètres — ${siteConfig.commercialName}`,
  description: "Consultation des paramètres vitrine (lecture seule) pour l’espace professionnel.",
  robots: { index: false, follow: false },
};

function envFlag(name: string, fallback: boolean): boolean {
  const v = process.env[name]?.toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  if (v === "1" || v === "true" || v === "yes") return true;
  return fallback;
}

export default function ProParametresPage() {
  const tenant = getTenantSettings();

  const mailMeta: ProSettingsMailMeta = {
    mailTo: process.env.MAIL_TO?.trim() || null,
    mailToCopy: process.env.MAIL_TO_COPY?.trim() || null,
    mailReplyTo: process.env.MAIL_REPLY_TO?.trim() || null,
    customerConfirmationEnv: process.env.MAIL_SEND_CUSTOMER_CONFIRMATION?.trim() ?? "",
    customerConfirmationEffective: envFlag("MAIL_SEND_CUSTOMER_CONFIRMATION", siteConfig.features.sendCustomerConfirmationEmail),
  };

  return <ProSettingsClient tenant={tenant} mailMeta={mailMeta} siteFeatures={siteConfig.features} />;
}
