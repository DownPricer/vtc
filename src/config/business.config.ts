/**
 * Informations légales et société — personnaliser par client VTC.
 */

import { getTenantSettings } from "./getTenantSettings";
import { buildBusinessConfigFromTenant } from "./businessConfigFromTenant";

export const businessConfig = buildBusinessConfigFromTenant(getTenantSettings());

export type BusinessConfig = typeof businessConfig;
