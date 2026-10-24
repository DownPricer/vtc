/** Hauteur du logo dans l’en-tête à 100 % (px). */
export const LOGO_BASE_HEIGHT_PX = 36;
export const LOGO_SCALE_MIN = 50;
export const LOGO_SCALE_MAX = 250;
export const LOGO_SCALE_DEFAULT = 100;

export function clampLogoScale(scale: number | undefined | null): number {
  if (typeof scale !== "number" || !Number.isFinite(scale)) return LOGO_SCALE_DEFAULT;
  return Math.min(LOGO_SCALE_MAX, Math.max(LOGO_SCALE_MIN, Math.round(scale)));
}

export function logoHeightPx(scale: number | undefined | null): number {
  return Math.round((LOGO_BASE_HEIGHT_PX * clampLogoScale(scale)) / 100);
}
