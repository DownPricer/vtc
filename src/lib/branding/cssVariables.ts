import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site.config";
import type { SiteConfig } from "@/config/site.config";
import { rgbTriplet } from "@/lib/branding/colorUtils";

/** Variables CSS racine — à appliquer sur `<html>` (voir `layout.tsx`). */
export function getBrandCssVariables(colors?: SiteConfig["branding"]["colors"]): CSSProperties {
  const c = colors ?? siteConfig.branding.colors;
  const vars: Record<string, string> = {
    "--background": c.background,
    "--foreground": c.foreground,
    "--primary": c.primary,
    "--primary-dark": c.primaryDark,
    "--primary-light": c.primaryLight,
    "--secondary": c.secondary,
    "--secondary-dark": c.secondaryDark,
    "--accent-highlight": c.accentHighlight,
    "--accent-warm": c.accentWarm,
    "--game-neon": c.gameNeon,
    "--surface": c.surface,
    "--surface-hover": c.surfaceHover,
    "--dark-medium": c.darkMedium,
    "--dark-light": c.darkLight,
    "--muted": c.muted,
    "--muted-strong": c.mutedStrong,
    "--gray-deep": c.grayDeep,
    "--border-subtle": c.borderSubtle,
    "--success": c.success,
    "--warning": c.warning,
    "--primary-rgb": rgbTriplet(c.primary),
    "--secondary-rgb": rgbTriplet(c.secondary),
    "--accent-warm-rgb": rgbTriplet(c.accentWarm),
    "--accent-highlight-rgb": rgbTriplet(c.accentHighlight),
    "--game-neon-rgb": rgbTriplet(c.gameNeon),
  };
  return vars as CSSProperties;
}
