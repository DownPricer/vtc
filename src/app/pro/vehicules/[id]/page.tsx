import type { Metadata } from "next";
import { VehicleEditorClient } from "@/components/pro/vehicles/VehicleEditorClient";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Véhicule — ${siteConfig.commercialName}`,
  robots: { index: false, follow: false },
};

export default function ProVehiculePage({ params }: { params: { id: string } }) {
  return <VehicleEditorClient vehicleId={params.id} />;
}
