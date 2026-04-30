import type { TenantSettingsV1 } from "./tenant-settings.types";

export function buildBusinessConfigFromTenant(t: TenantSettingsV1) {
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
}

export type BusinessConfig = ReturnType<typeof buildBusinessConfigFromTenant>;
