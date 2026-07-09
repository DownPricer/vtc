import type { Metadata } from "next";
import { ProPaymentsClient } from "@/components/pro/payments/ProPaymentsClient";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Stripe — ${siteConfig.commercialName}`,
  description: "Connexion Stripe Connect et réglages du paiement en ligne pour l’espace professionnel.",
  robots: { index: false, follow: false },
};

export default function ProStripePage() {
  return <ProPaymentsClient />;
}
