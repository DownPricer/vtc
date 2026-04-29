import { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/siteUrl";

const BASE = getPublicSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/remerciements"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/remerciements"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
