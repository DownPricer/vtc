"use client";

import { useCallback, useEffect, useState } from "react";
import { ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import {
  detectPushSupport,
  disablePush,
  enablePush,
  fetchPushPublicKey,
  getCurrentPushSubscription,
  getPushPermission,
  resyncPush,
} from "@/lib/proPushClient";
import { proBtnPrimaryClass, proBtnSecondaryClass } from "./editable/proFieldStyles";

type Status = "checking" | "unsupported" | "ios-install" | "unavailable" | "denied" | "off" | "on";

const DENIED_HELP =
  "Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages de votre navigateur ou de votre téléphone (infos du site > Notifications), puis revenez ici.";

export function ProNotificationsPanel() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const support = detectPushSupport();
    if (support === "ios-needs-install") return setStatus("ios-install");
    if (support === "unsupported") return setStatus("unsupported");
    if (getPushPermission() === "denied") return setStatus("denied");

    try {
      if (!(await fetchPushPublicKey())) return setStatus("unavailable");
    } catch {
      // Réseau indisponible : on laisse l'utilisateur réessayer plutôt que d'afficher « indisponible ».
    }
    const subscription = await getCurrentPushSubscription().catch(() => null);
    if (subscription && getPushPermission() === "granted") {
      void resyncPush();
      return setStatus("on");
    }
    setStatus("off");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onEnable = async () => {
    setBusy(true);
    setError(null);
    const result = await enablePush();
    setBusy(false);
    if (result.ok) return setStatus("on");
    if (result.reason === "denied") return setStatus(getPushPermission() === "denied" ? "denied" : "off");
    if (result.reason === "not-configured") return setStatus("unavailable");
    if (result.reason === "unsupported") return setStatus("unsupported");
    setError(result.message ?? "Impossible d'activer les notifications.");
  };

  const onDisable = async () => {
    setBusy(true);
    setError(null);
    await disablePush();
    setBusy(false);
    setStatus("off");
  };

  return (
    <ProPanel id="notifications">
      <ProSectionHeader
        level="panel"
        title="Notifications"
        description="Soyez prévenu sur ce téléphone ou cet ordinateur dès qu'une demande arrive, qu'un paiement est confirmé ou qu'une annulation est demandée."
        action={
          status === "off" ? (
            <button type="button" onClick={onEnable} disabled={busy} className={proBtnPrimaryClass}>
              {busy ? "Activation…" : "Activer les notifications"}
            </button>
          ) : status === "on" ? (
            <button type="button" onClick={onDisable} disabled={busy} className={proBtnSecondaryClass}>
              {busy ? "Désactivation…" : "Désactiver"}
            </button>
          ) : null
        }
      />

      <div className="space-y-2 text-sm leading-relaxed text-[var(--pro-text-muted)]" aria-live="polite">
        {status === "checking" ? <p>Vérification…</p> : null}
        {status === "on" ? (
          <p className="font-medium text-[var(--pro-text)]">Notifications activées sur cet appareil.</p>
        ) : null}
        {status === "off" ? (
          <p>
            Les notifications ne contiennent aucune information sur vos clients : touchez-en une pour ouvrir directement la
            fiche concernée.
          </p>
        ) : null}
        {status === "ios-install" ? (
          <p>
            Sur iPhone et iPad, les notifications ne fonctionnent qu&apos;une fois l&apos;application ajoutée à l&apos;écran
            d&apos;accueil : dans Safari, touchez <strong className="text-[var(--pro-text)]">Partager</strong> puis{" "}
            <strong className="text-[var(--pro-text)]">Sur l&apos;écran d&apos;accueil</strong>. Ouvrez ensuite
            l&apos;application depuis son icône et revenez sur cette page (iOS 16.4 ou plus récent requis).
          </p>
        ) : null}
        {status === "denied" ? <p>{DENIED_HELP}</p> : null}
        {status === "unsupported" ? <p>Ce navigateur ne permet pas les notifications pour cette application.</p> : null}
        {status === "unavailable" ? (
          <p>Les notifications ne sont pas disponibles pour le moment. Contactez votre prestataire si le problème persiste.</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </ProPanel>
  );
}
