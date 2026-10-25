"use client";

import Link from "next/link";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { proBtnPrimaryClass } from "../editable/proFieldStyles";
import type { SettingsTabsSharedProps } from "./context";

/**
 * La flotte n'est plus éditée dans les paramètres du site : elle vit en base (véhicules, photos, suppléments,
 * disponibilités) et se gère depuis la page dédiée. Les anciennes données `settings.vehicles` sont conservées telles
 * quelles (retour arrière possible) mais ne sont plus modifiées ici.
 */
export function VehiclesTab({ draft }: SettingsTabsSharedProps) {
  const count = draft.vehicles.items.length;
  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Flotte"
        description="Vos véhicules, leurs photos (jusqu'à 5), leur supplément de tarif et leurs disponibilités se gèrent désormais sur une page dédiée."
      >
        <p className="text-sm text-[var(--pro-text-soft)]">
          {count > 0 ? `${count} véhicule${count > 1 ? "s" : ""} enregistré${count > 1 ? "s" : ""}. ` : ""}
          Le site public affiche automatiquement les véhicules actifs de votre flotte.
        </p>
        <div className="mt-3">
          <Link href="/pro/vehicules" className={`${proBtnPrimaryClass} inline-block`}>
            Gérer mes véhicules
          </Link>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
