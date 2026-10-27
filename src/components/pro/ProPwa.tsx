"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** Événement Chrome/Edge/Android, absent des types DOM standard. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallMode = "none" | "prompt" | "ios";

type ProPwaContextValue = {
  installMode: InstallMode;
  promptInstall: () => Promise<void>;
};

const SW_URL = "/pro/sw.js";
const SW_SCOPE = "/pro/";

const ProPwaContext = createContext<ProPwaContextValue>({
  installMode: "none",
  promptInstall: async () => {},
});

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS se présente comme un Mac ; on le distingue par l'écran tactile.
  return window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
}

/**
 * Enregistre le service worker (production seulement) et expose l'état d'installation de la PWA.
 * Monté uniquement dans le layout /pro.
 */
export function ProPwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    // Pas de cache de fichiers de dev : le service worker n'est actif qu'en production.
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    let onVisible: (() => void) | null = null;
    const register = () => {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE })
        .then((registration) => {
          // Recherche d'une nouvelle version au retour sur l'application ; sans rechargement forcé.
          onVisible = () => {
            if (document.visibilityState === "visible") registration.update().catch(() => {});
          };
          document.addEventListener("visibilitychange", onVisible);
        })
        .catch(() => {
          // Échec silencieux : l'espace pro fonctionne sans service worker.
        });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => {
      window.removeEventListener("load", register);
      if (onVisible) document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    // Un événement ne peut servir qu'une fois.
    setDeferred(null);
  }, [deferred]);

  const installMode: InstallMode = standalone ? "none" : deferred ? "prompt" : ios ? "ios" : "none";
  const value = useMemo(() => ({ installMode, promptInstall }), [installMode, promptInstall]);

  return <ProPwaContext.Provider value={value}>{children}</ProPwaContext.Provider>;
}

export function useProPwa() {
  return useContext(ProPwaContext);
}
