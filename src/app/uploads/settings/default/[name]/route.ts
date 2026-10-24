import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSafeSettingsUploadPublicPath, resolveSafeSettingsUploadFile, SETTINGS_UPLOAD_PUBLIC_PREFIX } from "@/lib/settingsUploadPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/**
 * Sert les médias uploadés depuis le dashboard. Next.js (`next start`) ne publie que les fichiers de `public/`
 * présents au démarrage : sans cette route, tout fichier uploadé ensuite répond 404.
 */
export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const publicPath = `${SETTINGS_UPLOAD_PUBLIC_PREFIX}/${params.name}`;
  if (!isSafeSettingsUploadPublicPath(publicPath)) return new NextResponse("Not found", { status: 404 });
  const abs = resolveSafeSettingsUploadFile(publicPath);
  if (!abs) return new NextResponse("Not found", { status: 404 });

  let size: number;
  try {
    const info = await stat(abs);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    size = info.size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = params.name.split(".").pop()?.toLowerCase() ?? "";
  const headers: Record<string, string> = {
    "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    // Noms en UUID : un fichier ne change jamais de contenu.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  // Les lecteurs vidéo (Safari notamment) exigent le support des requêtes Range.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end || start >= size) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const body = Readable.toWeb(createReadStream(abs, { start, end })) as ReadableStream;
    return new NextResponse(body, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const body = Readable.toWeb(createReadStream(abs)) as ReadableStream;
  return new NextResponse(body, { status: 200, headers: { ...headers, "Content-Length": String(size) } });
}
