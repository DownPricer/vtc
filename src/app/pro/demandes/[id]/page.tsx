"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clientRowsFromFlat, paiementRowsFromFlat, prestationRowsFromFlat } from "@/components/pro/flatPresentation";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProNav } from "@/components/pro/ProNav";
import { EmptyState, ProPanel, ProSectionHeader, ProShell } from "@/components/pro/ProUi";
import {
  actionButtonClass,
  buildStatusActionBanner,
  formatDateTime,
  formatPrice,
  formatValue,
  getDisplayName,
  isUsefulValue,
  labelKind,
  labelStatus,
  mapApiErrorToFr,
  statusActionList,
  statusBadgeClass,
  translateAction,
  translatePayment,
  translateStatus,
  type PatchStatusResponseMeta,
} from "@/components/pro/proDisplay";
import { proApi } from "@/lib/proApi";

type LeadStatus =
  | "new"
  | "pending"
  | "accepted"
  | "refused"
  | "processed"
  | "archived"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "expired";

type HistoryRow = {
  id: string;
  newStatus: string;
  previousStatus?: string | null;
  createdAt: string;
  note?: string | null;
  changedByUser?: { id: string; email: string } | null;
};

type LeadDetail = {
  id: string;
  createdAt: string;
  kind: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  operatorNote?: string | null;
  flatPayload: Record<string, unknown>;
  pricingResult?: Record<string, unknown> | null;
  customerDecisionMailSentAt?: string | null;
  customerDecisionMailLastError?: string | null;
  history: HistoryRow[];
};

function pickReference(flat: Record<string, unknown>, fallbackId: string): string {
  const raw = flat.ID ?? flat.id;
  return isUsefulValue(raw) ? String(raw).trim() : fallbackId;
}

function displayRows(values: Array<{ label: string; value: unknown }>) {
  return values.map((entry) => formatValue(entry.label, entry.value)).filter(Boolean) as { label: string; value: string }[];
}

