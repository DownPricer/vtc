import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import type { ProIconName } from "@/components/pro/ProIcons";
import type { SettingsTabId } from "./SettingsTabs";

export type AdvancedSection = {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: ProIconName;
  /** Clés racines du brouillon éditées par cette section (indicateur « modifié »). */
  draftKeys: (keyof TenantSettingsV1)[];
};

export type AdvancedSectionGroup = {
  label: string;
  sections: AdvancedSection[];
};

export const ADVANCED_SECTION_GROUPS: AdvancedSectionGroup[] = [
  {
    label: "Image du site",
    sections: [
      {
        id: "appearance",
        label: "Apparence",
        description: "Logo, image de partage et couleurs du site.",
        icon: "globe",
        draftKeys: ["branding"],
      },
      {
        id: "home",
        label: "Page d’accueil",
        description: "Bannière, présentation, engagements et appels à l’action.",
        icon: "grid",
        draftKeys: ["home"],
      },
      {
        id: "badges",
        label: "Badges",
        description: "Pastilles de confiance affichées sur le site.",
        icon: "tag",
        draftKeys: ["badges"],
      },
      {
        id: "pricing",
        label: "Tarifs affichés",
        description: "Textes et exemples de prix visibles par les clients.",
        icon: "card",
        draftKeys: ["pricingDisplay"],
      },
    ],
  },
  {
    label: "Confiance",
    sections: [
      {
        id: "testimonials",
        label: "Témoignages",
        description: "Avis clients mis en avant sur le site.",
        icon: "chart",
        draftKeys: ["testimonials"],
      },
      {
        id: "faq",
        label: "FAQ",
        description: "Questions fréquentes et leurs réponses.",
        icon: "search",
        draftKeys: ["faq"],
      },
    ],
  },
  {
    label: "Infos pratiques",
    sections: [
      {
        id: "contact",
        label: "Contact & e-mails",
        description: "Téléphone, adresse, e-mail public et routage des demandes.",
        icon: "calendar",
        draftKeys: ["contact"],
      },
      {
        id: "legal",
        label: "Mentions légales",
        description: "Éditeur, hébergeur, CGV et confidentialité.",
        icon: "file",
        draftKeys: ["legal"],
      },
    ],
  },
];

export const ADVANCED_SECTIONS: AdvancedSection[] = ADVANCED_SECTION_GROUPS.flatMap((g) => g.sections);

export const ADVANCED_TAB_IDS: SettingsTabId[] = ADVANCED_SECTIONS.map((s) => s.id);

export function getAdvancedSection(id: SettingsTabId): AdvancedSection | undefined {
  return ADVANCED_SECTIONS.find((s) => s.id === id);
}

export function isAdvancedTabId(value: string): value is SettingsTabId {
  return (ADVANCED_TAB_IDS as string[]).includes(value);
}
