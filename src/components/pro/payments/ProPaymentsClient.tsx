"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { mapApiErrorToFr } from "@/components/pro/proDisplay";
import { ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import {
  type ProPaymentSettingsData,
  type ProStripeSnapshot,
  ProPaymentsApiError,
  connectStripe,
  createStripeOnboardingLink,
  getPaymentSettings,
  getStripeStatus,
  updatePaymentSettings,
} from "@/lib/proPaymentsClient";

type DepositUiKind = "percent" | "fixed";

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

function headlineForStripe(stripe: ProStripeSnapshot): { title: string; hint: string } {
  if (!stripe.stripeAccountId) {
    return {
      title: "Non connecté",
      hint: "Aucun compte Stripe n’est encore associé à votre espace.",
    };
  }
  if (stripe.onboardingStatus === "RESTRICTED") {
    return {
      title: "Restreint / action requise",
      hint: "Stripe signale des informations à compléter ou un problème de conformité.",
    };
  }
  if (isReadyToCharge(stripe)) {
    return {
      title: "Prêt à encaisser",
      hint: "Votre compte peut recevoir des paiements par carte.",
    };
  }
  return {
    title: "Connexion à terminer",
    hint: "Finalisez l’onboarding Stripe pour activer les encaissements.",
  };
}

function errorMessage(e: unknown): string {
  if (e instanceof ProPaymentsApiError) {
    if (e.code === "STRIPE_NOT_CONFIGURED") {
      return "La plateforme n’a pas encore configuré Stripe (clés ou secrets serveur manquants). Impossible d’utiliser Connect depuis cet espace : contactez l’administrateur technique.";
    }
    if (e.code === "STRIPE_CONNECT_URLS_NOT_CONFIGURED") {
      return "Les URLs de retour Stripe Connect ne sont pas configurées côté serveur.";
    }
    return e.message || "Erreur API";
  }
  return mapApiErrorToFr((e as Error).message);
}

const btnPrimary =
  "rounded-xl border border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-accent)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)] disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-medium text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)] disabled:cursor-not-allowed disabled:opacity-50";

export function ProPaymentsClient() {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");

  const [stripeUi, setStripeUi] = useState<ProStripeSnapshot | null>(null);

  const [paymentOnlineEnabled, setPaymentOnlineEnabled] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"FULL" | "DEPOSIT">("FULL");
  const [depositUiKind, setDepositUiKind] = useState<DepositUiKind>("percent");
  const [depositPercentInput, setDepositPercentInput] = useState("");
  const [depositEurosInput, setDepositEurosInput] = useState("");

  const [stripeBusy, setStripeBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveOk, setSaveOk] = useState("");
  const [formError, setFormError] = useState("");
  const [stripeCardError, setStripeCardError] = useState("");

  const applySettings = useCallback((data: ProPaymentSettingsData) => {
    setStripeUi(data.stripe);
    setPaymentOnlineEnabled(data.paymentOnlineEnabled);
    setPaymentMode(data.paymentMode);
    if (data.paymentMode === "DEPOSIT") {
      if (data.depositPercent != null) {
        setDepositUiKind("percent");
        setDepositPercentInput(String(data.depositPercent));
        setDepositEurosInput("");
      } else if (data.depositFixedAmount != null) {
        setDepositUiKind("fixed");
        setDepositEurosInput(centsToEurosInput(data.depositFixedAmount));
        setDepositPercentInput("");
      } else {
        setDepositUiKind("percent");
        setDepositPercentInput("");
        setDepositEurosInput("");
      }
    } else {
      setDepositPercentInput("");
      setDepositEurosInput("");
    }
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

  const stripeHeadline = useMemo(
    () => (stripeUi ? headlineForStripe(stripeUi) : null),
    [stripeUi]
  );

  async function handleRefreshStatus(): Promise<void> {
    setStripeCardError("");
    setRefreshBusy(true);
    try {
      const status = await getStripeStatus();
      setStripeUi({
        stripeAccountId: status.stripeAccountId,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        detailsSubmitted: status.detailsSubmitted,
        onboardingStatus: status.onboardingStatus,
      });
    } catch (e) {
      setStripeCardError(errorMessage(e));
    } finally {
      setRefreshBusy(false);
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
      setSaveOk("Réglages paiement sauvegardés.");
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSaveBusy(false);
    }
  }

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            eyebrow="Encaissements"
            title="Paiements Stripe"
            description="Connectez votre compte Stripe et configurez le paiement en ligne pour vos clients."
            action={
              <Link
                href="/pro/transactions"
                className="inline-flex rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--pro-accent)] hover:bg-[var(--pro-accent-soft)]"
              >
                Historique des transactions
              </Link>
            }
          />
        </ProPanel>

        {loadState === "loading" ? (
          <ProPanel>
            <p className="text-sm text-[var(--pro-text-muted)]">Chargement des réglages…</p>
          </ProPanel>
        ) : null}

        {loadState === "error" ? (
          <ProPanel>
            <p className="text-sm text-rose-600">{loadError}</p>
          </ProPanel>
        ) : null}

        {loadState === "ready" && stripeUi && stripeHeadline ? (
          <>
            <ProPanel>
              <ProSectionHeader
                eyebrow="Stripe Connect"
                title="Recevoir les paiements"
                description="Connectez votre compte Stripe pour recevoir les paiements de vos clients directement sur votre compte."
              />
              <div className="mt-5 space-y-4 text-sm text-[var(--pro-text-muted)]">
                <p>
                  Les clients paient via Stripe. Les paiements sont versés sur votre compte Stripe connecté.
                </p>
                {stripeCardError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">{stripeCardError}</p>
                ) : null}

                <div className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pro-accent)]">Statut</p>
                    {isReadyToCharge(stripeUi) ? (
                      <span className="inline-flex rounded-full border border-emerald-400 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                        Prêt à encaisser
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-[var(--pro-text)]">{stripeHeadline.title}</p>
                  <p className="mt-1 text-sm text-[var(--pro-text-muted)]">{stripeHeadline.hint}</p>
                  <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-[var(--pro-text-soft)]">Paiements par carte</dt>
                      <dd className="font-medium text-[var(--pro-text)]">{stripeUi.chargesEnabled ? "Oui" : "Non"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--pro-text-soft)]">Virements vers banque</dt>
                      <dd className="font-medium text-[var(--pro-text)]">{stripeUi.payoutsEnabled ? "Oui" : "Non"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--pro-text-soft)]">Informations soumises</dt>
                      <dd className="font-medium text-[var(--pro-text)]">{stripeUi.detailsSubmitted ? "Oui" : "Non"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--pro-text-soft)]">Onboarding Stripe</dt>
                      <dd className="font-medium text-[var(--pro-text)]">{stripeUi.onboardingStatus}</dd>
                    </div>
                  </dl>
                  <details className="mt-4 text-xs text-[var(--pro-text-soft)]">
                    <summary className="cursor-pointer select-none text-[var(--pro-text-muted)]">Détail technique</summary>
                    <p className="mt-2 break-all font-mono text-[11px] text-[var(--pro-text-soft)]">
                      {stripeUi.stripeAccountId ?? "—"}
                    </p>
                  </details>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!stripeUi.stripeAccountId ? (
                    <button type="button" className={btnPrimary} disabled={stripeBusy} onClick={() => void handleConnectStripe()}>
                      Connecter Stripe
                    </button>
                  ) : !isReadyToCharge(stripeUi) ? (
                    <button type="button" className={btnPrimary} disabled={stripeBusy} onClick={() => void goToOnboarding()}>
                      Reprendre l’onboarding
                    </button>
                  ) : null}
                  <button type="button" className={btnSecondary} disabled={refreshBusy} onClick={() => void handleRefreshStatus()}>
                    {refreshBusy ? "Actualisation…" : "Actualiser le statut"}
                  </button>
                </div>
                <p className="text-xs text-[var(--pro-text-soft)]">
                  L’actualisation interroge Stripe et met à jour l’état affiché ici (peut prendre quelques secondes).
                </p>
              </div>
            </ProPanel>

            <ProPanel>
              <ProSectionHeader
                eyebrow="Préférences"
                title="Paiement en ligne"
                description="Choisissez comment vos clients pourront payer après acceptation d’une demande."
              />
              <div className="mt-5 space-y-5 text-sm text-[var(--pro-text-muted)]">
                <p>Le lien de paiement sera envoyé depuis une demande acceptée.</p>
                <p>Paiement total : le client règle le montant complet après acceptation.</p>
                <p>Acompte : le client règle seulement une partie pour confirmer la réservation.</p>

                {saveOk ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">{saveOk}</p>
                ) : null}
                {formError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">{formError}</p>
                ) : null}

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--pro-border)]"
                    checked={paymentOnlineEnabled}
                    onChange={(ev) => setPaymentOnlineEnabled(ev.target.checked)}
                  />
                  <span className="text-[var(--pro-text)]">Paiement en ligne activé</span>
                </label>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-[var(--pro-text)]">Mode de paiement</legend>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "FULL"}
                      onChange={() => setPaymentMode("FULL")}
                    />
                    Paiement total
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "DEPOSIT"}
                      onChange={() => setPaymentMode("DEPOSIT")}
                    />
                    Acompte
                  </label>
                </fieldset>

                {paymentMode === "DEPOSIT" ? (
                  <div className="space-y-4 rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                    <p className="text-sm font-medium text-[var(--pro-text)]">Type d’acompte</p>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="depositKind"
                        checked={depositUiKind === "percent"}
                        onChange={() => setDepositUiKind("percent")}
                      />
                      Pourcentage du montant
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="depositKind"
                        checked={depositUiKind === "fixed"}
                        onChange={() => setDepositUiKind("fixed")}
                      />
                      Montant fixe
                    </label>

                    {depositUiKind === "percent" ? (
                      <div>
                        <label className="block text-xs font-medium text-[var(--pro-text-soft)]">Pourcentage (1–99)</label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          className="mt-1 w-full max-w-xs rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2 text-[var(--pro-text)]"
                          value={depositPercentInput}
                          onChange={(ev) => setDepositPercentInput(ev.target.value)}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-[var(--pro-text-soft)]">Montant (EUR)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="ex. 50,00"
                          className="mt-1 w-full max-w-xs rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2 text-[var(--pro-text)]"
                          value={depositEurosInput}
                          onChange={(ev) => setDepositEurosInput(ev.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-medium text-[var(--pro-text-soft)]">Devise</label>
                  <p className="mt-1 text-base font-medium text-[var(--pro-text)]">EUR</p>
                </div>

                <button type="button" className={btnPrimary} disabled={saveBusy} onClick={() => void handleSavePaymentSettings()}>
                  {saveBusy ? "Enregistrement…" : "Enregistrer les réglages"}
                </button>
              </div>
            </ProPanel>
          </>
        ) : null}
      </ProShell>
    </ProGuard>
  );
}
