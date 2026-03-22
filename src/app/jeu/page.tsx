import type { Metadata } from "next";
import { VTCGame } from "./VTCGame";

export const metadata: Metadata = {
  title: "Mini-Jeu VTC76 — Mission Aéroport Express",
  description:
    "Jouez au mini-jeu VTC76 ! Conduisez votre VTC de Normandie jusqu'à l'aéroport en évitant le trafic. Collectez des pourboires et activez le télépéage !",
};

export default function JeuPage() {
  return <VTCGame />;
}
