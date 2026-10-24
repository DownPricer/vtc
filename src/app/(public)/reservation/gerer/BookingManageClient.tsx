"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchBookingView, requestBookingCancellation, type PublicBookingView } from "@/lib/publicBooking";

function money(cents: number, currency: string): string {
  const code = /^[a-z]{3}$/i.test(currency.trim()) ? currency.trim().toUpperCase() : "EUR";
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_LABEL: Record<string, string> = {
  new: "Demande reçue",
  pending: "En attente de confirmation",
  accepted: "Réservation confirmée",
  scheduled: "Course planifiée",
  processed: "Traitée",
  completed: "Course terminée",
  cancelled: "Réservation annulée",
  cancellation_requested: "Annulation demandée",
  refused: "Demande refusée",
  expired: "Expirée",
  archived: "Archivée",
};

const PAYMENT_LABEL: Record<string, string> = {
  PAID: "Payé",
  PARTIALLY_REFUNDED: "Partiellement remboursé",
  REFUND_PENDING: "Remboursement en cours",
  REFUND_FAILED: "Remboursement à finaliser",
  REFUNDED: "Remboursé",
};

const REQUEST_LABEL: Record<string, string> = {
  PENDING: "Votre demande d’annulation a été transmise au chauffeur, qui vous répondra prochainement.",
  ACCEPTED: "Votre demande d’annulation a été acceptée.",
  REFUSED: "Votre demande d’annulation n’a pas pu être accordée : la réservation est maintenue.",
  MANUAL: "Le chauffeur traite votre demande directement avec vous.",
};

export function BookingManageClient({ token }: { token: string }) {
  const [view, setView] = useState<PublicBookingView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetchBookingView(token);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setView(res.data);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(): Promise<void> {
    if (reason.trim().length < 5) {
      setFormError("Indiquez un motif (5 caractères minimum).");
      return;
    }
    setBusy(true);
    setFormError("");
    const res = await requestBookingCancellation(token, reason.trim());
    setBusy(false);
    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    setSent(true);
    setShowForm(false);
    await load();
  }

  return (
    <div className="min-h-[80vh] bg-dark flex items-start justify-center px-5 py-14">
      <div className="max-w-xl w-full">
        {loading && !view ? <p className="text-gray-400 text-sm text-center">Chargement de votre réservation…</p> : null}

        {error && !view ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-3">Réservation inaccessible</h1>
            <p className="text-gray-500 text-sm mb-8">{error}</p>
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5">
              Contacter le chauffeur
            </Link>
          </div>
        ) : null}

        {view ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">{view.companyName}</p>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tight">Ma réservation</h1>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3 text-sm">
              <Row label="Statut" value={STATUS_LABEL[view.status] ?? "En cours de traitement"} strong />
              <Row label="Référence" value={view.reference} mono />
              {view.rideDate ? (
                <Row
                  label="Date de la course"
                  value={new Date(view.rideDate).toLocaleString("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                />
              ) : null}
              {view.tripSummary ? <Row label="Trajet" value={view.tripSummary} /> : null}
              {view.payment ? (
                <>
                  <Row label="Montant payé" value={money(view.payment.paidCents, view.payment.currency)} />
                  {view.payment.refundedCents > 0 ? <Row label="Déjà remboursé" value={money(view.payment.refundedCents, view.payment.currency)} /> : null}
                  <Row label="Paiement" value={PAYMENT_LABEL[view.payment.state] ?? "Payé"} />
                </>
              ) : null}
            </div>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5" aria-labelledby="policy-title">
              <h2 id="policy-title" className="text-base font-bold text-white mb-3">
                Conditions d’annulation applicables
              </h2>
              {view.policy ? (
                <dl className="space-y-3 text-sm">
                  {view.policy.lines.map((l) => (
                    <div key={l.label}>
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">{l.label}</dt>
                      <dd className="text-gray-300 whitespace-pre-line">{l.text}</dd>
                    </div>
                  ))}
                  <p className="text-xs text-gray-600">Conditions en vigueur au moment de votre réservation (version {view.policy.version}).</p>
                </dl>
              ) : (
                <p className="text-sm text-gray-400">Aucune condition n’a été enregistrée pour cette réservation : votre demande sera examinée au cas par cas par le chauffeur.</p>
              )}
            </section>

            {view.cancellationRequest ? (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-gray-200" role="status">
                {REQUEST_LABEL[view.cancellationRequest.status]}
                <span className="block mt-1 text-xs text-gray-500">Demande du {new Date(view.cancellationRequest.requestedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            ) : null}

            {sent ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200" role="status">
                Votre demande a bien été envoyée. Un e-mail de confirmation vous est envoyé. Aucun remboursement n’est automatique : le chauffeur vous répondra.
              </div>
            ) : null}

            {view.canRequestCancellation ? (
              <div className="mt-6">
                {!showForm ? (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-all"
                  >
                    Demander l’annulation
                  </button>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <label htmlFor="cancel-reason" className="block text-sm font-bold text-white mb-2">
                      Motif de votre demande
                    </label>
                    <textarea
                      id="cancel-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      disabled={busy}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-primary focus:outline-none"
                      placeholder="Expliquez brièvement pourquoi vous souhaitez annuler"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Votre demande est transmise au chauffeur. La réservation reste valable tant qu’elle n’est pas confirmée comme annulée, et aucun remboursement n’est déclenché automatiquement.
                    </p>
                    {formError ? (
                      <p role="alert" className="mt-3 text-sm text-red-400">
                        {formError}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void submit()}
                        disabled={busy}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm disabled:opacity-50 transition-all"
                      >
                        {busy ? "Envoi…" : "Envoyer ma demande"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={busy}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5"
                      >
                        Retour
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !view.cancellationRequest && view.status !== "cancelled" ? (
              <p className="mt-6 text-sm text-gray-500">
                Cette réservation ne peut plus faire l’objet d’une demande d’annulation en ligne. Contactez directement le chauffeur.
              </p>
            ) : null}

            <div className="mt-10 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-white">
                Retour à l’accueil
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right ${strong ? "font-bold text-white" : "text-gray-200"} ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</span>
    </div>
  );
}
