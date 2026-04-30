"use client";

import { getStoredAccessToken } from "@/lib/proApi";

export async function uploadSettingsMedia(file: File, previousPublicPath?: string): Promise<{ publicPath: string }> {
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
