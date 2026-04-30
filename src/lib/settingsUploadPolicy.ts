import path from "path";

/** Préfixe URL public pour les médias uploadés depuis le dashboard paramètres. */
export const SETTINGS_UPLOAD_PUBLIC_PREFIX = "/uploads/settings/default";

/**
 * Vérifie qu’une URL publique pointe vers un fichier autorisé sous `public/uploads/settings/default/`.
 * Refuse `..`, segments invalides et extensions hors JPEG/PNG/WebP.
 */
export function isSafeSettingsUploadPublicPath(publicPath: string): boolean {
  const trimmed = publicPath.trim();
  if (!trimmed.startsWith(SETTINGS_UPLOAD_PUBLIC_PREFIX)) return false;
  if (trimmed.includes("..")) return false;
  const noQuery = trimmed.split("?")[0] ?? "";
  const segments = noQuery.split("/").filter(Boolean);
  if (segments.length !== 4) return false;
  const [a, b, folder, name] = segments;
  if (a !== "uploads" || b !== "settings" || folder !== "default") return false;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return false;
  if (!/\.(jpe?g|png|webp)$/i.test(name)) return false;
  return true;
}

/** Chemin absolu sur disque pour un path public sûr, ou `null`. */
export function resolveSafeSettingsUploadFile(publicPath: string): string | null {
  if (!isSafeSettingsUploadPublicPath(publicPath)) return null;
  const noQuery = publicPath.trim().split("?")[0] ?? "";
  const segments = noQuery.split("/").filter(Boolean);
  const fileName = segments[3];
  const abs = path.join(process.cwd(), "public", "uploads", "settings", "default", fileName);
  const root = path.join(process.cwd(), "public", "uploads", "settings", "default");
  const resolved = path.resolve(abs);
  const resolvedRoot = path.resolve(root);
  if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) return null;
  return resolved;
}

export function getSettingsDefaultUploadDir(): string {
  return path.join(process.cwd(), "public", "uploads", "settings", "default");
}
