/** Utilitaires hex → rgb pour styles inline / canvas (hors variables CSS). */

export function hexToRgbChannels(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

/** Chaîne `r, g, b` pour `rgba(var(--token), α)` en CSS. */
export function rgbTriplet(hex: string): string {
  const c = hexToRgbChannels(hex);
  if (!c) return "128, 128, 128";
  return `${c.r}, ${c.g}, ${c.b}`;
}

export function rgbString(hex: string, alpha?: number): string {
  const c = hexToRgbChannels(hex);
  if (!c) return alpha != null ? `rgba(128,128,128,${alpha})` : "#888888";
  if (alpha != null) return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

/** Normalise une saisie hex vers `#rrggbb` ou `null` si invalide. */
export function normalizeHexToSix(input: string): string | null {
  let s = input.trim();
  if (!s.startsWith("#")) s = `#${s}`;
  const ch = hexToRgbChannels(s);
  if (!ch) return null;
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(ch.r)}${to(ch.g)}${to(ch.b)}`;
}

/** Valeur sûre pour `<input type="color" />` (toujours 7 caractères). */
export function hexForColorInput(hex: string): string {
  return normalizeHexToSix(hex) ?? "#888888";
}
