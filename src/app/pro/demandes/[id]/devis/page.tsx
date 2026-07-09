"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { prestationRowsFromFlat } from "@/components/pro/flatPresentation";
import { ProGuard } from "@/components/pro/ProGuard";
import { formatDateTime, formatPrice, getDisplayName, isUsefulValue, labelKind, labelStatus } from "@/components/pro/proDisplay";
import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { getProTenantSettingsFromApi } from "@/lib/proSettingsClient";
import { mergeTenantSettings } from "@/lib/tenantSettingsMerge";
import { proApi } from "@/lib/proApi";

type PaymentSnapshot = {
  id: string;
  status: string;
  mode: string;
  amount: number;
  currency: string;
  stripeReceiptUrl: string | null;
  paidAt: string | null;
};

type LeadDetail = {
  id: string;
  createdAt: string;
  kind: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  flatPayload: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  paymentStatus?: string | null;
  clientWantsOnlinePayment?: boolean | null;
  payments?: PaymentSnapshot[];
};

function pickReference(flat: Record<string, unknown>, fallbackId: string): string {
  const raw = flat.ID ?? flat.id;
  return isUsefulValue(raw) ? String(raw).trim() : fallbackId;
}

function formatAmountFromCents(cents: number, currency: string): string {
  const eur = cents / 100;
  const cur = currency.toLowerCase() === "eur" ? "EUR" : currency.toUpperCase();
  return `${eur.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
}

function formatAddress(a: TenantSettingsV1["contact"]["address"]): string {
  const line = [a.street, [a.postalCode, a.city].filter(Boolean).join(" "), a.country].filter(Boolean);
  return line.join(", ");
}

function truncateReceiptUrl(url: string, maxLength = 72): string {
  if (url.length <= maxLength) return url;
  return `${url.slice(0, maxLength - 1)}…`;
}

export default function ProDevisPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LeadDetail | null>(null);
  const [tenant, setTenant] = useState<TenantSettingsV1>(defaultTenantSettings);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reqRes, settingsRes] = await Promise.all([proApi(`/requests/${id}`), getProTenantSettingsFromApi()]);
        if (cancelled) return;
        setItem(reqRes.data as LeadDetail);
        if (settingsRes.ok && settingsRes.settings) {
          setTenant(mergeTenantSettings(defaultTenantSettings, settingsRes.settings));
        }
      } catch {
        if (!cancelled) setError("Impossible de charger le devis.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const flat = useMemo(() => (item?.flatPayload ?? {}) as Record<string, unknown>, [item]);
  const prestation = useMemo(() => prestationRowsFromFlat(flat), [flat]);
  const paid = useMemo(() => item?.payments?.find((p) => p.status === "PAID"), [item?.payments]);
  const paidReceiptUrl = paid?.stripeReceiptUrl?.trim() ?? "";

  const quoteRef = item ? `DEV-${pickReference(flat, item.id)}` : "";
  const issueDate = item ? formatDateTime(item.createdAt) : "";
  const validUntil = useMemo(() => {
    if (!item?.createdAt) return "";
    const d = new Date(item.createdAt);
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  }, [item?.createdAt]);

  const tarifTtc = item?.pricingResult && isUsefulValue((item.pricingResult as Record<string, unknown>).tarif)
    ? formatPrice((item.pricingResult as Record<string, unknown>).tarif)
    : isUsefulValue(flat.TarifTotal)
      ? formatPrice(flat.TarifTotal)
      : "—";

  return (
    <ProGuard>
      <div className="min-h-screen bg-[var(--pro-bg)] pb-10 text-[var(--pro-text)]">
        <div className="no-print sticky top-0 z-10 border-b border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <Link href={`/pro/demandes/${id}`} className="text-sm font-semibold text-[var(--pro-accent)] hover:brightness-110">
              ← Retour à la demande
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/pro/demandes/${id}/devis/print`}
                className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] hover:bg-[var(--pro-panel-strong)]"
              >
                Version imprimable
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-[var(--pro-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
              >
                Imprimer / enregistrer en PDF
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="mx-auto mt-6 max-w-3xl text-sm text-rose-600">{error}</p> : null}

        {item ? (
          <div
            id="devis-print-root"
            className="quote-print-area mx-auto mt-8 max-w-[210mm] overflow-hidden bg-white px-8 py-10 text-slate-900 shadow-lg print:mt-0 print:max-w-none print:bg-white print:p-0 print:shadow-none"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <style
              dangerouslySetInnerHTML={{
                __html: `@page{size:A4;margin:12mm}@media print{html,body{background:#fff!important;color:#0f172a!important}body *{visibility:hidden!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.quote-print-area,.quote-print-area *{visibility:visible!important}header,footer,nav,.no-print,[data-pro-nav],[data-dashboard-header]{display:none!important}.quote-print-area{position:absolute!important;left:0!important;top:0!important;box-shadow:none!important;margin:0 auto!important;max-width:186mm!important;width:186mm!important;padding:0!important;border:none!important}.quote-print-area a,.quote-print-area a:visited{color:#1e3a8a!important;text-decoration:underline}.quote-print-area .print-card{break-inside:avoid-page;page-break-inside:avoid}.quote-print-area .print-long-text{overflow-wrap:anywhere;word-break:break-word}.quote-print-area *{max-width:100%!important}}`,
              }}
            />

            <header className="print-card flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Devis</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{tenant.general.commercialName}</h1>
                {isUsefulValue(tenant.general.legalName) && tenant.general.legalName !== tenant.general.commercialName ? (
                  <p className="mt-1 text-sm text-slate-600">{tenant.general.legalName}</p>
                ) : null}
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">{formatAddress(tenant.contact.address)}</p>
                <div className="mt-3 space-y-0.5 text-sm text-slate-600">
                  <p>Tél. {tenant.contact.phoneDisplay}</p>
                  {tenant.contact.emailPublic ? <p>E-mail {tenant.contact.emailPublic}</p> : null}
                  {isUsefulValue(tenant.legal.siret) ? <p>SIRET {tenant.legal.siret}</p> : null}
                  {isUsefulValue(tenant.legal.vtcLicenseNumber) ? <p>Carte VTC n° {tenant.legal.vtcLicenseNumber}</p> : null}
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-900">Réf. {quoteRef}</p>
                <p className="mt-2 text-slate-600">Émis le {issueDate}</p>
                <p className="mt-1 text-slate-600">Valable jusqu’au {validUntil}</p>
                <p className="mt-3 text-xs text-slate-500">Document non contractuel — devis gratuit.</p>
              </div>
            </header>

            <section className="print-card mt-8 grid gap-6 border-b border-slate-200 pb-6 md:grid-cols-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Émetteur VTC</h2>
                <p className="mt-2 text-sm font-semibold text-slate-900">{tenant.general.commercialName}</p>
                <p className="print-long-text mt-1 text-sm text-slate-600">{formatAddress(tenant.contact.address)}</p>
                {tenant.contact.emailPublic ? <p className="print-long-text mt-1 text-sm text-slate-600">{tenant.contact.emailPublic}</p> : null}
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Client</h2>
                <p className="mt-2 text-lg font-semibold text-slate-900">{getDisplayName(item.clientName)}</p>
                {isUsefulValue(item.clientPhone) ? <p className="print-long-text mt-1 text-sm">{item.clientPhone}</p> : null}
                {isUsefulValue(item.clientEmail) ? <p className="print-long-text mt-1 text-sm">{item.clientEmail}</p> : null}
              </div>
              <div className="md:col-span-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Trajet / prestation</h2>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Type :</span> {labelKind(item.kind)}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Statut dossier :</span> {labelStatus(item.status)}
                </p>
              </div>
            </section>

            <section className="print-card mt-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Détail prestation</h2>
              {prestation.length ? (
                <table className="mt-4 w-full border-collapse text-sm">
                  <tbody>
                    {prestation.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100">
                        <td className="py-2 pr-4 align-top font-medium text-slate-600">{row.label}</td>
                        <td className="print-long-text py-2 align-top text-slate-900">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Détail communiqué sur la demande d’origine.</p>
              )}
            </section>

            <section className="print-card mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Prix</h2>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-2xl font-bold text-slate-900">{tarifTtc} TTC</p>
                <p className="max-w-md text-xs leading-relaxed text-slate-500">
                  TVA : mention conforme à votre situation (auto-entrepreneur, assujetti, etc.) à reporter sur la facture définitive. Ce document est un devis
                  indicatif, non facture comptable.
                </p>
              </div>

              {item.paymentStatus === "PAID" && paid ? (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
                  <p className="font-semibold">Paiement en ligne reçu</p>
                  <p className="mt-1">
                    Montant encaissé : <strong>{formatAmountFromCents(paid.amount, paid.currency)}</strong>
                    {paid.paidAt ? ` — le ${formatDateTime(paid.paidAt)}` : null}
                  </p>
                  <p className="mt-2">
                    Statut : <strong>Payé</strong>
                  </p>
                  {paidReceiptUrl ? (
                    <div className="mt-2">
                      <a href={paidReceiptUrl} className="inline-flex items-center font-semibold text-emerald-800 underline">
                        Voir le reçu Stripe
                      </a>
                      <p className="print-long-text mt-1 text-[11px] text-emerald-900/80">
                        {truncateReceiptUrl(paidReceiptUrl)}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : item.clientWantsOnlinePayment === false ? (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  Paiement sur place ou selon accord avec le chauffeur — aucun encaissement en ligne n’a été demandé sur le formulaire.
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  Paiement non encore reçu. Acompte ou solde en ligne : à convenir. Les conditions de paiement (virement, espèces, lien sécurisé) sont fixées
                  lors de l’acceptation du devis.
                </p>
              )}

              {item.paymentStatus === "PAID" && paid && tarifTtc !== "—" ? (
                <p className="mt-4 text-sm text-slate-600">
                  Reste éventuel à régler : selon accord (acompte déjà perçu, suppléments sur place, etc.).
                </p>
              ) : null}
            </section>

            <section className="print-card mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Conditions</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Devis gratuit, sans engagement jusqu’à la date de validité indiquée.</li>
                <li>Après acceptation, les conditions annulées / reports suivent votre politique commerciale habituelle.</li>
                <li>Ce document ne remplace pas une facture ou une déclaration comptable officielle.</li>
              </ul>
            </section>

            <footer className="print-card mt-12 border-t border-slate-300 pt-8 text-center text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Bon pour accord</p>
              <p className="mt-6">Date et signature du client</p>
              <div className="mx-auto mt-10 max-w-md border-b border-slate-400" />
            </footer>
          </div>
        ) : !error ? (
          <p className="mx-auto mt-10 max-w-3xl text-sm text-slate-500">Chargement du devis…</p>
        ) : null}
      </div>
    </ProGuard>
  );
}
