import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://vtc76.fr";

type RouteConfig = {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

const routes: RouteConfig[] = [
  { path: "",              changeFrequency: "weekly",  priority: 1.0 },
  { path: "/calculateur",  changeFrequency: "weekly",  priority: 0.95 },
  { path: "/tarifs",       changeFrequency: "weekly",  priority: 0.9 },
  { path: "/services",     changeFrequency: "monthly", priority: 0.85 },
  { path: "/devis",        changeFrequency: "monthly", priority: 0.85 },
  { path: "/contact",      changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq",          changeFrequency: "monthly", priority: 0.8 },
  { path: "/a-propos",     changeFrequency: "monthly", priority: 0.7 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
