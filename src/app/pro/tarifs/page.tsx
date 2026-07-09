import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { ProActionLink, ProField, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";

export const metadata: Metadata = {
  title: `Tarifs — ${siteConfig.commercialName}`,
  description: "Configuration des tarifs VTC (trajets, aéroports, mise à disposition).",
  robots: { index: false, follow: false },
};

export default function ProTarifsPage() {
  return (
    <>
      <ProPanel>
        <ProSectionHeader
          title="Tarifs"
          description="Configurez vos tarifs : trajets, aéroports, mise à disposition, hors zone. (Page structurée, raccord API à finaliser si nécessaire.)"
          action={<ProActionLink href="/pro/parametres">Aller aux paramètres</ProActionLink>}
        />
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Trajets classiques" description="Base de calcul (approche, retour dépôt, hors zone)." />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProField label="Approche chauffeur (€/km)">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Retour dépôt (€/km)">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Hors zone (€/km)">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Minimum de course">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Aéroports" description="Suppléments / forfaits aéroport (CDG, ORY, BVA…)." />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProField label="CDG (forfait ou supplément)">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="ORY (forfait ou supplément)">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Mise à disposition" description="Tarification horaire et conditions." />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProField label="Prix / heure">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Minimum (heures)">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
        </div>
        <div className="mt-6">
          <button type="button" disabled className="inline-flex rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500">
            Enregistrer (à finaliser)
          </button>
        </div>
      </ProPanel>
    </>
  );
}
