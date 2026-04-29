import { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { siteConfig } from "@/config/site.config";

const BASE = getPublicSiteUrl();

type RouteConfig = {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

const routes: RouteConfig[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/calculateur", changeFrequency: "weekly", priority: 0.95 },
  { path: "/tarifs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.85 },
  { path: "/devis", changeFrequency: "monthly", priority: 0.85 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
  { path: "/a-propos", changeFrequency: "monthly", priority: 0.7 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
];

if (siteConfig.features.miniGame) {
  routes.push({ path: "/jeu", changeFrequency: "monthly", priority: 0.3 });
}
if (siteConfig.features.radioPage) {
  routes.push({ path: "/radio", changeFrequency: "monthly", priority: 0.35 });
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
