import path from "path";
import { access, mkdir, unlink, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyProBearerAllowed } from "@/lib/proBearerAuthServer";
import {
  getSettingsDefaultUploadDir,
  isSafeSettingsUploadPublicPath,
  resolveSafeSettingsUploadFile,
  SETTINGS_UPLOAD_PUBLIC_PREFIX,
} from "@/lib/settingsUploadPolicy";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const ALLOWED_IMAGE_MIME = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const ALLOWED_VIDEO_MIME = new Map<string, string>([
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"],
]);

async function authOr401(req: NextRequest) {
  const auth = await verifyProBearerAllowed(req.headers.get("authorization"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  return null;
}

async function tryDeleteUploadPublicPath(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.trim()) return;
  const p = publicPath.trim();
  if (!isSafeSettingsUploadPublicPath(p)) return;
  const abs = resolveSafeSettingsUploadFile(p);
  if (!abs) return;
  try {
    await unlink(abs);
  } catch {
    /* fichier déjà absent ou erreur IO — ignorer */
  }
}

/** POST multipart : champ `file`, optionnel `previousPublicPath` (suppression si upload dashboard). */
export async function POST(req: NextRequest) {
  const denied = await authOr401(req);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const file = form.get("file");
  const previousRaw = form.get("previousPublicPath");
  const previousPublicPath = typeof previousRaw === "string" ? previousRaw : undefined;

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Fichier manquant (champ « file »)." }, { status: 400 });
  }

  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  const ext = ALLOWED_IMAGE_MIME.get(mime) ?? ALLOWED_VIDEO_MIME.get(mime);
  if (!ext) {
    return NextResponse.json(
      {
        error:
          "Type MIME non autorisé. Images : JPEG, PNG, WebP. Vidéos : MP4, WebM, QuickTime (.mov). Pas de SVG.",
      },
      { status: 415 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
  }
  const maxBytes = ALLOWED_VIDEO_MIME.has(mime) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (buf.length > maxBytes) {
    const maxLabel = ALLOWED_VIDEO_MIME.has(mime) ? "50 Mo" : "5 Mo";
    return NextResponse.json({ error: `Fichier trop volumineux (max. ${maxLabel}).` }, { status: 413 });
  }

  const dir = getSettingsDefaultUploadDir();
  await mkdir(dir, { recursive: true });

  const baseName = `${randomUUID()}${ext}`;
  const outPath = path.join(dir, baseName);
  await writeFile(outPath, buf);
  try {
    await access(outPath, fsConstants.R_OK);
  } catch {
    return NextResponse.json({ error: "Écriture du fichier impossible (vérifiez les droits disque)." }, { status: 500 });
  }

  const publicPath = `${SETTINGS_UPLOAD_PUBLIC_PREFIX}/${baseName}`;

  if (previousPublicPath && isSafeSettingsUploadPublicPath(previousPublicPath.trim())) {
    await tryDeleteUploadPublicPath(previousPublicPath);
  }

  return NextResponse.json({ publicPath });
}

/** DELETE JSON `{ "publicPath": "/uploads/settings/default/…" }` — uniquement chemins upload dashboard. */
export async function DELETE(req: NextRequest) {
  const denied = await authOr401(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON attendu." }, { status: 400 });
  }

  const publicPath =
    body && typeof body === "object" && typeof (body as { publicPath?: unknown }).publicPath === "string"
      ? (body as { publicPath: string }).publicPath
      : "";

  if (!isSafeSettingsUploadPublicPath(publicPath)) {
    return NextResponse.json({ error: "Chemin non autorisé ou non supprimable." }, { status: 400 });
  }

  await tryDeleteUploadPublicPath(publicPath);
  return NextResponse.json({ ok: true });
}
