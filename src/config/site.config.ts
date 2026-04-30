/**
 * Configuration vitrine & contact — modèle white-label VTC.
 * Dupliquez ce fichier par client ou surchargez via variables d’environnement documentées dans README.
 */

import { getTenantSettings } from "./getTenantSettings";
import { buildSiteConfigFromTenant, type SocialLink, type Testimonial } from "./siteConfigFromTenant";

export type { SocialLink, Testimonial };

export const siteConfig = buildSiteConfigFromTenant(getTenantSettings());

export type SiteConfig = typeof siteConfig;
