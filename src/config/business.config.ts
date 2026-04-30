/**
 * Informations légales et société — personnaliser par client VTC.
 */

import { getTenantSettings } from "./getTenantSettings";

export const businessConfig = (() => {
  const t = getTenantSettings();
  return {
    legalName: t.general.legalName,
    displayName: t.legal.displayName,
    legalRepresentative: t.legal.legalRepresentative,
    siret: t.legal.siret,
    vtcLicenseNumber: t.legal.vtcLicenseNumber,
    headquarters: {
      ...t.contact.address,
    },
    hosting: { ...t.legal.hosting },
    privacySummary: t.legal.privacySummary,
  } as const;
})();
