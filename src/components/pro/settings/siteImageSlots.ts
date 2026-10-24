import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

export type SiteImageSlot = {
  id: string;
  label: string;
  /** Page du site où l’image apparaît. */
  page: string;
  href: string;
  /** Emplacement précis sur la page. */
  position: string;
  recommended: string;
  srcPath: string;
  altPath?: string;
};

/** Toutes les images « uniques » de la vitrine, avec leur emplacement. Les véhicules ont leur propre section. */
export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    id: "home-hero",
    label: "Bannière d’accueil",
    page: "Page d’accueil",
    href: "/",
    position: "grande image en fond, tout en haut",
    recommended: "1920 × 1080 px (paysage)",
    srcPath: "home.hero.backgroundImageSrc",
    altPath: "home.hero.imageAlt",
  },
  {
    id: "home-portrait",
    label: "Portrait (présentation du chauffeur)",
    page: "Page d’accueil",
    href: "/",
    position: "bloc « À propos », photo à gauche du texte",
    recommended: "900 × 1200 px (portrait 3:4)",
    srcPath: "home.aboutPreview.portraitSrc",
    altPath: "home.aboutPreview.portraitAlt",
  },
  {
    id: "home-video-poster",
    label: "Couverture de la vidéo",
    page: "Page d’accueil",
    href: "/",
    position: "section vidéo, image affichée avant la lecture",
    recommended: "1280 × 720 px (16:9)",
    srcPath: "home.video.posterSrc",
  },
  {
    id: "home-cta",
    label: "Bannière de fin de page",
    page: "Page d’accueil",
    href: "/",
    position: "dernier bloc « Réservez », tout en bas",
    recommended: "1920 × 800 px (paysage)",
    srcPath: "home.ctaFinal.backgroundImageSrc",
  },
  {
    id: "about-hero",
    label: "Bannière « À propos »",
    page: "Page À propos",
    href: "/a-propos",
    position: "grande image en fond de l’en-tête de la page",
    recommended: "1920 × 1080 px (paysage)",
    srcPath: "aboutPage.heroImageSrc",
    altPath: "aboutPage.heroImageAlt",
  },
  {
    id: "services-hero",
    label: "Bannière « Services »",
    page: "Page Services",
    href: "/services",
    position: "grande image en fond de l’en-tête de la page",
    recommended: "1920 × 1080 px (paysage)",
    srcPath: "services.pageHero.imageSrc",
    altPath: "services.pageHero.imageAlt",
  },
  {
    id: "tarifs-hero",
    label: "Bannière « Tarifs »",
    page: "Page Tarifs",
    href: "/tarifs",
    position: "grande image en fond de l’en-tête de la page",
    recommended: "1920 × 1080 px (paysage)",
    srcPath: "pricingDisplay.tarifsPage.heroImageSrc",
    altPath: "pricingDisplay.tarifsPage.heroImageAlt",
  },
];

export const SITE_IMAGE_PAGES = Array.from(new Set(SITE_IMAGE_SLOTS.map((s) => s.page)));

export function getAtPath(draft: TenantSettingsV1, path: string): string {
  let cur: unknown = draft;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === "string" ? cur : "";
}

/** Retourne une copie du brouillon avec la valeur écrite au chemin donné (les objets intermédiaires sont créés au besoin). */
export function setAtPath(draft: TenantSettingsV1, path: string, value: string): TenantSettingsV1 {
  const next = structuredClone(draft) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let cur = next;
  for (const key of keys.slice(0, -1)) {
    const child = cur[key];
    if (child === null || typeof child !== "object") cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return next as unknown as TenantSettingsV1;
}