export default function ProDemandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LeadDetail | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setError("");
      const json = await proApi(`/requests/${id}`);
      const data = json.data as LeadDetail;
      setItem(data);
      setNote(data.operatorNote || "");
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(""), 4500);
    return () => window.clearTimeout(timer);
  }, [banner]);

  async function patchStatus(next: LeadStatus) {
    if (!item) return;
    setBusy(true);
    setError("");
    try {
      const json = await proApi(`/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      const meta = json.meta as PatchStatusResponseMeta | undefined;
      setBanner(buildStatusActionBanner(next, item.kind, meta));
      await load();
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message) || "Impossible de mettre à jour la demande pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    setBusy(true);
    setError("");
    try {
      await proApi(`/requests/${id}/note`, {
        method: "PATCH",
        body: JSON.stringify({ note }),
      });
      setBanner("Note enregistrée.");
      await load();
    } catch (e) {
      setError(mapApiErrorToFr((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  const flatPayload = useMemo(() => (item?.flatPayload ?? {}) as Record<string, unknown>, [item?.flatPayload]);
  const extrasClient = useMemo(() => clientRowsFromFlat(flatPayload), [flatPayload]);
  const prestation = useMemo(() => prestationRowsFromFlat(flatPayload), [flatPayload]);
  const paiementFlat = useMemo(() => paiementRowsFromFlat(flatPayload), [flatPayload]);

  const pricing = useMemo(() => {
    if (!item?.pricingResult) return [];
    const raw = item.pricingResult as Record<string, unknown>;
    const paymentMethod = translatePayment(String(raw.paymentMethod ?? ""));
    const paymentStatusRaw = String(raw.paymentStatus ?? "");
    const paymentStatus = isUsefulValue(paymentStatusRaw) ? translateStatus(paymentStatusRaw) : "";
    return displayRows([
      { label: "Tarif total", value: raw.tarif ? formatPrice(raw.tarif) : "" },
      { label: "Mode de paiement", value: paymentMethod },
      { label: "Statut paiement", value: paymentStatus },
    ]);
  }, [item]);

  const kind = item?.kind ?? "";
  const status = item?.status ?? "";
  const actions = statusActionList(status, kind);

  return (
    <ProGuard>
      <ProShell>
        <ProNav />

        <ProPanel>
          <ProSectionHeader
            eyebrow="Fiche demande"
            title={item ? labelKind(item.kind) : "Demande"}
            description="Consultez les informations client, mettez à jour le statut et suivez l'historique."
            action={
              <Link
                href="/pro/demandes"
                className="inline-flex rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-medium text-[var(--pro-text-soft)] hover:bg-[var(--pro-accent-soft)]"
              >
                Retour
              </Link>
            }
          />
          {item ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                {labelStatus(item.status)}
              </span>
              <span className="text-sm text-[var(--pro-text-muted)]">Référence : {pickReference(flatPayload, item.id)}</span>
              <span className="text-sm text-[var(--pro-text-muted)]">Créée le {formatDateTime(item.createdAt)}</span>
            </div>
          ) : null}
        </ProPanel>

        {banner ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{banner}</p> : null}
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {!item ? (
          <EmptyState message="Chargement de la demande..." />
        ) : (
          <>
            <ProPanel>
              <ProSectionHeader title="Actions" description="Choisissez une action operateur pour cette demande." />
              <div className="mt-5 flex flex-wrap gap-3">
                {actions.map((action) => (
                  <button
                    key={action.nextStatus}
                    type="button"
                    disabled={busy}
                    onClick={() => patchStatus(action.nextStatus as LeadStatus)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass(action.intent)}`}
                  >
                    {translateAction(action.action)}
                  </button>
                ))}
              </div>
              {(kind === "devis" || kind === "reservation") && (item.customerDecisionMailSentAt || item.customerDecisionMailLastError) ? (
                <div className="mt-4 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text-soft)]">
                  {item.customerDecisionMailSentAt ? <p>Le client a été notifié par e-mail le {formatDateTime(item.customerDecisionMailSentAt)}.</p> : null}
                  {item.customerDecisionMailLastError ? <p className="text-rose-700">La demande a été mise à jour, mais l&apos;e-mail client n&apos;a pas pu être envoyé.</p> : null}
                </div>
              ) : null}
            </ProPanel>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <ProPanel>
                <ProSectionHeader title="Client" description="Coordonnées et informations de contact." />
                <div className="mt-5 space-y-3 text-sm">
                  <p className="text-base font-semibold text-[var(--pro-text)]">{getDisplayName(item.clientName)}</p>
                  {isUsefulValue(item.clientPhone) ? (
                    <a href={`tel:${String(item.clientPhone).replace(/\s/g, "")}`} className="block font-medium text-[var(--pro-accent)] hover:brightness-110">
                      {item.clientPhone}
                    </a>
                  ) : null}
                  {isUsefulValue(item.clientEmail) ? (
                    <a href={`mailto:${item.clientEmail}`} className="block text-[var(--pro-text-soft)] hover:text-[var(--pro-accent)]">
                      {item.clientEmail}
                    </a>
                  ) : null}
                  {extrasClient.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                </div>
              </ProPanel>

              <ProPanel>
                <ProSectionHeader title="Tarif et paiement" description="Montant, mode de paiement et suivi." />
                <div className="mt-5 space-y-3">
                  {pricing.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                  {paiementFlat.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                  {!pricing.length && !paiementFlat.length ? <EmptyState message="Aucune information de paiement disponible." /> : null}
                </div>
              </ProPanel>
            </div>

            <ProPanel>
              <ProSectionHeader title="Prestation et trajet" description="Informations utiles pour organiser la course." />
              {prestation.length ? (
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {prestation.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pro-text-muted)]">{row.label}</p>
                      <p className="mt-1 text-sm text-[var(--pro-text)]">{row.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucune information de prestation disponible." />
              )}
            </ProPanel>

            <ProPanel>
              <ProSectionHeader title="Note interne" description="Visible uniquement dans l'espace professionnel." />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                placeholder="Ajoutez une note utile pour votre équipe."
                className="mt-5 w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
              />
              <button type="button" disabled={busy} onClick={saveNote} className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${actionButtonClass("primary")}`}>
                Enregistrer la note
              </button>
            </ProPanel>

            <ProPanel>
              <ProSectionHeader title="Historique" description="Suivi des changements effectués sur cette demande." />
              <div className="mt-5 space-y-3">
                {item.history.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                    <p className="text-sm text-[var(--pro-text-soft)]">
                      <span className="font-medium text-[var(--pro-text-muted)]">{formatDateTime(row.createdAt)}</span>
                      {" · "}
                      {row.previousStatus ? `${labelStatus(row.previousStatus)} -> ` : "Création -> "}
                      {labelStatus(row.newStatus)}
                    </p>
                    {row.changedByUser?.email ? <p className="mt-2 text-xs text-[var(--pro-text-muted)]">Opérateur : {row.changedByUser.email}</p> : null}
                    {isUsefulValue(row.note) ? <p className="mt-2 text-sm text-[var(--pro-text-soft)]">{row.note}</p> : null}
                  </div>
                ))}
                {!item.history.length ? <EmptyState message="Aucun historique disponible." /> : null}
              </div>
            </ProPanel>
          </>
        )}
      </ProShell>
    </ProGuard>
  );
}
