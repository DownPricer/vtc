import { siteConfig } from "@/config/site.config";

export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.urls.defaultSiteUrl;
  return raw.replace(/\/$/, "");
}
