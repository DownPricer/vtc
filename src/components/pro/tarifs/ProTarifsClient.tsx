"use client";

import { ProGuard } from "@/components/pro/ProGuard";
import { ProReadOnlyBadge } from "@/components/pro/ProReadOnlyBadge";
import { ProActionLink, ProDescriptionList, ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { useProTenantSettings } from "@/hooks/useProTenantSettings";
import { getPricingWithFallback } from "@/lib/pricing/buildPricingConfigForTenant";

function formatEuro(value: number): string {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

function formatBool(value: boolean): string {
  return value ? "Activé" : "Désactivé";
}

type ProTarifsClientProps = {
  defaults: TenantSettingsV1;
};

export function ProTarifsClient({ defaults }: ProTarifsClientProps) {
  const { tenant, loadState, loadMessage } = useProTenantSettings(defaults);
  const pricing = getPricingWithFallback(tenant);
  const { classicTrip, airportTransfers, hourlyHire, surcharges, discounts } = pricing;
  const enabledAirports = airportTransfers.airports.filter((airport) => airport.enabled);

  return (
    <ProGuard>
      <ProPanel>
        <ProSectionHeader
          title="Tarifs"
          description="Paramètres tarifaires actuellement utilisés par le calculateur. L’édition se fait dans Paramètres."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ProReadOnlyBadge />
              <ProActionLink href="/pro/parametres">Modifier dans Paramètres</ProActionLink>
            </div>
          }
        />
        {loadState === "loading" ? (
          <p className="mt-4 text-sm text-[var(--pro-text-muted)]">Chargement des tarifs…</p>
        ) : null}
        {loadMessage ? (
          <p className="mt-4 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text-muted)]">
            {loadMessage}
          </p>
        ) : null}
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Trajets classiques" description="Base de calcul utilisée par le moteur de pricing." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              { label: "Trajet classique", value: formatBool(classicTrip.enabled) },
              { label: "Prix / km (aller simple)", value: formatEuro(classicTrip.oneWayPricePerKm) },
              { label: "Prix / km (aller-retour)", value: formatEuro(classicTrip.roundTripPricePerKm) },
              { label: "Prix minimum", value: formatEuro(classicTrip.minimumPrice) },
              { label: "Approche chauffeur (€/km)", value: formatEuro(classicTrip.approachPricePerKm) },
              { label: "Retour dépôt", value: formatBool(classicTrip.returnToBaseEnabled) },
              { label: "Zone principale (set ID)", value: classicTrip.primaryServiceZoneSetId },
              { label: "Multiplicateur hors zone", value: `× ${classicTrip.outOfZoneMultiplier.toLocaleString("fr-FR")}` },
              { label: "Remise aller-retour", value: formatBool(discounts.roundTripEnabled) },
            ]}
          />
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader
          title="Aéroports"
          description={`Transferts aéroport — ${enabledAirports.length} aéroport(s) configuré(s).`}
        />
        <div className="mt-6 space-y-4">
          <ProDescriptionList rows={[{ label: "Module aéroport", value: formatBool(airportTransfers.enabled) }]} />
          {enabledAirports.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-[var(--pro-border)]">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-[var(--pro-panel-muted)] text-xs uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">
                  <tr>
                    <th className="border-b border-[var(--pro-border)] px-4 py-3 font-semibold">Code</th>
                    <th className="border-b border-[var(--pro-border)] px-4 py-3 font-semibold">Nom</th>
                    <th className="border-b border-[var(--pro-border)] px-4 py-3 font-semibold">€/km</th>
                    <th className="border-b border-[var(--pro-border)] px-4 py-3 font-semibold">Min. aller</th>
                    <th className="border-b border-[var(--pro-border)] px-4 py-3 font-semibold">Min. A/R</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pro-border)]">
                  {enabledAirports.map((airport) => (
                    <tr key={airport.code}>
                      <td className="px-4 py-3 font-medium text-[var(--pro-text)]">{airport.code}</td>
                      <td className="px-4 py-3 text-[var(--pro-text)]">{airport.name}</td>
                      <td className="px-4 py-3 text-[var(--pro-text)]">{formatEuro(airport.pricePerKm)}</td>
                      <td className="px-4 py-3 text-[var(--pro-text)]">{formatEuro(airport.oneWayMinimumPrice)}</td>
                      <td className="px-4 py-3 text-[var(--pro-text)]">{formatEuro(airport.roundTripMinimumPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[var(--pro-text-muted)]">Aucun aéroport activé.</p>
          )}
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Mise à disposition" description="Tarification horaire événementielle." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              { label: "Mise à disposition", value: formatBool(hourlyHire.enabled) },
              { label: "Prix / heure", value: formatEuro(hourlyHire.hourlyRate) },
              { label: "Minimum total", value: formatEuro(hourlyHire.minimumTotal) },
            ]}
          />
        </div>
      </ProPanel>

      <ProPanel>
        <ProSectionHeader title="Majorations" description="Nuit, soirée, week-end et jours fériés." />
        <div className="mt-6">
          <ProDescriptionList
            rows={[
              { label: "Majoration nuit", value: formatPercent(surcharges.nightPercent) },
              { label: "Majoration soirée", value: formatPercent(surcharges.eveningPercent) },
              { label: "Majoration week-end", value: formatPercent(surcharges.weekendPercent) },
              { label: "Majoration jours fériés", value: formatPercent(surcharges.holidayPercent) },
              { label: "Montant minimum majoration", value: formatEuro(surcharges.minimumAmount) },
            ]}
          />
        </div>
      </ProPanel>
    </ProGuard>
  );
}
