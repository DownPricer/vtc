import { getCentralApiConfig } from "./centralApi";

export type PublicVehicleSurcharge = {
  mode: "none" | "fixed" | "per_km" | "percent_km";
  value: number;
  /** Libellé prêt à afficher (« +50 € sur votre trajet », « +0,30 €/km », « Tarif standard »…). */
  label: string;
};

export type PublicVehicleOption = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  shortDescription: string;
  passengerMax: number;
  luggageLabel: string | null;
  largeBags: number | null;
  airConditioning: boolean;
  wifi: boolean;
  usbChargers: boolean;
  babySeats: boolean;
  accessible: boolean;
  features: string[];
  surcharge: PublicVehicleSurcharge;
  photos: Array<{ src: string; alt: string }>;
  /** Fournis par `vehicle-availability` (libre ce jour-là / compatible avec le groupe). */
  available: boolean;
  fits: boolean;
  unavailableReason: string | null;
};

export type VehicleAvailabilityQuery = {
  /** `YYYY-MM-DD` */
  date?: string;
  dateEnd?: string;
  passengers?: number;
  bags?: number;
};

/**
 * Véhicules proposés + disponibilité à la date demandée. Informatif : rien n'est réservé,
 * l'API revérifie la disponibilité à la création du devis puis à l'acceptation.
 */
export async function fetchVehicleOptions(
  q: VehicleAvailabilityQuery,
  signal?: AbortSignal
): Promise<PublicVehicleOption[]> {
  const cfg = getCentralApiConfig();
  if (!cfg) return [];
  const params = new URLSearchParams();
  if (q.date) params.set("date", q.date);
  if (q.dateEnd) params.set("dateEnd", q.dateEnd);
  if (q.passengers != null) params.set("passengers", String(q.passengers));
  if (q.bags != null) params.set("bags", String(q.bags));
  const res = await fetch(`${cfg.baseUrl}/api/public/vehicle-availability?${params.toString()}`, {
    headers: {
      "X-Tenant-ID": cfg.tenantId,
      ...(typeof window !== "undefined" ? { "X-Site-Domain": window.location.hostname } : {}),
    },
    signal,
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: PublicVehicleOption[] } | null;
  return json?.success && Array.isArray(json.data) ? json.data : [];
}
