"use client";

import { proAuthenticatedFetch } from "./proApi";

const SW_URL = "/pro/sw.js";
const SW_SCOPE = "/pro/";

export type PushSupport = "ok" | "unsupported" | "ios-needs-install";

export type EnablePushResult =
  | { ok: true }
  | { ok: false; reason: "denied" | "not-configured" | "unsupported" | "error"; message?: string };

function isStandaloneDisplay(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
}

/** Sur iPhone/iPad, le push n'existe qu'une fois l'application ajoutée à l'écran d'accueil. */
export function detectPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (isIosDevice() && !isStandaloneDisplay()) return "ios-needs-install";
  const hasApis = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  // Le service worker n'est enregistré qu'en production (voir ProPwa).
  return hasApis && process.env.NODE_ENV === "production" ? "ok" : "unsupported";
}

export function getPushPermission(): NotificationPermission {
  return "Notification" in window ? Notification.permission : "denied";
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const raw = window.atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameKey(existing: ArrayBuffer | null, expected: Uint8Array): boolean {
  if (!existing) return false;
  const a = new Uint8Array(existing);
  return a.length === expected.length && a.every((byte, i) => byte === expected[i]);
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  if (existing) return existing;
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (detectPushSupport() !== "ok") return null;
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Clé publique VAPID via l'API (jamais figée au build). `null` si le push n'est pas configuré côté API. */
export async function fetchPushPublicKey(): Promise<string | null> {
  const res = await proAuthenticatedFetch("/pro/push/public-key");
  if (res.status === 503) return null;
  if (!res.ok) throw new Error("Impossible de contacter le serveur.");
  const json = (await res.json().catch(() => ({}))) as { data?: { publicKey?: string } };
  return json.data?.publicKey || null;
}

async function registerOnServer(subscription: PushSubscription): Promise<boolean> {
  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys.auth) return false;
  const res = await proAuthenticatedFetch("/pro/push/subscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }),
  });
  return res.ok;
}

/**
 * À appeler directement depuis un clic : la demande de permission exige un geste de l'utilisateur
 * (et doit partir avant tout `await` réseau pour Safari).
 */
export async function enablePush(): Promise<EnablePushResult> {
  if (detectPushSupport() !== "ok") return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  try {
    const publicKey = await fetchPushPublicKey();
    if (!publicKey) return { ok: false, reason: "not-configured" };
    const serverKey = base64UrlToBytes(publicKey);

    const reg = await getRegistration();
    if (!reg) return { ok: false, reason: "unsupported" };

    let subscription = await reg.pushManager.getSubscription();
    // Clé VAPID changée côté serveur : l'ancien abonnement ne serait plus accepté.
    if (subscription && !sameKey(subscription.options.applicationServerKey, serverKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: serverKey });
    }

    if (!(await registerOnServer(subscription))) {
      await subscription.unsubscribe().catch(() => undefined);
      return { ok: false, reason: "error", message: "Le serveur a refusé l'abonnement. Réessayez." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "error", message: "Impossible d'activer les notifications. Réessayez." };
  }
}

/** Resynchronise le serveur avec un abonnement local existant (idempotent, silencieux). */
export async function resyncPush(): Promise<void> {
  try {
    const subscription = await getCurrentPushSubscription();
    if (subscription && getPushPermission() === "granted") await registerOnServer(subscription);
  } catch {
    // Silencieux : la resynchronisation est un confort.
  }
}

/** Désactive les notifications sur cet appareil (serveur puis navigateur). Ne lève jamais. */
export async function disablePush(): Promise<void> {
  try {
    const subscription = await getCurrentPushSubscription();
    if (!subscription) return;
    await proAuthenticatedFetch("/pro/push/subscribe", {
      method: "DELETE",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe().catch(() => undefined);
  } catch {
    // Silencieux : la déconnexion ne doit jamais être bloquée.
  }
}
