"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { QuoteDocument } from "@/components/pro/quote/QuoteDocument";
import { useQuoteData } from "@/components/pro/quote/useQuoteData";

/** Même document que la page du devis, avec ouverture directe de la boîte d'impression. */
export default function ProDevisPrintOnlyPage() {
  const { id } = useParams<{ id: string }>();
  const { lead, tenant, error } = useQuoteData(id);

  useEffect(() => {
    if (!lead || error) return;
    const t = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(t);
  }, [lead, error]);

  return (
    <ProGuard>
      {error ? <p className="mx-auto max-w-[210mm] px-6 py-10 text-sm text-rose-700">{error}</p> : null}
      {lead ? <QuoteDocument lead={lead} tenant={tenant} /> : null}
    </ProGuard>
  );
}
