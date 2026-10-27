/*
 * Service worker de l'espace pro (scope /pro/).
 *
 * Règles :
 *  - seuls les fichiers statiques versionnés de Next (/_next/static/) et la page hors ligne sont mis en cache ;
 *  - jamais de réponse d'API, jamais de page authentifiée, jamais de route hors /pro ;
 *  - hors ligne, une navigation /pro affiche /pro/offline.html ;
 *  - notifications push : affichage d'un texte générique et ouverture de la fiche au clic.
 *
 * Pour invalider les caches après un changement de ce fichier, incrémenter VERSION.
 */
const VERSION = "v1";
const CACHE_PREFIX = "vtc-pro-";
const STATIC_CACHE = `${CACHE_PREFIX}static-${VERSION}`;
const OFFLINE_CACHE = `${CACHE_PREFIX}offline-${VERSION}`;
const OFFLINE_URL = "/pro/offline.html";
const STATIC_PREFIX = "/_next/static/";
const MAX_STATIC_ENTRIES = 150;
const NOTIFICATION_ICON = "/pro/pwa-icon?size=192&purpose=any";
const DEFAULT_NOTIFICATION_URL = "/pro/demandes";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      // Mise à jour immédiate : les fichiers mis en cache sont versionnés par hash, sans risque pour la page ouverte.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE && key !== OFFLINE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isProPath(pathname) {
  return pathname === "/pro" || pathname.startsWith("/pro/");
}

async function trimCache(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_STATIC_ENTRIES;
  for (let i = 0; i < excess; i += 1) {
    await cache.delete(keys[i]);
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
    await trimCache(cache);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages : toujours le réseau ; la page hors ligne n'est qu'un repli en cas d'échec.
  if (request.mode === "navigate") {
    if (!isProPath(url.pathname)) return;
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL, { cacheName: OFFLINE_CACHE });
        return cached || Response.error();
      })
    );
    return;
  }

  // Fichiers statiques versionnés par hash : cache d'abord.
  if (url.pathname.startsWith(STATIC_PREFIX) && !request.headers.has("range")) {
    event.respondWith(cacheFirstStatic(request));
  }
  // Tout le reste (API, RSC, images, etc.) : on ne s'en mêle pas.
});

/** Lien profond accepté uniquement s'il pointe vers /pro sur ce site. */
function safeProUrl(raw) {
  try {
    const url = new URL(typeof raw === "string" ? raw : "", self.location.origin);
    if (url.origin === self.location.origin && isProPath(url.pathname)) return url.pathname + url.search;
  } catch (e) {
    // URL invalide : repli ci-dessous.
  }
  return DEFAULT_NOTIFICATION_URL;
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = typeof data.title === "string" && data.title ? data.title : "Nouvelle notification";
  const tag = typeof data.tag === "string" && data.tag ? data.tag : undefined;
  const options = {
    body: typeof data.body === "string" ? data.body : "",
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    data: { url: safeProUrl(data.url) },
  };
  if (tag) {
    options.tag = tag;
    options.renotify = true;
  }
  // Une notification doit toujours être affichée (exigence iOS/Safari et Chrome).
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(safeProUrl(event.notification.data && event.notification.data.url), self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
      for (const client of windows) {
        if (!isProPath(new URL(client.url).pathname) || !("focus" in client)) continue;
        try {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return undefined;
        } catch (e) {
          // Fenêtre non pilotable : on ouvre une nouvelle fenêtre.
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
