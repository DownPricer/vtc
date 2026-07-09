import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { ProActionLink, ProField, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";

export const metadata: Metadata = {
  title: `Site internet — ${siteConfig.commercialName}`,
  description: "Gestion du site : identité, coordonnées, présentation, véhicules, services et SEO.",
  robots: { index: false, follow: false },
};

export default function ProSitePage() {
  return (
    <>
      <ProPanel>
        <ProSectionHeader
          title="Site internet"
          description="Gérez l’identité, les coordonnées, le contenu et le SEO du site. (Si certains formulaires existent déjà, ils sont dans Paramètres.)"
          action={<ProActionLink href="/pro/parametres">Ouvrir les paramètres</ProActionLink>}
        />
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Identité & coordonnées" description="Nom, téléphone, e-mail, zones de service." />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProField label="Nom commercial">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Téléphone affiché">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="E-mail contact">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Zone principale">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Présentation & services" description="Texte d’accueil, services, véhicules, visuels." />
        <div className="mt-6 grid grid-cols-1 gap-4">
          <ProField label="Présentation">
            <textarea className={proInputClass} placeholder="À configurer" disabled rows={6} />
          </ProField>
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="SEO" description="Titre, description, indexation, balises." />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProField label="Titre SEO">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
          <ProField label="Description SEO">
            <input className={proInputClass} placeholder="À configurer" disabled />
          </ProField>
        </div>
      </ProPanel>
    </>
  );
}
