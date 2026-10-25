"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProAlert, ProPageHead, ProPanel, ProTable, proTdClass, proTrClass } from "@/components/pro/ProUi";
import { proBtnPrimaryClass, proBtnSecondaryClass } from "@/components/pro/settings/editable/proFieldStyles";
import {
  archiveProVehicle,
  featureProVehicle,
  listProVehicles,
  restoreProVehicle,
  surchargeShort,
  updateProVehicle,
  type ProVehicle,
} from "@/lib/proVehiclesClient";

function Thumb({ v }: { v: ProVehicle }) {
  const src = v.photos[0]?.url;
  return (
    <div className="h-12 w-[72px] shrink-0 overflow-hidden rounded-md border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- vignette d'administration
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] text-[var(--pro-text-muted)]">Pas de photo</div>
      )}
    </div>
  );
}

function StatusBadge({ v }: { v: ProVehicle }) {
  if (v.archived) return <span className="text-[13px] text-[var(--pro-text-muted)]">Archivé</span>;
  return (
    <span className={`text-[13px] font-semibold ${v.active ? "text-emerald-600" : "text-[var(--pro-text-muted)]"}`}>
      {v.active ? "Actif" : "Inactif"}
      {v.featured ? <span className="ml-2 font-medium text-[var(--pro-accent)]">· Mis en avant</span> : null}
    </span>
  );
}

export function VehiclesListClient() {
  const [vehicles, setVehicles] = useState<ProVehicle[] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setVehicles(await listProVehicles(showArchived));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [showArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(id: string, fn: () => Promise<unknown>, okMessage: string) {
    setBusyId(id);
    setNotice(null);
    try {
      await fn();
      setNotice(okMessage);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Gestion"
          title="Mes véhicules"
          description="Votre flotte : photos, capacités, supplément de tarif et disponibilités. Chaque véhicule choisi par un client est réservé pour la journée de sa course."
          action={
            <Link href="/pro/vehicules/nouveau" className={proBtnPrimaryClass}>
              Ajouter un véhicule
            </Link>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}
        {notice ? <ProAlert tone="success">{notice}</ProAlert> : null}

        <ProPanel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--pro-text-muted)]">
              {vehicles ? `${vehicles.length} véhicule${vehicles.length > 1 ? "s" : ""}` : "Chargement…"}
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--pro-text-soft)]">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
              Afficher les véhicules archivés
            </label>
          </div>

          {vehicles && vehicles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--pro-border)] p-8 text-center">
              <p className="font-semibold text-[var(--pro-text)]">Aucun véhicule pour le moment</p>
              <p className="mt-1 text-sm text-[var(--pro-text-muted)]">Ajoutez votre premier véhicule pour le proposer à vos clients.</p>
              <Link href="/pro/vehicules/nouveau" className={`${proBtnPrimaryClass} mt-4 inline-block`}>
                Ajouter un véhicule
              </Link>
            </div>
          ) : null}

          {vehicles && vehicles.length > 0 ? (
            <ProTable headers={["Véhicule", "Passagers", "Supplément", "Statut", "Actions"]} minWidth={860}>
              {vehicles.map((v) => (
                <tr key={v.id} className={proTrClass}>
                  <td className={proTdClass}>
                    <div className="flex items-center gap-3">
                      <Thumb v={v} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{v.name}</p>
                        <p className="text-xs text-[var(--pro-text-muted)]">
                          {[v.category, `${v.photoCount}/${v.maxPhotos} photos`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`${proTdClass} tabular-nums`}>{v.passengerMax}</td>
                  <td className={proTdClass}>{surchargeShort(v)}</td>
                  <td className={proTdClass}>
                    <StatusBadge v={v} />
                  </td>
                  <td className={proTdClass}>
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/pro/vehicules/${v.id}`} className={`${proBtnSecondaryClass} !px-3 !py-1.5 text-[13px]`}>
                        Modifier
                      </Link>
                      <Link href={`/pro/calendrier?vehicule=${v.id}`} className={`${proBtnSecondaryClass} !px-3 !py-1.5 text-[13px]`}>
                        Réservations
                      </Link>
                      {v.archived ? (
                        <button
                          type="button"
                          disabled={busyId === v.id}
                          className={`${proBtnSecondaryClass} !px-3 !py-1.5 text-[13px]`}
                          onClick={() => run(v.id, () => restoreProVehicle(v.id), `« ${v.name} » restauré.`)}
                        >
                          Restaurer
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            className={`${proBtnSecondaryClass} !px-3 !py-1.5 text-[13px]`}
                            onClick={() =>
                              run(
                                v.id,
                                () => updateProVehicle(v.id, { active: !v.active }),
                                v.active ? `« ${v.name} » désactivé : il n'est plus proposé aux clients.` : `« ${v.name} » activé.`
                              )
                            }
                          >
                            {v.active ? "Désactiver" : "Activer"}
                          </button>
                          {v.active && !v.featured ? (
                            <button
                              type="button"
                              disabled={busyId === v.id}
                              className={`${proBtnSecondaryClass} !px-3 !py-1.5 text-[13px]`}
                              onClick={() => run(v.id, () => featureProVehicle(v.id), `« ${v.name} » est mis en avant sur le site.`)}
                            >
                              Mettre en avant
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            className={`${proBtnSecondaryClass} !px-3 !py-1.5 text-[13px]`}
                            onClick={() => {
                              if (!window.confirm(`Archiver « ${v.name} » ? L'historique des devis et réservations est conservé.`)) return;
                              void run(v.id, () => archiveProVehicle(v.id), `« ${v.name} » archivé.`);
                            }}
                          >
                            Archiver
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </ProTable>
          ) : null}
        </ProPanel>
      </div>
    </ProGuard>
  );
}
