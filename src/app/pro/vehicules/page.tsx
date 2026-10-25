import type { Metadata } from "next";
import { VehiclesListClient } from "@/components/pro/vehicles/VehiclesListClient";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Véhicules — ${siteConfig.commercialName}`,
  description: "Flotte : photos, capacités, supplément de tarif et disponibilités.",
  robots: { index: false, follow: false },
};

export default function ProVehiculesPage() {
  return <VehiclesListClient />;
}
