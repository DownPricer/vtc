"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProAlert, proInputClass } from "@/components/pro/ProUi";
import { ProPaymentsApiError } from "@/lib/proPaymentsClient";
import {
  REFUND_REASON_OPTIONS,
  createRefund,
  getRefundPreview,
  mapRefundErrorToFr,
  newClientRequestId,
  type CreateRefundResult,
  type ProRefundPreview,
} from "@/lib/proRefundsClient";
import { shouldPreserveClientRequestId } from "@/lib/preserveRefundClientRequestId";
import { ModalPrimaryButton, ModalSecondaryButton, ProModal, SummaryLine, formatCents, parseEurosToCents } from "./ProModal";

type Phase = "form" | "done";

/**
 * Fenêtre de remboursement : récapitulatif chiffré lu côté serveur, confirmation explicite,
 * résultat réel (confirmé / en cours / échec). Un même `clientRequestId` est conservé tant que la fenêtre
 * reste ouverte : double clic ou nouvel essai après erreur réseau ne peuvent pas rembourser deux fois.
 */
export function RefundDialog({
  open,
  paymentId,
  clientName,
  initialMode,
  onClose,
  onDone,
}: {
  open: boolean;
  paymentId: string;
  clientName?: string;
  initialMode: "full" | "partial";
  onClose: () => void;
  /** Appelé après une opération terminée pour rafraîchir la liste / la fiche. */
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"full" | "partial">(initialMode);
  const [amountInput, setAmountInput] = useState("");
  const [reason, setReason] = useState("driver_cancelled");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<ProRefundPreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [result, setResult] = useState<CreateRefundResult | null>(null);
  const requestId = useRef(newClientRequestId());
  const changedRef = useRef(false);

  const refundableCents = preview?.refundableCents ?? 0;
  const amountCents = useMemo(() => {
    if (mode === "full") return refundableCents;
    return parseEurosToCents(amountInput);
  }, [mode, amountInput, refundableCents]);

  // Ouverture : nouvelle intention, réinitialisation, chargement du récapitulatif serveur.
  useEffect(() => {
    if (!open) return;
    requestId.current = newClientRequestId();
    changedRef.current = false;
    setMode(initialMode);
    setAmountInput("");
    setReason("driver_cancelled");
    setNote("");
    setPhase("form");
    setResult(null);
    setFormError("");
    setLoadError("");
    setPreview(null);
    getRefundPreview(paymentId)
      .then(setPreview)
      .catch((e) => setLoadError(mapRefundErrorToFr(e)));
  }, [open, paymentId, initialMode]);

  // Récapitulatif recalculé côté serveur quand le montant partiel change (commission proportionnelle réelle).
  useEffect(() => {
    if (!open || phase !== "form" || !preview) return;
    if (mode === "full") {
      if (preview.requestedCents !== preview.refundableCents) {
        getRefundPreview(paymentId).then(setPreview).catch(() => undefined);
      }
      return;
    }
    if (!amountCents || amountCents > refundableCents) return;
    const t = window.setTimeout(() => {
      getRefundPreview(paymentId, amountCents).then(setPreview).catch(() => undefined);
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, amountCents, open, phase, paymentId]);

  const close = useCallback(() => {
    if (changedRef.current) onDone();
    onClose();
  }, [onClose, onDone]);

  const amountError =
    mode === "partial" && amountInput.trim() !== ""
      ? amountCents === null
        ? "Montant invalide (ex. 40 ou 40,50)."
        : amountCents > refundableCents
          ? `Maximum remboursable : ${formatCents(refundableCents, preview?.currency)}.`
          : ""
      : "";

  const canConfirm = Boolean(preview) && refundableCents > 0 && !busy && amountCents !== null && amountCents >= 1 && amountCents <= refundableCents;

  async function confirm(): Promise<void> {
    if (!canConfirm || !amountCents) return;
    setBusy(true);
    setFormError("");
    try {
      const res = await createRefund(paymentId, {
        full: mode === "full",
        amountCents: mode === "partial" ? amountCents : undefined,
        reason,
        note,
        clientRequestId: requestId.current,
      });
      changedRef.current = true;
      setResult(res);
      setPhase("done");
      onDone();
    } catch (e) {
      // Échec définitif : nouvelle intention possible. Résultat incertain : on garde le même identifiant.
      if (e instanceof ProPaymentsApiError && !shouldPreserveClientRequestId(e.code)) {
        requestId.current = newClientRequestId();
        changedRef.current = true;
      }
      setFormError(mapRefundErrorToFr(e));
    } finally {
      setBusy(false);
    }
  }

  const cur = preview?.currency;
  // Les chiffres de commission viennent du serveur : tant qu'ils ne correspondent pas au montant saisi, on n'affiche pas de valeur périmée.
  const previewFresh = Boolean(preview) && amountCents !== null && preview?.requestedCents === Math.min(amountCents, refundableCents);

  return (
    <ProModal
      open={open}
      title={phase === "done" ? "Remboursement enregistré" : "Rembourser ce client"}
      description={phase === "done" ? undefined : `Vous allez rembourser ${clientName ? clientName : "ce client"}. Cette action est irréversible.`}
      onClose={close}
      busy={busy}
      footer={
        phase === "done" ? (
          <ModalPrimaryButton onClick={close}>Fermer</ModalPrimaryButton>
        ) : (
          <>
            <ModalSecondaryButton onClick={close} disabled={busy}>
              Annuler
            </ModalSecondaryButton>
            <ModalPrimaryButton onClick={() => void confirm()} disabled={!canConfirm} danger>
              {busy ? "Remboursement en cours…" : "Confirmer le remboursement"}
            </ModalPrimaryButton>
          </>
        )
      }
    >
      {loadError ? <ProAlert tone="error">{loadError}</ProAlert> : null}
      {!preview && !loadError ? <p className="text-sm text-[var(--pro-text-muted)]">Chargement du paiement…</p> : null}

      {preview && phase === "form" ? (
        <>
          {refundableCents <= 0 ? (
            <ProAlert tone="warning">
              {preview.inFlightCents > 0
                ? "Un remboursement est déjà en cours : attendez sa confirmation par Stripe."
                : "Ce paiement est déjà entièrement remboursé."}
            </ProAlert>
          ) : null}

          <fieldset className="grid gap-2.5 border-0 p-0" disabled={refundableCents <= 0 || busy}>
            <legend className="mb-2 text-sm font-bold">Montant à rembourser</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-3.5 has-[:checked]:border-[var(--pro-accent)] has-[:checked]:bg-[var(--pro-accent-soft)]">
              <input type="radio" name="refund-mode" checked={mode === "full"} onChange={() => setMode("full")} className="mt-0.5 h-4 w-4 accent-[var(--pro-accent)]" />
              <span>
                <strong className="block text-sm">Remboursement intégral</strong>
                <small className="text-xs text-[var(--pro-text-muted)]">{formatCents(refundableCents, cur)} restant remboursable</small>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-3.5 has-[:checked]:border-[var(--pro-accent)] has-[:checked]:bg-[var(--pro-accent-soft)]">
              <input type="radio" name="refund-mode" checked={mode === "partial"} onChange={() => setMode("partial")} className="mt-0.5 h-4 w-4 accent-[var(--pro-accent)]" />
              <span className="flex-1">
                <strong className="block text-sm">Remboursement partiel</strong>
                <small className="text-xs text-[var(--pro-text-muted)]">Plusieurs remboursements partiels possibles, dans la limite du montant payé.</small>
                {mode === "partial" ? (
                  <span className="mt-2.5 flex items-center gap-2">
                    <input
                      aria-label="Montant à rembourser en euros"
                      inputMode="decimal"
                      placeholder="ex. 40,00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className={`${proInputClass} !w-[140px]`}
                    />
                    <span>€</span>
                  </span>
                ) : null}
                {amountError ? (
                  <span role="alert" className="mt-1.5 block text-xs text-[var(--pro-danger-title)]">
                    {amountError}
                  </span>
                ) : null}
              </span>
            </label>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[13px] font-bold">Motif du remboursement</span>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${proInputClass} mt-2`} disabled={busy}>
                {REFUND_REASON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[13px] font-bold">Précision (facultatif)</span>
              <input value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} className={`${proInputClass} mt-2`} disabled={busy} placeholder="Visible dans l'historique" />
            </label>
          </div>

          <div className="rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2" aria-live="polite">
            <SummaryLine label="Montant payé" value={formatCents(preview.paidCents, cur)} />
            {preview.refundedCents > 0 ? <SummaryLine label="Déjà remboursé" value={formatCents(preview.refundedCents, cur)} /> : null}
            <div className="my-1 border-t border-[var(--pro-border)]" />
            <SummaryLine label="Le client reçoit" value={formatCents(amountCents && amountCents <= refundableCents ? amountCents : 0, cur)} strong />
            <SummaryLine
              label="Commission plateforme restituée"
              value={amountCents && amountCents <= refundableCents ? (previewFresh ? formatCents(preview.platformFeeRefundCents, cur) : "…") : formatCents(0, cur)}
              hint="Remise sur votre compte Stripe, proportionnelle au montant remboursé."
            />
            <SummaryLine
              label="Impact estimé sur votre compte Stripe"
              value={amountCents && amountCents <= refundableCents ? (previewFresh ? `− ${formatCents(preview.driverNetDebitCents, cur)}` : "…") : `− ${formatCents(0, cur)}`}
              hint="Montant remboursé moins la commission plateforme restituée."
            />
          </div>
          <p className="text-xs leading-[1.5] text-[var(--pro-text-muted)]">
            Les frais de traitement Stripe prélevés à l’encaissement ne sont en général pas restitués par Stripe : ils restent à la charge de votre compte.
          </p>
          {formError ? <ProAlert tone="error">{formError}</ProAlert> : null}
        </>
      ) : null}

      {phase === "done" && result ? (
        <div className="space-y-3">
          {result.confirmed ? (
            <ProAlert tone="success">
              Stripe a confirmé le remboursement de <strong>{formatCents(result.amount, result.currency)}</strong>. Le client est prévenu par e-mail.
            </ProAlert>
          ) : result.status === "FAILED" ? (
            <ProAlert tone="error">Stripe n’a pas pu effectuer ce remboursement. Aucune somme n’a été restituée.</ProAlert>
          ) : (
            <ProAlert tone="info">
              Remboursement de <strong>{formatCents(result.amount, result.currency)}</strong> <strong>en cours</strong> : il n’est pas encore confirmé par Stripe. Le statut sera mis à jour automatiquement.
            </ProAlert>
          )}
          {result.deduplicated ? <p className="text-xs text-[var(--pro-text-muted)]">Cette demande avait déjà été enregistrée : aucun second remboursement n’a été créé.</p> : null}
        </div>
      ) : null}
    </ProModal>
  );
}
