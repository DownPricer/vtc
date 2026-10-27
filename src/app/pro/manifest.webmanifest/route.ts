import { NextResponse } from "next/server";
import { getProPwaBranding, PRO_ICON_URL, PRO_SCOPE, PRO_START_URL } from "@/lib/pro/pwaBranding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Manifeste de l'espace pro uniquement (référencé depuis le layout `/pro`, jamais depuis le site public). */
export async function GET() {
  const b = await getProPwaBranding();
  const icon = (size: number, purpose: "any" | "maskable") => ({
    src: `${PRO_ICON_URL}?size=${size}&purpose=${purpose}&v=${b.version}`,
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose,
  });

  const manifest = {
    id: PRO_SCOPE,
    name: b.name,
    short_name: b.shortName,
    description: `Espace professionnel ${b.name} : demandes, réservations et paiements.`,
    lang: "fr",
    dir: "ltr",
    start_url: PRO_START_URL,
    scope: PRO_SCOPE,
    display: "standalone",
    background_color: b.backgroundColor,
    theme_color: b.themeColor,
    categories: ["business"],
    icons: [icon(192, "any"), icon(512, "any"), icon(192, "maskable"), icon(512, "maskable")],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
