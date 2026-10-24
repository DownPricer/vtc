"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProAlert, proInputClass } from "@/components/pro/ProUi";
import { ProPaymentsApiError } from "@/lib/proPaymentsClient";
import { labelLeadPaymentStatus, isRefundablePaymentStatus } from "@/lib/leadPaymentStatusUi";
import {
  cancelBookingRequest,
  getCancelPreview,
  getRefundPreview,
  mapRefundErrorToFr,
  newClientRequestId,
  resolveCancellationRequestApi,
  type CancelPreview,
  type CancelResult,
  type RefundPlan,
} from "@/lib/proRefundsClient";
import { ModalPrimaryButton, ModalSecondaryButton, ProModal, SummaryLine, formatCents, parseEurosToCents } from "./ProModal";

type RefundChoice = "none" | "full" | "partial";

/**
 * Annulation d'une réservation par le chauffeur, ou acceptation d'une demande d'annulation du client.
 * Aucun remboursement n'est déclenché sans case de confirmation explicite et récapitulatif chiffré.
 */
export function CancelBookingDialog({
  open,
  leadId,
  clientName,
  acceptRequestReason,
  onClose,
  onDone,
}: {
  open: boolean;
  leadId: string;
  clientName?: string;
  /** Renseigné quand on accepte une demande d'annulation du client (motif du client). */
  acceptRequestReason?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const accepting = acceptRequestReason !== undefined;
  const [preview, setPreview] = useState<CancelPreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reason, setReason] = useState("");
  const [choice, setChoice] = useState<RefundChoice>("none");
  const [amountInput, setAmountInput] = useState("");
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CancelResult | null>(null);
  const requestId = useRef(newClientRequestId());
  const changedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    requestId.current = newClientRequestId();
    changedRef.current = false;
    setReason(accepting ? acceptRequestReason ?? "" : "");
    setChoice("none");
    setAmountInput("");
    setConfirmRefund(false);
    setNotify(true);
    setError("");
    setResult(null);
    setPreview(null);
    setLoadError("");
    getCancelPreview(leadId)
      .then((p) => {
        setPreview(p);
        // Réservation payée annulée par le chauffeur : on PROPOSE 100 % (jamais appliqué sans confirmation).
        if (!accepting && p.payment && isRefundablePaymentStatus(p.payment.status) && p.payment.refund.refundableCents > 0) {
          setChoice("full");
        }
      })
      .catch((e) => setLoadError(mapRefundErrorToFr(e)));
  }, [open, leadId, accepting, acceptRequestReason]);

  const refund = preview?.payment?.refund ?? null;
  const canRefund = Boolean(preview?.payment && isRefundablePaymentStatus(preview.payment.status) && (refund?.refundableCents ?? 0) > 0);
  const partialCents = useMemo(() => parseEurosToCents(amountInput), [amountInput]);

  const refundCents = choice === "full" ? refund?.refundableCents ?? 0 : choice === "partial" ? partialCents ?? 0 : 0;
  const partialInvalid = choice === "partial" && (partialCents === null || partialCents > (refund?.refundableCents ?? 0));

  // Récapitulatif de commission pour le montant choisi (calcul serveur, proportionnel et réel).
  const [feePreview, setFeePreview] = useState<{ fee: number; net: number } | null>(null);
  useEffect(() => {
    setFeePreview(null);
    if (!open || !preview?.payment || choice === "none" || refundCents < 1 || partialInvalid) return;
    if (choice === "full" && refund) {
      setFeePreview({ fee: refund.platformFeeRefundCents, net: refund.driverNetDebitCents });
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const p = await getRefundPreview(preview.payment!.id, refundCents);
        setFeePreview({ fee: p.platformFeeRefundCents, net: p.driverNetDebitCents });
      } catch {
        setFeePreview(null);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [open, preview, choice, refundCents, partialInvalid, refund]);

  const close = useCallback(() => {
    if (changedRef.current) onDone();
    onClose();
  }, [onClose, onDone]);

  const needsConfirm = choice !== "none";
  const reasonOk = reason.trim().length >= 3;
  const canSubmit =
    Boolean(preview?.cancellable) && reasonOk && !busy && !partialInvalid && (!needsConfirm || (confirmRefund && refundCents >= 1));

  async function submit(): Promise<void> {
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    const plan: RefundPlan =
      choice === "full" ? { mode: "full" } : choice === "partial" ? { mode: "partial", amountCents: refundCents } : { mode: "none" };
    try {
      const res = accepting
        ? await resolveCancellationRequestApi(leadId, {
            decision: "accept",
            refund: plan,
            refundConfirmed: needsConfirm && confirmRefund,
            clientRequestId: requestId.current,
            note: reason.trim() === acceptRequestReason ? undefined : reason.trim(),
            notifyCustomer: notify,
          })
        : await cancelBookingRequest(leadId, {
            reason: reason.trim(),
            refund: plan,
            refundConfirmed: needsConfirm && confirmRefund,
            clientRequestId: requestId.current,
            notifyCustomer: notify,
          });
      changedRef.current = true;
      setResult(res);
      onDone();
    } catch (e) {
      if (e instanceof ProPaymentsApiError && e.code !== "STRIPE_UNCERTAIN" && e.code !== "STRIPE_UNREACHABLE") {
        requestId.current = newClientRequestId();
      }
      setError(mapRefundErrorToFr(e));
    } finally {
      setBusy(false);
    }
  }

  const cur = refund?.currency;

  return (
    <ProModal
      open={open}
      title={result ? "Réservation annulée" : accepting ? "Accepter l’annulation" : "Annuler la réservation"}
      description={
        result
          ? undefined
          : `${clientName ? `${clientName} · ` : ""}Le client sera prévenu par e-mail. Le remboursement est une étape distincte, à confirmer explicitement.`
      }
      onClose={close}
      busy={busy}
      footer={
        result ? (
          <ModalPrimaryButton onClick={close}>Fermer</ModalPrimaryButton>
        ) : (
          <>
            <ModalSecondaryButton onClick={close} disabled={busy}>
              Retour
            </ModalSecondaryButton>
            <ModalPrimaryButton onClick={() => void submit()} disabled={!canSubmit} danger>
              {busy ? "Traitement…" : needsConfirm ? "Annuler et rembourser" : "Confirmer l’annulation"}
            </ModalPrimaryButton>
          </>
        )
      }
    >
      {loadError ? <ProAlert tone="error">{loadError}</ProAlert> : null}
      {!preview && !loadError ? <p className="text-sm text-[var(--pro-text-muted)]">Chargement…</p> : null}

      {preview && !result ? (
        <>
          {!preview.cancellable ? <ProAlert tone="warning">Cette réservation ne peut plus être annulée dans son état actuel.</ProAlert> : null}

          <div className="rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2">
            <SummaryLine label="Statut du paiement" value={labelLeadPaymentStatus(preview.paymentStatus)} />
            {refund ? (
              <>
                <SummaryLine label="Montant payé" value={formatCents(refund.paidCents, cur)} />
                {refund.refundedCents > 0 ? <SummaryLine label="Déjà remboursé" value={formatCents(refund.refundedCents, cur)} /> : null}
                <SummaryLine label="Montant remboursable" value={formatCents(refund.refundableCents, cur)} strong />
              </>
            ) : (
              <p className="py-2 text-[13px] text-[var(--pro-text-muted)]">Aucun paiement encaissé : aucun remboursement n’est nécessaire.</p>
            )}
            {preview.hasOpenPaymentLink ? (
              <p className="border-t border-[var(--pro-border)] py-2 text-xs text-[var(--pro-text-muted)]">
                Le lien de paiement en attente sera désactivé (session Stripe expirée) pour éviter tout paiement après annulation.
              </p>
            ) : null}
          </div>

          <label className="block">
            <span className="block text-[13px] font-bold">{accepting ? "Motif de la demande (client)" : "Motif de l’annulation"}</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={busy}
              placeholder="Ex. véhicule indisponible, demande du client…"
              className={`${proInputClass} mt-2`}
            />
          </label>

          {canRefund ? (
            <fieldset className="grid gap-2.5 border-0 p-0" disabled={busy}>
              <legend className="mb-1 text-sm font-bold">Remboursement du client</legend>
              {(
                [
                  ["full", "Remboursement intégral", `${formatCents(refund?.refundableCents ?? 0, cur)} — recommandé si vous ne pouvez plus assurer la course`],
                  ["partial", "Remboursement partiel", "Vous choisissez le montant"],
                  ["none", "Aucun remboursement pour l’instant", "L’annulation n’entraîne pas de remboursement automatique ; vous pourrez rembourser plus tard"],
                ] as Array<[RefundChoice, string, string]>
              ).map(([value, title, hint]) => (
                <label key={value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-3.5 has-[:checked]:border-[var(--pro-accent)] has-[:checked]:bg-[var(--pro-accent-soft)]">
                  <input
                    type="radio"
                    name="cancel-refund"
                    checked={choice === value}
                    onChange={() => {
                      setChoice(value);
                      setConfirmRefund(false);
                    }}
                    className="mt-0.5 h-4 w-4 accent-[var(--pro-accent)]"
                  />
                  <span className="flex-1">
                    <strong className="block text-sm">{title}</strong>
                    <small className="text-xs text-[var(--pro-text-muted)]">{hint}</small>
                    {value === "partial" && choice === "partial" ? (
                      <span className="mt-2.5 flex items-center gap-2">
                        <input
                          aria-label="Montant partiel en euros"
                          inputMode="decimal"
                          placeholder="ex. 40,00"
                          value={amountInput}
                          onChange={(e) => {
                            setAmountInput(e.target.value);
                            setConfirmRefund(false);
                          }}
                          className={`${proInputClass} !w-[140px]`}
                        />
                        <span>€</span>
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {needsConfirm && !partialInvalid && refundCents > 0 ? (
            <div className="space-y-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3" aria-live="polite">
              <SummaryLine label="Le client reçoit" value={formatCents(refundCents, cur)} strong />
              <SummaryLine
                label="Commission plateforme restituée"
                value={feePreview ? formatCents(feePreview.fee, cur) : "…"}
                hint="Proportionnelle au montant remboursé, remise sur votre compte Stripe."
              />
              <SummaryLine
                label="Impact estimé sur votre compte Stripe"
                value={feePreview ? `− ${formatCents(feePreview.net, cur)}` : "…"}
                hint="Les frais de traitement Stripe de l’encaissement ne sont en général pas restitués."
              />
              <label className="flex cursor-pointer items-start gap-3 border-t border-[var(--pro-border)] pt-3 text-[13px]">
                <input type="checkbox" checked={confirmRefund} onChange={(e) => setConfirmRefund(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--pro-accent)]" />
                <span className="font-bold">Je confirme le remboursement de {formatCents(refundCents, cur)} au client.</span>
              </label>
            </div>
          ) : null}

          <label className="flex cursor-pointer items-center gap-3 text-[13px]">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 accent-[var(--pro-accent)]" disabled={busy} />
            Prévenir le client par e-mail
          </label>

          {error ? <ProAlert tone="error">{error}</ProAlert> : null}
        </>
      ) : null}

      {result ? (
        <div className="space-y-3">
          <ProAlert tone="success">
            La réservation est annulée{result.unpaidPaymentsCancelled ? " et le lien de paiement a été désactivé" : ""}.
          </ProAlert>
          {result.refund ? (
            result.refund.confirmed ? (
              <ProAlert tone="success">
                Stripe a confirmé le remboursement de <strong>{formatCents(result.refund.amount, result.refund.currency)}</strong>.
              </ProAlert>
            ) : (
              <ProAlert tone="info">
                Remboursement de <strong>{formatCents(result.refund.amount, result.refund.currency)}</strong> <strong>en cours</strong> — pas encore confirmé par Stripe. Le statut se mettra à jour automatiquement.
              </ProAlert>
            )
          ) : result.refundUncertain ? (
            <ProAlert tone="warning">
              Le résultat du remboursement est en cours de vérification chez Stripe. Ouvrez la fiche du paiement pour suivre son état avant tout nouvel essai.
            </ProAlert>
          ) : (
            <p className="text-[13px] text-[var(--pro-text-muted)]">Aucun remboursement n’a été déclenché. Vous pouvez rembourser plus tard depuis les transactions.</p>
          )}
          {result.customerMailSent === false ? <p className="text-xs text-[var(--pro-text-muted)]">L’e-mail au client n’a pas pu être envoyé : pensez à le prévenir.</p> : null}
        </div>
      ) : null}
    </ProModal>
  );
}

/** Refus ou traitement manuel d'une demande d'annulation du client (aucun remboursement). */
export function ResolveRequestDialog({
  open,
  leadId,
  decision,
  onClose,
  onDone,
}: {
  open: boolean;
  leadId: string;
  decision: "refuse" | "manual";
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setNote("");
    setNotify(true);
    setError("");
  }, [open]);

  async function submit(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      await resolveCancellationRequestApi(leadId, {
        decision,
        refund: { mode: "none" },
        refundConfirmed: false,
        clientRequestId: newClientRequestId(),
        note: note.trim() || undefined,
        notifyCustomer: notify,
      });
      onDone();
      onClose();
    } catch (e) {
      setError(mapRefundErrorToFr(e));
    } finally {
      setBusy(false);
    }
  }

  const refuse = decision === "refuse";
  return (
    <ProModal
      open={open}
      title={refuse ? "Refuser la demande d’annulation" : "Traiter la demande manuellement"}
      description={
        refuse
          ? "La réservation est maintenue. Respectez vos conditions d’annulation et la réglementation applicable."
          : "La demande est clôturée sans action automatique : vous gérez la suite directement avec le client."
      }
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <ModalSecondaryButton onClick={onClose} disabled={busy}>
            Retour
          </ModalSecondaryButton>
          <ModalPrimaryButton onClick={() => void submit()} disabled={busy} danger={refuse}>
            {busy ? "Traitement…" : refuse ? "Refuser la demande" : "Clôturer en traitement manuel"}
          </ModalPrimaryButton>
        </>
      }
    >
      <label className="block">
        <span className="block text-[13px] font-bold">Message pour le client (facultatif)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} className={`${proInputClass} mt-2`} disabled={busy} />
      </label>
      <label className="flex cursor-pointer items-center gap-3 text-[13px]">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 accent-[var(--pro-accent)]" disabled={busy} />
        Prévenir le client par e-mail
      </label>
      {error ? <ProAlert tone="error">{error}</ProAlert> : null}
    </ProModal>
  );
}
