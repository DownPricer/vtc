"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ProGuard } from "@/components/pro/ProGuard";
import { QuoteDocument } from "@/components/pro/quote/QuoteDocument";
import { useQuoteData } from "@/components/pro/quote/useQuoteData";

export default function ProDevisPage() {
  const { id } = useParams<{ id: string }>();
  const { lead, tenant, error } = useQuoteData(id);

  return (
    <ProGuard>
      <div className="pb-10">
        <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/pro/demandes/${id}`} className="text-sm font-semibold text-[var(--pro-accent)] hover:underline">
            ← Retour à la demande
          </Link>
          <button
            type="button"
            disabled={!lead}
            onClick={() => window.print()}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[7px] bg-[var(--pro-accent)] px-[17px] text-[13px] font-bold text-white shadow-[0_4px_12px_rgb(37_99_235/14%)] transition hover:bg-[var(--pro-accent-hover)] disabled:opacity-50"
          >
            Imprimer / enregistrer en PDF
          </button>
        </div>

        {error ? <p className="mx-auto max-w-[210mm] text-sm text-rose-600">{error}</p> : null}
        {lead ? (
          <QuoteDocument lead={lead} tenant={tenant} />
        ) : !error ? (
          <p className="mx-auto max-w-[210mm] text-sm text-[var(--pro-text-muted)]">Chargement du devis…</p>
        ) : null}
      </div>
    </ProGuard>
  );
}
