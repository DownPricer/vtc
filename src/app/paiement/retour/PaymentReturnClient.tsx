"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchPublicPaymentConfirmation,
  type PaymentConfirmationData,
} from "@/lib/publicPaymentConfirmation";

function formatMoney(amountCents: number, currency: string): string {
  const euros = amountCents / 100;
  const code = /^[a-z]{3}$/i.test(currency.trim()) ? currency.trim().toUpperCase() : "EUR";
  return euros.toLocaleString("fr-FR", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PaymentReturnClient({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<PaymentConfirmationData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pollLeft, setPollLeft] = useState(6);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetchPublicPaymentConfirmation(sessionId);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data?.confirmationPending || pollLeft <= 0) return;
    const t = window.setTimeout(() => {
      setPollLeft((n) => n - 1);
      void load();
    }, 4500);
    return () => window.clearTimeout(t);
  }, [data?.confirmationPending, pollLeft, load]);

  return (
    <div className="min-h-[80vh] bg-dark flex items-center justify-center px-5 py-16">
      <div className="max-w-lg w-full text-center">
        {loading && !data ? (
          <p className="text-gray-400 text-sm">Chargement du paiement…</p>
        ) : error ? (
          <>
            <h1 className="text-xl font-bold text-white mb-3">Impossible de confirmer ce paiement</h1>
            <p className="text-gray-500 text-sm mb-8">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5"
            >
              Réessayer
            </button>
          </>
        ) : data ? (
          <>
            <div className="relative inline-flex mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {data.confirmationPending ? (
              <>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Paiement en cours de confirmation</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Votre banque peut prendre quelques instants. La confirmation définitive arrive par e-mail dès que notre système a traité le
                  paiement (webhook Stripe).
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Paiement validé</h1>
                <p className="text-gradient font-bold text-lg mb-4">Merci pour votre confiance.</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Montant réglé :{" "}
                  <span className="text-white font-semibold">{formatMoney(data.amount, data.currency)}</span>
                  <br />
                  Référence demande : <span className="text-white font-mono text-xs">{data.leadReference}</span>
                  <br />
                  Statut enregistré : <span className="text-white">{data.status}</span>
                </p>
              </>
            )}

            {data.receiptUrl ? (
              <a
                href={data.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mb-4 items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-glow-lg transition-all duration-300"
              >
                Voir le reçu Stripe
              </a>
            ) : null}

            {!data.confirmationPending ? (
              <div className="mb-8 text-xs text-gray-600">
                Conservez ce reçu comme justificatif de paiement (document Stripe, pas une facture comptable complète).
              </div>
            ) : null}

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all"
            >
              Retour à l&apos;accueil
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
