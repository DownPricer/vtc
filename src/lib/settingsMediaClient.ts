"use client";

import { getStoredAccessToken } from "@/lib/proApi";

async function postSettingsMediaMultipart(file: File, previousPublicPath?: string): Promise<{ publicPath: string }> {
  const fd = new FormData();
  fd.append("file", file);
  if (previousPublicPath) fd.append("previousPublicPath", previousPublicPath);
  const token = getStoredAccessToken();
  const res = await fetch("/api/pro/settings-media", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  let body: { error?: string; publicPath?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(typeof body.error === "string" && body.error ? body.error : `Échec de l’upload (${res.status}).`);
  }
  if (typeof body.publicPath !== "string") {
    throw new Error("Réponse serveur invalide.");
  }
  return { publicPath: body.publicPath };
}

export async function uploadSettingsMedia(file: File, previousPublicPath?: string): Promise<{ publicPath: string }> {
  return postSettingsMediaMultipart(file, previousPublicPath);
}

const VIDEO_ACCEPT = ["video/mp4", "video/webm", "video/quicktime"] as const;

export async function uploadSettingsVideo(file: File, previousPublicPath?: string): Promise<{ publicPath: string }> {
  const mime = file.type.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!VIDEO_ACCEPT.includes(mime as (typeof VIDEO_ACCEPT)[number])) {
    throw new Error("Format non accepté (MP4, WebM ou MOV uniquement).");
  }
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Fichier trop volumineux (max. 50 Mo).");
  }
  return postSettingsMediaMultipart(file, previousPublicPath);
}

export async function deleteSettingsMediaFile(publicPath: string): Promise<void> {
  const token = getStoredAccessToken();
  await fetch("/api/pro/settings-media", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ publicPath }),
  });
}
