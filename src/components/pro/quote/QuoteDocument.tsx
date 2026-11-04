"use client";

import type { CSSProperties, ReactNode } from "react";
import { formatDateTime, getDisplayName, isUsefulValue } from "@/components/pro/proDisplay";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

export type QuotePayment = {
  id: string;
  status: string;
  mode: string;
  amount: number;
  currency: string;
  stripeReceiptUrl: string | null;
  paidAt: string | null;
};

export type QuoteLead = {
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
  payments?: QuotePayment[];
};

type VehicleSnapshot = {
  name?: string;
  brand?: string | null;
  model?: string | null;
  passengerMax?: number;
  luggageLabel?: string | null;
  photoUrl?: string | null;
  tarifBase?: number;
  surcharge?: { amount?: number };
};

const eur = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })} €`;

const str = (flat: Record<string, unknown>, key: string): string => (isUsefulValue(flat[key]) ? String(flat[key]).trim() : "");

/** « 15/11/2026 » → « dimanche 15 novembre 2026 » ; toute autre valeur est rendue telle quelle. */
function longDate(value: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return value;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (Number.isNaN(d.getTime())) return value;
  const text = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Valeurs de gabarit non renseignées (« À compléter », code postal 00000, SIRET 000…) : jamais imprimées sur un devis. */
const isPlaceholder = (v: unknown): boolean => {
  const t = String(v ?? "").trim();
  return !t || /à compléter|a completer/i.test(t) || /^ville$/i.test(t) || (/\d/.test(t) && !/[1-9]/.test(t));
};
const real = (v: unknown): string => (isUsefulValue(v) && !isPlaceholder(v) ? String(v).trim() : "");

function formatAddress(a: TenantSettingsV1["contact"]["address"]): string {
  if (!real(a.street) && !real(a.city)) return ""; // adresse non renseignée : rien d'imprimé
  return [real(a.street), [real(a.postalCode), real(a.city)].filter(Boolean).join(" "), real(a.country)].filter(Boolean).join(", ");
}

type Leg = { title: string; date: string; time: string; from: string; to: string; flight: string };

function buildLegs(flat: Record<string, unknown>): Leg[] {
  const legs: Leg[] = [];
  const isMad = /mad|mise/i.test(str(flat, "TypeService")) && !str(flat, "AdresseDepart_2");
  const outFrom = isMad ? "" : str(flat, "AdresseDepart_1");
  const outTo = str(flat, "AdresseArrivee_1");
  const retFrom = str(flat, "AdresseDepart_2");
  const retTo = str(flat, "AdresseArrivee_2");
  const hasReturn = Boolean(retFrom || retTo);

  const out: Leg = {
    title: hasReturn ? "Aller" : isMad ? "Mise à disposition" : "Trajet",
    date: longDate(str(flat, "DateAller")),
    time: str(flat, "HeureAller"),
    from: outFrom,
    to: outTo,
    flight: [str(flat, "AllerNumeroVol"), str(flat, "AllerHeureVol")].filter(Boolean).join(" · "),
  };
  if (out.date || out.time || out.from || out.to) legs.push(out);

  if (hasReturn) {
    legs.push({
      title: "Retour",
      date: longDate(str(flat, "DateRetour")),
      time: str(flat, "HeureRetour"),
      from: retFrom,
      to: retTo,
      flight: [str(flat, "RetourNumeroVol"), str(flat, "RetourHeureVol")].filter(Boolean).join(" · "),
    });
  }
  return legs;
}

function Section({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`q-avoid mt-7 ${className}`}>
      <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        <span className="h-3 w-1 rounded-full" style={{ backgroundColor: "var(--q-accent)" }} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

const PRINT_CSS = `@page{size:A4;margin:12mm}
@media print{
  html,body{background:#fff!important;color:#0f172a!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body *{visibility:hidden!important}
  .quote-print-area,.quote-print-area *{visibility:visible!important}
  .quote-print-area{position:absolute!important;left:0!important;top:0!important;width:186mm!important;max-width:186mm!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}
  .quote-print-area .q-avoid{break-inside:avoid;page-break-inside:avoid}
  .quote-print-area a{color:inherit!important;text-decoration:none}
  header,footer,nav,.no-print,[data-pro-nav],[data-dashboard-header]{display:none!important}
}`;

/**
 * Devis imprimable (A4) : en-tête de l'entreprise, client, course (aller / retour), véhicule, détail du prix,
 * paiement, conditions et bon pour accord. Un seul composant pour la page à l'écran et la version à imprimer.
 */
export function QuoteDocument({ lead, tenant }: { lead: QuoteLead; tenant: TenantSettingsV1 }) {
  const flat = lead.flatPayload ?? {};
  const pricing = (lead.pricingResult ?? {}) as Record<string, unknown>;
  const vehicle = (pricing.vehicle ?? null) as VehicleSnapshot | null;

  const accent = /^#[0-9a-f]{6}$/i.test(tenant.branding.colors.primary ?? "") ? tenant.branding.colors.primary : "#2563eb";
  const vars = { "--q-accent": accent } as CSSProperties;

  const rawRef = flat.ID ?? flat.id;
  const reference = `DEV-${isUsefulValue(rawRef) ? String(rawRef).trim() : lead.id}`;
  const issued = new Date(lead.createdAt);
  const validUntil = new Date(issued);
  validUntil.setDate(validUntil.getDate() + 30);
  const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const total = Number(isUsefulValue(pricing.tarif) ? pricing.tarif : flat.TarifTotal);
  const hasTotal = Number.isFinite(total) && total > 0;
  const surcharge = vehicle?.surcharge?.amount ?? 0;
  const base = typeof vehicle?.tarifBase === "number" ? vehicle.tarifBase : typeof pricing.tarifBase === "number" ? pricing.tarifBase : total;

  const service = str(flat, "TypeService");
  const tripType = str(flat, "TypeTrajet");
  const serviceLabel = [service, tripType && tripType !== service ? tripType : ""].filter(Boolean).join(" — ") || "Transport de personnes";
  const legs = buildLegs(flat);

  const bagsOut = str(flat, "BagagesAller");
  const bagsBack = str(flat, "BagagesRetour");
  const facts: Array<{ label: string; value: string }> = [
    { label: "Prestation", value: serviceLabel },
    { label: "Passagers", value: str(flat, "NombrePassagers") },
    {
      label: "Bagages",
      value: bagsBack && bagsBack !== "0" ? `${bagsOut || 0} à l'aller · ${bagsBack} au retour` : bagsOut && bagsOut !== "0" ? bagsOut : "",
    },
    { label: "Lieu de l'événement", value: str(flat, "LieuEvenement") },
    { label: "Durée de mise à disposition", value: str(flat, "HeuresMADEvenementiel") || str(flat, "HeuresMAD") },
    { label: "Options", value: /aucun/i.test(str(flat, "Options")) ? "" : str(flat, "Options") },
  ].filter((f) => f.value);

  const paid = lead.payments?.find((p) => p.status === "PAID");
  const legalLine = [
    tenant.general.legalName || tenant.general.commercialName,
    real(tenant.legal.siret) ? `SIRET ${real(tenant.legal.siret)}` : "",
    real(tenant.legal.vtcLicenseNumber) ? `Carte VTC n° ${real(tenant.legal.vtcLicenseNumber)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="quote-print-area mx-auto w-full max-w-[210mm] rounded-xl bg-white p-5 text-slate-900 shadow-[0_8px_30px_rgb(15_23_42/10%)] sm:p-10 print:rounded-none print:shadow-none"
      style={{ ...vars, fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* En-tête */}
      <header className="q-avoid flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {isUsefulValue(tenant.branding.logoSrc) ? (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-slate-900 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- document imprimable */}
              <img src={tenant.branding.logoSrc} alt={tenant.branding.logoAlt || ""} className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-xl font-bold leading-tight tracking-tight text-slate-900">{tenant.general.commercialName}</p>
            {tenant.general.tagline ? <p className="mt-0.5 text-xs text-slate-500">{tenant.general.tagline}</p> : null}
            <address className="mt-2 text-xs not-italic leading-relaxed text-slate-600">
              {[formatAddress(tenant.contact.address), [real(tenant.contact.phoneDisplay), tenant.contact.emailPublic].filter(Boolean).join(" · ")]
                .filter(Boolean)
                .map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
            </address>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-3xl font-extrabold uppercase tracking-[0.12em]" style={{ color: "var(--q-accent)" }}>
            Devis
          </p>
          <dl className="mt-2 space-y-0.5 text-xs text-slate-600">
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-slate-400">N°</dt>
              <dd className="break-all font-semibold text-slate-900">{reference}</dd>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-slate-400">Émis le</dt>
              <dd>{Number.isNaN(issued.getTime()) ? "" : dateFr(issued)}</dd>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-slate-400">Valable jusqu’au</dt>
              <dd>{Number.isNaN(validUntil.getTime()) ? "" : dateFr(validUntil)}</dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="mt-6 h-[3px] w-full rounded-full" style={{ backgroundColor: "var(--q-accent)" }} />

      {/* Émetteur / client */}
      <section className="q-avoid mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Prestataire</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{tenant.general.legalName || tenant.general.commercialName}</p>
          {real(tenant.legal.legalRepresentative) ? <p className="text-sm text-slate-600">{real(tenant.legal.legalRepresentative)}</p> : null}
          {formatAddress(tenant.contact.address) ? <p className="mt-1 text-sm text-slate-600">{formatAddress(tenant.contact.address)}</p> : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Client</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{getDisplayName(lead.clientName)}</p>
          {isUsefulValue(flat.NomSociete) ? <p className="text-sm text-slate-600">{String(flat.NomSociete).trim()}</p> : null}
          {isUsefulValue(lead.clientPhone) ? <p className="mt-1 text-sm text-slate-600">{lead.clientPhone}</p> : null}
          {isUsefulValue(lead.clientEmail) ? <p className="break-all text-sm text-slate-600">{lead.clientEmail}</p> : null}
        </div>
      </section>

      {/* Course */}
      <Section title="Votre course">
        {legs.length > 0 ? (
          <div className="space-y-3">
            {legs.map((leg) => (
              <div key={leg.title} className="q-avoid rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-bold text-slate-900">{leg.title}</p>
                  <p className="text-sm text-slate-600">
                    {[leg.date, leg.time].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {leg.from || leg.to ? (
                  <ol className="mt-3 space-y-0">
                    {leg.from ? (
                      <li className="flex gap-3">
                        <span className="flex flex-col items-center pt-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--q-accent)" }} />
                          {leg.to ? <span className="my-1 w-px flex-1 bg-slate-300" /> : null}
                        </span>
                        <span className="min-w-0 pb-3">
                          <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">Prise en charge</span>
                          <span className="block break-words text-sm text-slate-900">{leg.from}</span>
                        </span>
                      </li>
                    ) : null}
                    {leg.to ? (
                      <li className="flex gap-3">
                        <span className="flex flex-col items-center pt-1.5">
                          <span className="h-2.5 w-2.5 rounded-full border-2 bg-white" style={{ borderColor: "var(--q-accent)" }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            {leg.from ? "Destination" : "Lieu"}
                          </span>
                          <span className="block break-words text-sm text-slate-900">{leg.to}</span>
                        </span>
                      </li>
                    ) : null}
                  </ol>
                ) : null}
                {leg.flight ? <p className="mt-2 text-xs text-slate-500">Vol : {leg.flight}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Le détail du trajet figure sur la demande d’origine.</p>
        )}

        {facts.length > 0 ? (
          <dl className="q-avoid mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
            {facts.map((f) => (
              <Fact key={f.label} label={f.label} value={f.value} />
            ))}
          </dl>
        ) : null}
      </Section>

      {/* Véhicule */}
      {vehicle?.name ? (
        <Section title="Véhicule">
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
            {vehicle.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- document imprimable
              <img src={vehicle.photoUrl} alt="" className="h-20 w-32 shrink-0 rounded-md object-cover" />
            ) : null}
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">{vehicle.name}</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {[vehicle.passengerMax ? `${vehicle.passengerMax} passagers maximum` : "", vehicle.luggageLabel ?? ""].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Prix */}
      <Section title="Détail du prix">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 font-semibold">Désignation</th>
                <th className="px-4 py-2.5 text-right font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 text-slate-800">
                  {serviceLabel}
                  {legs.length > 1 ? <span className="block text-xs text-slate-500">Aller et retour inclus</span> : null}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-900">{hasTotal ? eur(surcharge > 0 ? base : total) : "—"}</td>
              </tr>
              {surcharge > 0 ? (
                <tr>
                  <td className="px-4 py-3 text-slate-800">Supplément véhicule{vehicle?.name ? ` — ${vehicle.name}` : ""}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-900">{eur(surcharge)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-4 text-white">
            <span className="text-sm font-semibold uppercase tracking-[0.14em]">Total TTC</span>
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: "var(--q-accent)" }}>
              {hasTotal ? eur(total) : "—"}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Prix ferme et définitif pour la prestation décrite, bagages et prise en charge inclus. La mention de TVA applicable à votre situation figure sur la
          facture.
        </p>
      </Section>

      {/* Paiement */}
      <Section title="Paiement">
        {lead.paymentStatus === "PAID" && paid ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="font-semibold">Paiement en ligne reçu</p>
            <p className="mt-1">
              {eur(paid.amount / 100)} encaissés{paid.paidAt ? ` le ${formatDateTime(paid.paidAt)}` : ""}.
            </p>
            {paid.stripeReceiptUrl ? (
              <a href={paid.stripeReceiptUrl} className="mt-2 inline-block font-semibold underline">
                Voir le reçu
              </a>
            ) : null}
          </div>
        ) : lead.clientWantsOnlinePayment === false ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Règlement sur place ou selon accord avec le chauffeur : aucun paiement en ligne n’a été demandé.
          </p>
        ) : (
          <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
            Paiement non encore reçu. Les modalités (lien de paiement sécurisé, virement ou espèces) sont confirmées à l’acceptation du devis.
          </p>
        )}
      </Section>

      {/* Conditions */}
      <Section title="Conditions">
        <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-600">
          <li>Devis gratuit, valable 30 jours à compter de sa date d’émission.</li>
          <li>La réservation est confirmée à l’acceptation du devis par le chauffeur.</li>
          <li>Les conditions d’annulation et de report sont celles communiquées lors de la réservation.</li>
          <li>Ce document est un devis, il ne tient pas lieu de facture.</li>
        </ul>
      </Section>

      {/* Bon pour accord */}
      <section className="q-avoid mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Le prestataire</p>
          <div className="mt-10 border-b border-slate-300" />
          <p className="mt-1.5 text-[11px] text-slate-400">Date et signature</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Bon pour accord — le client</p>
          <div className="mt-10 border-b border-slate-300" />
          <p className="mt-1.5 text-[11px] text-slate-400">Date et signature précédées de « Bon pour accord »</p>
        </div>
      </section>

      <footer className="q-avoid mt-8 border-t border-slate-200 pt-4 text-center text-[11px] leading-relaxed text-slate-400">
        {legalLine}
        <br />
        {[formatAddress(tenant.contact.address), real(tenant.contact.phoneDisplay), tenant.contact.emailPublic].filter(Boolean).join(" · ")}
      </footer>
    </div>
  );
}
