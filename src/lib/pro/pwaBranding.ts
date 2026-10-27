import { createHash } from "crypto";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";

export const PRO_SCOPE = "/pro/";
export const PRO_START_URL = "/pro/dashboard";
export const PRO_MANIFEST_URL = "/pro/manifest.webmanifest";
export const PRO_ICON_URL = "/pro/pwa-icon";

export type ProPwaBranding = {
  name: string;
  shortName: string;
  logoSrc: string;
  themeColor: string;
  backgroundColor: string;
  /** Change dès que le logo, le nom ou les couleurs changent : invalide le cache des icônes. */
  version: string;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function safeColor(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return HEX_COLOR.test(v) ? v : fallback;
}

/** Libellé court affiché sous l'icône (~12 caractères maximum). */
function toShortName(name: string): string {
  if (name.length <= 12) return name;
  const first = name.split(/\s+/)[0] ?? name;
  return first.slice(0, 12);
}

/** Branding de l'application pro, lu comme le reste du site (réglages tenant publics). */
export async function getProPwaBranding(): Promise<ProPwaBranding> {
  const settings = await getPublicTenantSettings();
  const commercialName = settings.general.commercialName.trim() || "Espace pro";
  const { logoSrc, colors } = settings.branding;
  const themeColor = safeColor(colors.primary, "#2860e8");
  const backgroundColor = safeColor(colors.background, "#10192d");
  const version = createHash("sha1")
    .update([commercialName, logoSrc, themeColor, backgroundColor].join("|"))
    .digest("hex")
    .slice(0, 8);

  return {
    name: `${commercialName} Pro`,
    shortName: toShortName(commercialName),
    logoSrc: logoSrc.trim(),
    themeColor,
    backgroundColor,
    version,
  };
}
