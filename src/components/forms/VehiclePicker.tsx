"use client";

import { useEffect, useRef, useState } from "react";
import { fetchVehicleOptions, type PublicVehicleOption } from "@/lib/publicVehiclesClient";
import { VehicleGalleryButton } from "@/components/vehicles/VehicleGalleryButton";

type Props = {
  value: string;
  onChange: (vehicleId: string) => void;
  /** Nombre de véhicules proposés (permet au formulaire de savoir si le choix est obligatoire). */
  onLoaded: (vehicles: PublicVehicleOption[]) => void;
  /** `YYYY-MM-DD` */
  date?: string;
  dateEnd?: string;
  passengers: number;
  bags: number;
};

function Thumb({ v }: { v: PublicVehicleOption }) {
  const src = v.photos[0]?.src;
  return (
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-black/40 sm:h-16 sm:w-24">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- vignette (WebP déjà redimensionné côté API)
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] text-gray-500">Photo à venir</div>
      )}
    </div>
  );
}

/** Étape « Choisissez votre véhicule » : cartes compactes, sélection claire, disponibilité et compatibilité du groupe. */
export function VehiclePicker({ value, onChange, onLoaded, date, dateEnd, passengers, bags }: Props) {
  const [vehicles, setVehicles] = useState<PublicVehicleOption[] | null>(null);
  const loadedCb = useRef(onLoaded);
  loadedCb.current = onLoaded;
  const changeCb = useRef(onChange);
  changeCb.current = onChange;
  const selectedRef = useRef(value);
  selectedRef.current = value;
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetchVehicleOptions({ date, dateEnd, passengers, bags }, ctrl.signal)
        .then((list) => {
          setVehicles(list);
          loadedCb.current(list);
          const sel = list.find((v) => v.id === selectedRef.current);
          if (selectedRef.current && (!sel || !sel.available || !sel.fits)) {
            setNotice(sel?.unavailableReason ?? "Ce véhicule n'est plus proposé : choisissez-en un autre.");
            changeCb.current("");
          } else if (sel) {
            setNotice(null);
          }
        })
        .catch(() => {
          /* annulé ou réseau : l'API refusera de toute façon un choix invalide */
        });
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [date, dateEnd, passengers, bags]);

  if (vehicles === null || vehicles.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-xs text-gray-500">
        {date
          ? "Disponibilité vérifiée pour votre date. Le tarif est recalculé selon le véhicule choisi."
          : "Indiquez votre date pour voir les disponibilités. Le tarif est recalculé selon le véhicule choisi."}
      </p>
      {notice ? (
        <p role="status" className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {notice}
        </p>
      ) : null}
      <div role="radiogroup" aria-label="Choisissez votre véhicule" className="grid gap-2">
        {vehicles.map((v) => {
          const selectable = v.available && v.fits;
          const selected = value === v.id;
          const hasSurcharge = v.surcharge.mode !== "none" && v.surcharge.value > 0;
          return (
            <div
              key={v.id}
              className={`relative flex items-stretch gap-3 rounded-xl border p-2.5 transition ${
                selected
                  ? "border-primary bg-primary/10 shadow-glow"
                  : selectable
                    ? "border-white/[0.08] bg-white/[0.02] hover:border-primary/40"
                    : "border-white/[0.05] bg-white/[0.01] opacity-60"
              }`}
            >
              <VehicleGalleryButton title={v.name} photos={v.photos} className="shrink-0 !w-auto rounded-lg">
                <Thumb v={v} />
              </VehicleGalleryButton>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!selectable}
                onClick={() => {
                  setNotice(null);
                  onChange(v.id);
                }}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight text-white sm:truncate">{v.name}</span>
                  <span className="block text-[11px] text-gray-400">
                    {v.passengerMax} passagers
                    {v.luggageLabel ? ` · ${v.luggageLabel}` : v.category ? ` · ${v.category}` : ""}
                  </span>
                  <span className={`mt-0.5 block text-[11px] font-semibold sm:hidden ${hasSurcharge ? "text-primary" : "text-gray-400"}`}>
                    {v.surcharge.label}
                  </span>
                  {!selectable && v.unavailableReason ? (
                    <span className="mt-0.5 block text-[11px] font-medium text-amber-400">{v.unavailableReason}</span>
                  ) : null}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <span className={`hidden text-[11px] font-semibold sm:block ${hasSurcharge ? "text-primary" : "text-gray-400"}`}>
                    {v.surcharge.label}
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selected ? "border-primary bg-primary text-white" : "border-white/20"
                    }`}
                    aria-hidden="true"
                  >
                    {selected ? (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
