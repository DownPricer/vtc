"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { mapApiErrorToFr } from "@/components/pro/proDisplay";
import { ProIcon } from "@/components/pro/ProIcons";
import { ProActionLink, ProAlert, ProPageHead, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";
import { ProGhostButton } from "@/components/pro/ProListUi";
import {
  type ProPaymentSettingsData,
  type ProStripeSnapshot,
  type ProStripeUiStatus,
  ProPaymentsApiError,
  connectStripe,
  createStripeOnboardingLink,
  getPaymentSettings,
  updatePaymentSettings,
} from "@/lib/proPaymentsClient";
import {
  type ProStripeOverviewData,
  createStripeLoginLink,
  getStripeOverview,
  isStripeUrl,
  labelRefundStatus,
  refundStatusBadgeClass,
} from "@/lib/proRefundsClient";
import { labelLeadPaymentStatus, leadPaymentStatusBadgeClass } from "@/lib/leadPaymentStatusUi";
import { CancellationPolicyPanel } from "./CancellationPolicyPanel";

type DepositUiKind = "percent" | "fixed";

const PREVIEW_AMOUNT = 100;

function parseEurosToCents(raw: string): number | null {
  const s = raw.replace(",", ".").trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  if (Number.isNaN(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function centsToEurosInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function isReadyToCharge(stripe: ProStripeSnapshot): boolean {
  return (
    stripe.onboardingStatus === "COMPLETE" &&
    stripe.chargesEnabled &&
    stripe.detailsSubmitted
  );
}

/** Statut d'affichage : celui calculé par l'API depuis l'état réel du compte, sinon déduit des drapeaux connus. */
function deriveUiStatus(stripe: ProStripeSnapshot, live: ProStripeUiStatus | undefined): ProStripeUiStatus {
  if (live) return live;
  if (!stripe.stripeAccountId) return "NOT_CONNECTED";
  if (stripe.onboardingStatus === "RESTRICTED") return "ACTION_REQUIRED";
  if (stripe.chargesEnabled && stripe.payoutsEnabled && stripe.detailsSubmitted) return "ACTIVE";
  if (stripe.chargesEnabled && !stripe.payoutsEnabled) return "PAYOUTS_SUSPENDED";
  if (stripe.detailsSubmitted) return "VERIFICATION_NEEDED";
  return "IN_PROGRESS";
}

function headlineForUiStatus(ui: ProStripeUiStatus): { title: string; hint: string; badge: string; tone: "ok" | "warn" | "bad" } {
  switch (ui) {
    case "NOT_CONNECTED":
      return {
        title: "Stripe non connecté",
        hint: "Connectez votre compte Stripe pour accepter les paiements en ligne de vos clients et recevoir votre argent sur votre compte bancaire.",
        badge: "Non connecté",
        tone: "bad",
      };
    case "IN_PROGRESS":
      return {
        title: "Configuration en cours",
        hint: "Votre compte Stripe est créé mais l’inscription n’est pas terminée. Reprenez-la pour activer les paiements.",
        badge: "En cours",
        tone: "warn",
      };
    case "VERIFICATION_NEEDED":
      return {
        title: "Vérification Stripe nécessaire",
        hint: "Stripe vérifie vos informations ou en attend de nouvelles. Les paiements s’activent dès la validation.",
        badge: "Vérification",
        tone: "warn",
      };
    case "ACTIVE":
      return {
        title: "Paiements activés",
        hint: "Votre compte peut recevoir des paiements par carte et vos versements bancaires sont actifs.",
        badge: "Actif",
        tone: "ok",
      };
    case "PAYOUTS_SUSPENDED":
      return {
        title: "Versements suspendus",
        hint: "Vous pouvez encaisser mais Stripe ne verse pas encore l’argent sur votre compte bancaire. Vérifiez votre compte.",
        badge: "Versements suspendus",
        tone: "warn",
      };
    case "ACTION_REQUIRED":
    default:
      return {
        title: "Action requise",
        hint: "Stripe attend des informations ou signale un problème de conformité. Ouvrez la configuration pour le résoudre.",
        badge: "Action requise",
        tone: "warn",
      };
  }
}

function errorMessage(e: unknown): string {
  if (e instanceof ProPaymentsApiError) {
    if (e.code === "STRIPE_NOT_CONFIGURED") {
      return "La plateforme n’a pas encore configuré Stripe (clés ou secrets serveur manquants). Impossible d’utiliser Connect depuis cet espace : contactez l’administrateur technique.";
    }
    if (e.code === "STRIPE_CONNECT_URLS_NOT_CONFIGURED") {
      return "Les URLs de retour Stripe Connect ne sont pas configurées côté serveur.";
    }
    if (e.code === "STRIPE_ONBOARDING_INCOMPLETE") {
      return "Terminez d’abord la configuration de votre compte Stripe pour ouvrir votre tableau de bord.";
    }
    if (e.code === "STRIPE_ACCOUNT_UNREACHABLE") {
      return "Ce compte Stripe n’est plus accessible. Contactez le support de la plateforme.";
    }
    if (e.code === "STRIPE_DASHBOARD_UNSUPPORTED") {
      return "Ce compte Stripe ne prend pas en charge le Dashboard Express.";
    }
    return e.message || "Erreur API";
  }
  return mapApiErrorToFr((e as Error).message);
}

const euro = (value: number) =>
  `${value.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })} €`;

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-[44px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[7px] border border-transparent bg-[var(--pro-accent)] px-[17px] text-[13px] font-bold text-white shadow-[0_4px_12px_rgb(37_99_235/14%)] transition hover:bg-[var(--pro-accent-hover)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function CheckItem({ ok, title, okText, koText }: { ok: boolean; title: string; okText: string; koText: string }) {
  return (
    <div className="flex items-start gap-[9px]">
      <span className={`grid h-[21px] w-[21px] shrink-0 place-items-center rounded-full border text-xs font-extrabold ${ok ? "pro-tone--ok" : "pro-tone--warn"}`} aria-hidden="true">
        {ok ? "✓" : "!"}
      </span>
      <div>
        <strong className="mb-[3px] block text-xs leading-[1.35] text-[var(--pro-text)]">{title}</strong>
        <span className="text-xs text-[var(--pro-text-muted)]">{ok ? okText : koText}</span>
      </div>
    </div>
  );
}

/** Interrupteur accessible (case à cocher stylée). */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <span className="relative h-[26px] w-[44px] shrink-0">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none relative block h-[26px] w-[44px] rounded-full bg-[#7c8ba3] transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgb(0_0_0/18%)] after:transition-transform after:content-[''] peer-checked:bg-[var(--pro-accent)] peer-checked:after:translate-x-[18px] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-[#79a8ff]"
      />
    </span>
  );
}

const CHOICE =
  "flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-4 has-[:checked]:border-[var(--pro-accent)] has-[:checked]:bg-[var(--pro-accent-soft)]";

export function ProPaymentsClient() {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");

  const [stripeUi, setStripeUi] = useState<ProStripeSnapshot | null>(null);
  const [overview, setOverview] = useState<ProStripeOverviewData | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [returnNotice, setReturnNotice] = useState<{ tone: "success" | "info" | "warning"; text: string } | null>(null);

  const [paymentOnlineEnabled, setPaymentOnlineEnabled] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"FULL" | "DEPOSIT">("FULL");
  const [depositUiKind, setDepositUiKind] = useState<DepositUiKind>("percent");
  const [depositPercentInput, setDepositPercentInput] = useState("");
  const [depositEurosInput, setDepositEurosInput] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState("");

  const [stripeBusy, setStripeBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveOk, setSaveOk] = useState("");
  const [formError, setFormError] = useState("");
  const [stripeCardError, setStripeCardError] = useState("");
  const [refreshOk, setRefreshOk] = useState("");

  const applySettings = useCallback((data: ProPaymentSettingsData) => {
    setStripeUi(data.stripe);
    setPaymentOnlineEnabled(data.paymentOnlineEnabled);
    setPaymentMode(data.paymentMode);

    let kind: DepositUiKind = "percent";
    let percent = "";
    let euros = "";
    if (data.paymentMode === "DEPOSIT") {
      if (data.depositPercent != null) {
        percent = String(data.depositPercent);
      } else if (data.depositFixedAmount != null) {
        kind = "fixed";
        euros = centsToEurosInput(data.depositFixedAmount);
      }
    }
    setDepositUiKind(kind);
    setDepositPercentInput(percent);
    setDepositEurosInput(euros);
    setSavedSnapshot(JSON.stringify([data.paymentOnlineEnabled, data.paymentMode, kind, percent, euros]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    setLoadError("");
    getPaymentSettings()
      .then((data) => {
        if (cancelled) return;
        applySettings(data);
        setLoadState("ready");
        void handleStripeParams();
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  const uiStatus = useMemo<ProStripeUiStatus | null>(
    () => (stripeUi ? deriveUiStatus(stripeUi, overview?.status.uiStatus) : null),
    [stripeUi, overview]
  );
  const stripeHeadline = useMemo(() => (uiStatus ? headlineForUiStatus(uiStatus) : null), [uiStatus]);

  const currentSnapshot = JSON.stringify([paymentOnlineEnabled, paymentMode, depositUiKind, depositPercentInput, depositEurosInput]);
  const dirty = currentSnapshot !== savedSnapshot;

  const preview = useMemo(() => {
    if (!paymentOnlineEnabled) {
      return { title: "Paiement en ligne désactivé", detail: "Aucun lien de paiement ne sera proposé depuis les demandes." };
    }
    if (paymentMode === "FULL") {
      return { title: `Le client paie ${euro(PREVIEW_AMOUNT)} en ligne`, detail: "Le montant complet est demandé après acceptation." };
    }
    if (depositUiKind === "percent") {
      const percent = Number.parseInt(depositPercentInput.trim(), 10);
      if (Number.isNaN(percent) || percent < 1 || percent > 99) {
        return { title: "Choisissez un acompte entre 1 et 99 %", detail: "Le montant à demander s’affichera ici." };
      }
      const deposit = (PREVIEW_AMOUNT * percent) / 100;
      return {
        title: `Le client paie ${euro(deposit)} en ligne`,
        detail: `Acompte de ${percent} % sur ${euro(PREVIEW_AMOUNT)}. Solde restant : ${euro(PREVIEW_AMOUNT - deposit)}.`,
      };
    }
    const cents = parseEurosToCents(depositEurosInput);
    if (cents === null) {
      return { title: "Indiquez un montant d’acompte", detail: "Le montant à demander s’affichera ici." };
    }
    const deposit = cents / 100;
    return {
      title: `Le client paie ${euro(Math.min(deposit, PREVIEW_AMOUNT))} en ligne`,
      detail:
        deposit >= PREVIEW_AMOUNT
          ? `Acompte fixe de ${euro(deposit)} : sur une course de ${euro(PREVIEW_AMOUNT)} ou moins, le montant complet est demandé.`
          : `Acompte fixe de ${euro(deposit)} sur ${euro(PREVIEW_AMOUNT)}. Solde restant : ${euro(PREVIEW_AMOUNT - deposit)}.`,
    };
  }, [paymentOnlineEnabled, paymentMode, depositUiKind, depositPercentInput, depositEurosInput]);

  /** Relit le VRAI état du compte (API Stripe) : jamais déduit de la redirection du navigateur. */
  const syncFromStripe = useCallback(async (): Promise<ProStripeOverviewData> => {
    const ov = await getStripeOverview();
    setOverview(ov);
    const st = ov.status;
    setStripeUi({
      stripeAccountId: st.stripeAccountId,
      chargesEnabled: st.chargesEnabled,
      payoutsEnabled: st.payoutsEnabled,
      detailsSubmitted: st.detailsSubmitted,
      onboardingStatus: st.onboardingStatus,
    });
    return ov;
  }, []);

  /** Retour d'onboarding (?stripe=return) ou lien expiré (?stripe=refresh). */
  async function handleStripeParams(): Promise<void> {
    const flag = new URLSearchParams(window.location.search).get("stripe");
    try {
      const ov = await syncFromStripe();
      if (flag === "return" || flag === "refresh") {
        window.history.replaceState(null, "", window.location.pathname);
      }
      if (flag === "return") {
        const ui = ov.status.uiStatus;
        if (ui === "ACTIVE") setReturnNotice({ tone: "success", text: "Stripe confirme que votre compte est actif : les paiements en ligne sont disponibles." });
        else if (ui === "VERIFICATION_NEEDED") setReturnNotice({ tone: "info", text: "Merci ! Stripe vérifie vos informations. Les paiements seront activés dès la validation." });
        else if (ui === "PAYOUTS_SUSPENDED") setReturnNotice({ tone: "warning", text: "Les paiements sont actifs mais les versements bancaires ne le sont pas encore. Vérifiez votre compte Stripe." });
        else setReturnNotice({ tone: "warning", text: "La configuration n’est pas terminée : Stripe attend encore des informations. Reprenez-la avec « Terminer la configuration »." });
      } else if (flag === "refresh") {
        // Lien d'onboarding expiré : on en génère un nouveau (compte existant réutilisé, jamais de doublon).
        await goToOnboarding();
      }
    } catch {
      // le statut mis en cache de /payment-settings reste affiché
    }
  }

  async function handleRefreshStatus(): Promise<void> {
    setStripeCardError("");
    setRefreshOk("");
    setRefreshBusy(true);
    try {
      const ov = await syncFromStripe();
      setRefreshOk(ov.statusSource === "stripe" ? "Statut mis à jour." : "Stripe est injoignable : dernier état connu affiché.");
    } catch (e) {
      setStripeCardError(errorMessage(e));
    } finally {
      setRefreshBusy(false);
    }
  }

  async function openExpressDashboard(): Promise<void> {
    setStripeCardError("");
    setLoginBusy(true);
    try {
      const { url } = await createStripeLoginLink();
      if (!isStripeUrl(url)) throw new Error("Lien Stripe inattendu.");
      window.location.assign(url);
    } catch (e) {
      setStripeCardError(errorMessage(e));
      setLoginBusy(false);
    }
  }

  async function goToOnboarding(): Promise<void> {
    setStripeCardError("");
    setStripeBusy(true);
    try {
      const { url } = await createStripeOnboardingLink();
      window.location.assign(url);
    } catch (e) {
      setStripeCardError(errorMessage(e));
      setStripeBusy(false);
    }
  }

  async function handleConnectStripe(): Promise<void> {
    setStripeCardError("");
    setStripeBusy(true);
    try {
      await connectStripe();
      const { url } = await createStripeOnboardingLink();
      window.location.assign(url);
    } catch (e) {
      setStripeCardError(errorMessage(e));
      setStripeBusy(false);
    }
  }

  function validatePaymentForm(): string | null {
    if (paymentMode === "FULL") return null;
    if (depositUiKind === "percent") {
      const n = Number.parseInt(depositPercentInput.trim(), 10);
      if (Number.isNaN(n) || n < 1 || n > 99) {
        return "Indiquez un pourcentage d’acompte entre 1 et 99.";
      }
      return null;
    }
    const cents = parseEurosToCents(depositEurosInput);
    if (cents === null) {
      return "Indiquez un montant d’acompte en euros (supérieur à 0).";
    }
    return null;
  }

  async function handleSavePaymentSettings(): Promise<void> {
    setSaveOk("");
    setFormError("");
    const v = validatePaymentForm();
    if (v) {
      setFormError(v);
      return;
    }

    let depositPercent: number | null = null;
    let depositFixedAmount: number | null = null;
    if (paymentMode === "DEPOSIT") {
      if (depositUiKind === "percent") {
        depositPercent = Number.parseInt(depositPercentInput.trim(), 10);
        depositFixedAmount = null;
      } else {
        depositPercent = null;
        depositFixedAmount = parseEurosToCents(depositEurosInput);
      }
    }

    setSaveBusy(true);
    try {
      await updatePaymentSettings({
        paymentOnlineEnabled,
        paymentMode,
        depositPercent: paymentMode === "FULL" ? null : depositPercent,
        depositFixedAmount: paymentMode === "FULL" ? null : depositFixedAmount,
        paymentCurrency: "eur",
      });
      setSavedSnapshot(currentSnapshot);
      setSaveOk("Réglages paiement sauvegardés.");
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSaveBusy(false);
    }
  }

  const ready = stripeUi ? isReadyToCharge(stripeUi) : false;
  const dashboardAvailable = overview?.status.dashboardAvailable ?? Boolean(stripeUi?.detailsSubmitted);

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Encaissements"
          title="Paiements Stripe"
          description="Vérifiez la connexion du compte et choisissez comment vos clients règlent leurs courses."
          action={
            <ProActionLink href="/pro/transactions" withArrow>
              Historique des transactions
            </ProActionLink>
          }
        />

        {loadState === "loading" ? (
          <ProPanel>
            <p className="text-sm text-[var(--pro-text-muted)]">Chargement des réglages…</p>
          </ProPanel>
        ) : null}

        {loadState === "error" ? <ProAlert tone="error">{loadError}</ProAlert> : null}

        {loadState === "ready" && stripeUi && stripeHeadline ? (
          <>
            <ProPanel>
              <ProSectionHeader
                level="panel"
                eyebrow="Stripe Connect"
                title="Recevoir les paiements"
                description="Consultez d’abord l’état du compte utilisé pour encaisser vos clients. Les paiements sont versés sur votre compte Stripe connecté."
              />
              {stripeCardError ? (
                <div className="mb-4">
                  <ProAlert tone="error">{stripeCardError}</ProAlert>
                </div>
              ) : null}
              {returnNotice ? (
                <div className="mb-4">
                  <ProAlert tone={returnNotice.tone}>{returnNotice.text}</ProAlert>
                </div>
              ) : null}

              <div className="rounded-[9px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-[21px]">
                <div className="flex flex-wrap items-start gap-3.5">
                  <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border pro-tone--${stripeHeadline.tone}`}>
                    <ProIcon name={stripeHeadline.tone === "ok" ? "check" : "alert"} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block text-xs font-bold text-[var(--pro-text-muted)]">État du compte</span>
                    <h3 className="mb-1 text-[19px] font-bold text-[var(--pro-text)]">{stripeHeadline.title}</h3>
                    <p className="text-[13px] leading-[1.45] text-[var(--pro-text-muted)]">{stripeHeadline.hint}</p>
                  </div>
                  <span className={`whitespace-nowrap rounded-full border px-[9px] py-[5px] text-xs font-extrabold pro-tone--${stripeHeadline.tone}`}>{stripeHeadline.badge}</span>
                </div>

                <div className="mt-[22px] grid gap-3 border-t border-[var(--pro-border)] pt-[19px] min-[521px]:grid-cols-2 min-[1051px]:grid-cols-4" aria-label="Vérifications Stripe">
                  <CheckItem ok={stripeUi.chargesEnabled} title="Paiements activés" okText="Oui" koText="Non" />
                  <CheckItem ok={stripeUi.payoutsEnabled} title="Versements bancaires" okText="Oui" koText="Non" />
                  <CheckItem ok={!(overview?.status.verificationNeeded ?? false) && stripeUi.detailsSubmitted} title="Vérification nécessaire" okText="Non" koText="Oui — à vérifier" />
                  <CheckItem ok={stripeUi.onboardingStatus === "COMPLETE"} title="Configuration Stripe" okText="Terminée" koText="À terminer" />
                </div>

                <details className="mt-[18px] border-t border-[var(--pro-border)] pt-4 text-xs text-[var(--pro-text-muted)]">
                  <summary className="cursor-pointer font-bold text-[var(--pro-accent)]">Voir le détail du statut</summary>
                  <p className="mt-[11px] leading-normal">
                    Statut d’onboarding : <span className="font-mono">{stripeUi.onboardingStatus}</span>
                  </p>
                  <p className="mt-1.5 break-all font-mono text-[11px]">Compte : {stripeUi.stripeAccountId ?? "—"}</p>
                  {overview?.status.requirements ? (
                    <p className="mt-1.5 leading-normal">
                      Informations attendues : {overview.status.requirements.currentlyDueCount} · en retard : {overview.status.requirements.pastDueCount} · en cours de vérification : {overview.status.requirements.pendingVerificationCount ?? 0}
                      {overview.status.requirements.disabledReason ? ` · motif Stripe : ${overview.status.requirements.disabledReason}` : ""}
                    </p>
                  ) : null}
                </details>
              </div>

              <div className="mt-[17px] flex flex-wrap items-center gap-3">
                <ProGhostButton onClick={() => void handleRefreshStatus()} disabled={refreshBusy}>
                  {refreshBusy ? "Actualisation…" : "Actualiser le statut"}
                </ProGhostButton>
                {!stripeUi.stripeAccountId ? (
                  <PrimaryButton disabled={stripeBusy} onClick={() => void handleConnectStripe()}>
                    Connecter mon compte Stripe
                    <ProIcon name="arrow" className="h-4 w-4" />
                  </PrimaryButton>
                ) : (
                  <>
                    {uiStatus !== "ACTIVE" ? (
                      <PrimaryButton disabled={stripeBusy} onClick={() => void goToOnboarding()}>
                        Terminer la configuration
                        <ProIcon name="arrow" className="h-4 w-4" />
                      </PrimaryButton>
                    ) : null}
                    {dashboardAvailable ? (
                      <PrimaryButton disabled={loginBusy} onClick={() => void openExpressDashboard()}>
                        {loginBusy ? "Ouverture…" : "Accéder à mon compte Stripe"}
                        <ProIcon name="arrow" className="h-4 w-4" />
                      </PrimaryButton>
                    ) : null}
                  </>
                )}
                <span role="status" aria-live="polite" className="text-xs text-[var(--pro-text-muted)]">
                  {refreshOk}
                </span>
              </div>
              {stripeUi.stripeAccountId && dashboardAvailable ? (
                <p className="mt-2.5 text-xs text-[var(--pro-text-muted)]">
                  « Accéder à mon compte Stripe » ouvre votre Dashboard Stripe Express (soldes, versements, remboursements, coordonnées bancaires) : vos informations bancaires se gèrent uniquement chez Stripe.
                </p>
              ) : null}
            </ProPanel>

            <ProPanel>
              <ProSectionHeader
                level="panel"
                eyebrow="Préférences"
                title="Paiement en ligne"
                description="Définissez ce que le client règle après l’acceptation de sa demande. Le lien de paiement est envoyé depuis une demande acceptée."
              />

              {!ready ? (
                <div className="mb-4">
                  <ProAlert tone="warning">
                    Vous pouvez préparer ces réglages, mais les paiements ne seront disponibles qu’une fois le compte Stripe prêt.
                  </ProAlert>
                </div>
              ) : null}
              {formError ? (
                <div className="mb-4">
                  <ProAlert tone="error">{formError}</ProAlert>
                </div>
              ) : null}

              <label className="flex cursor-pointer items-center justify-between gap-[18px] rounded-[9px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-[18px]">
                <span>
                  <strong className="mb-1 block text-[15px] text-[var(--pro-text)]">Activer le paiement en ligne</strong>
                  <small className="block text-xs leading-[1.45] text-[var(--pro-text-muted)]">Un lien de paiement pourra être envoyé depuis une demande acceptée.</small>
                </span>
                <Switch checked={paymentOnlineEnabled} onChange={setPaymentOnlineEnabled} label="Activer le paiement en ligne" />
              </label>

              <fieldset disabled={!paymentOnlineEnabled} className="mt-[21px] grid gap-2.5 border-0 p-0 disabled:opacity-50">
                <legend className="mb-2.5 text-sm font-bold text-[var(--pro-text)]">Montant demandé au client</legend>
                <label className={CHOICE}>
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={paymentMode === "FULL"}
                    onChange={() => setPaymentMode("FULL")}
                    className="mt-0.5 h-[17px] w-[17px] accent-[var(--pro-accent)]"
                  />
                  <span>
                    <strong className="mb-1 block text-sm text-[var(--pro-text)]">Paiement total</strong>
                    <small className="block text-xs leading-[1.45] text-[var(--pro-text-muted)]">Le client règle la totalité du montant après acceptation.</small>
                  </span>
                </label>
                <label className={CHOICE}>
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={paymentMode === "DEPOSIT"}
                    onChange={() => setPaymentMode("DEPOSIT")}
                    className="mt-0.5 h-[17px] w-[17px] accent-[var(--pro-accent)]"
                  />
                  <span>
                    <strong className="mb-1 block text-sm text-[var(--pro-text)]">Acompte</strong>
                    <small className="block text-xs leading-[1.45] text-[var(--pro-text-muted)]">Le client règle une partie du montant pour confirmer la course.</small>
                  </span>
                </label>

                {paymentMode === "DEPOSIT" ? (
                  <div className="ml-0 space-y-3.5 border-l-[3px] border-[var(--pro-accent)] bg-[var(--pro-panel-muted)] p-[15px] min-[521px]:ml-[29px]">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-bold text-[var(--pro-text)]">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="depositKind"
                          checked={depositUiKind === "percent"}
                          onChange={() => setDepositUiKind("percent")}
                          className="h-4 w-4 accent-[var(--pro-accent)]"
                        />
                        Pourcentage du montant
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="depositKind"
                          checked={depositUiKind === "fixed"}
                          onChange={() => setDepositUiKind("fixed")}
                          className="h-4 w-4 accent-[var(--pro-accent)]"
                        />
                        Montant fixe
                      </label>
                    </div>

                    {depositUiKind === "percent" ? (
                      <div>
                        <label htmlFor="deposit-percent" className="mb-2 block text-[13px] font-bold text-[var(--pro-text)]">
                          Pourcentage de l’acompte (1–99)
                        </label>
                        <div className="flex items-center gap-[9px]">
                          <input
                            id="deposit-percent"
                            type="number"
                            min={1}
                            max={99}
                            step={1}
                            inputMode="numeric"
                            className={`${proInputClass} !w-[92px]`}
                            value={depositPercentInput}
                            onChange={(ev) => setDepositPercentInput(ev.target.value)}
                          />
                          <span className="text-[var(--pro-text)]">%</span>
                        </div>
                        <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Le solde restera à régler selon votre processus habituel.</p>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="deposit-euros" className="mb-2 block text-[13px] font-bold text-[var(--pro-text)]">
                          Montant de l’acompte
                        </label>
                        <div className="flex items-center gap-[9px]">
                          <input
                            id="deposit-euros"
                            type="text"
                            inputMode="decimal"
                            placeholder="ex. 50,00"
                            className={`${proInputClass} !w-[132px]`}
                            value={depositEurosInput}
                            onChange={(ev) => setDepositEurosInput(ev.target.value)}
                          />
                          <span className="text-[var(--pro-text)]">€</span>
                        </div>
                        <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Le solde restera à régler selon votre processus habituel.</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </fieldset>

              <div aria-live="polite" className="mt-5 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-[19px] py-[17px]">
                <span className="mb-[7px] block text-xs text-[var(--pro-text-muted)]">Exemple pour une course de {euro(PREVIEW_AMOUNT)}</span>
                <strong className="block text-base text-[var(--pro-text)]">{preview.title}</strong>
                <p className="mt-[5px] text-xs text-[var(--pro-text-muted)]">{preview.detail}</p>
              </div>

              <div className="mt-[23px] flex flex-col items-stretch justify-between gap-[18px] border-t border-[var(--pro-border)] pt-5 min-[761px]:flex-row min-[761px]:items-end">
                <div>
                  <span className="mb-[3px] block text-xs text-[var(--pro-text-muted)]">Devise</span>
                  <strong className="text-sm text-[var(--pro-text)]">EUR · Euro</strong>
                </div>
                <div className="flex flex-col items-start gap-[13px] min-[521px]:flex-row min-[521px]:items-center min-[761px]:justify-end">
                  <span role="status" aria-live="polite" className="text-xs text-[var(--pro-text-muted)]">
                    {saveOk}
                  </span>
                  <PrimaryButton disabled={saveBusy || !dirty} onClick={() => void handleSavePaymentSettings()}>
                    {saveBusy ? "Enregistrement…" : "Enregistrer les réglages"}
                  </PrimaryButton>
                </div>
              </div>
            </ProPanel>

            <ProPanel>
              <ProSectionHeader
                level="panel"
                eyebrow="Activité"
                title="Derniers paiements et remboursements"
                description="Données de votre espace : aucun solde ni versement n’est affiché ici. Consultez votre Dashboard Stripe pour vos soldes."
              />
              <div className="grid gap-5 min-[1051px]:grid-cols-2">
                <div>
                  <h3 className="mb-2.5 text-sm font-bold text-[var(--pro-text)]">Derniers paiements</h3>
                  {overview?.recentPayments.length ? (
                    <ul className="divide-y divide-[var(--pro-border)] rounded-lg border border-[var(--pro-border)]">
                      {overview.recentPayments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3 px-3.5 py-3 text-[13px]">
                          <div className="min-w-0">
                            <strong className="block truncate text-[var(--pro-text)]">{p.clientName || "Client"}</strong>
                            <span className="text-xs text-[var(--pro-text-muted)]">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("fr-FR") : "—"}</span>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <strong className="tabular-nums">{euro(p.amount / 100)}</strong>
                            <span className={leadPaymentStatusBadgeClass(p.status)}>{labelLeadPaymentStatus(p.status)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-[var(--pro-text-muted)]">Aucun paiement encaissé pour le moment.</p>
                  )}
                </div>
                <div>
                  <h3 className="mb-2.5 text-sm font-bold text-[var(--pro-text)]">Derniers remboursements</h3>
                  {overview?.recentRefunds.length ? (
                    <ul className="divide-y divide-[var(--pro-border)] rounded-lg border border-[var(--pro-border)]">
                      {overview.recentRefunds.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 px-3.5 py-3 text-[13px]">
                          <div className="min-w-0">
                            <strong className="block truncate text-[var(--pro-text)]">{r.clientName || "Client"}</strong>
                            <span className="text-xs text-[var(--pro-text-muted)]">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <strong className="tabular-nums">{euro(r.amount / 100)}</strong>
                            <span className={refundStatusBadgeClass(r.status)}>{labelRefundStatus(r.status)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-[var(--pro-text-muted)]">Aucun remboursement.</p>
                  )}
                </div>
              </div>
            </ProPanel>

            <CancellationPolicyPanel />
          </>
        ) : null}
      </div>
    </ProGuard>
  );
}
