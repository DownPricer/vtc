import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { VTCGame } from "./VTCGame";

export const metadata: Metadata = {
  title: "Mini-jeu — Mission Aéroport Express",
  description:
    "Mini-jeu arcade : conduisez votre VTC jusqu'à l'aéroport en évitant le trafic. Classement local optionnel.",
};

export default function JeuPage() {
  if (!siteConfig.features.miniGame) {
    notFound();
  }
  return <VTCGame />;
}
