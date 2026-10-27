import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getProPwaBranding } from "@/lib/pro/pwaBranding";
import { resolveSafeSettingsUploadFile } from "@/lib/settingsUploadPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SIZES = new Set([180, 192, 512]);
const MAX_LOGO_BYTES = 3 * 1024 * 1024;

function detectMime(buf: Buffer): "image/png" | "image/jpeg" | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  return null;
}

/** Fichier local du logo : `public/images/...` ou média uploadé depuis le dashboard. Jamais d'URL distante. */
function resolveLogoFile(logoSrc: string): string | null {
  const src = logoSrc.split("?")[0] ?? "";
  const uploaded = resolveSafeSettingsUploadFile(src);
  if (uploaded) return uploaded;
  if (!src.startsWith("/images/") || src.includes("..")) return null;
  const publicRoot = path.resolve(process.cwd(), "public");
  const resolved = path.resolve(publicRoot, `.${src}`);
  return resolved.startsWith(publicRoot + path.sep) ? resolved : null;
}

async function loadLogoDataUri(logoSrc: string): Promise<string | null> {
  const file = resolveLogoFile(logoSrc);
  if (!file) return null;
  try {
    const buf = await readFile(file);
    if (buf.length === 0 || buf.length > MAX_LOGO_BYTES) return null;
    // Seuls PNG et JPEG sont rendus de façon fiable par ImageResponse ; le reste passe au repli.
    const mime = detectMime(buf);
    return mime ? `data:${mime};base64,${buf.toString("base64")}` : null;
  } catch {
    return null;
  }
}

/** Initiales pour le repli sans logo (ex. « Exemple VTC » -> « EV »). */
function initials(name: string): string {
  const letters = name
    .replace(/\bPro$/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => Array.from(w)[0] ?? "")
    .join("");
  return (letters || "P").slice(0, 2).toUpperCase();
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const requested = Number(params.get("size"));
  const size = ALLOWED_SIZES.has(requested) ? requested : 512;
  const maskable = params.get("purpose") === "maskable";

  const b = await getProPwaBranding();
  const logo = await loadLogoDataUri(b.logoSrc);

  // Maskable : le contenu doit tenir dans le cercle central de 80 % ; « any » : marge légère.
  const content = Math.round(size * (maskable ? 0.62 : 0.76));

  const body = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} width={content} height={content} style={{ objectFit: "contain" }} alt="" />
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: content,
        height: content,
        color: b.themeColor,
        fontSize: Math.round(content * 0.55),
        fontWeight: 700,
        letterSpacing: -2,
      }}
    >
      {initials(b.name)}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: b.backgroundColor,
          // Les icônes « any » reçoivent des coins arrondis ; la maskable reste pleine pour être découpée par l'OS.
          borderRadius: maskable || size === 180 ? 0 : Math.round(size * 0.2),
        }}
      >
        {body}
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400" },
    }
  );
}
