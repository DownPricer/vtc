import { proAuthenticatedFetch } from "@/lib/proApi";
import { parseProData, ProPaymentsApiError } from "@/lib/proPaymentsClient";

export { ProPaymentsApiError as ProVehicleApiError };

export type SurchargeMode = "none" | "fixed" | "per_km" | "percent_km";

export type ProVehiclePhoto = { id: string; url: string; alt: string; position: number };

export type ProVehicle = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  trim: string | null;
  year: number | null;
  vehicleType: string | null;
  category: string | null;
  shortDescription: string;
  description: string | null;
  active: boolean;
  archived: boolean;
  featured: boolean;
  passengerMax: number;
  luggageLabel: string | null;
  largeBags: number | null;
  airConditioning: boolean;
  wifi: boolean;
  usbChargers: boolean;
  babySeats: boolean;
  accessible: boolean;
  features: string[];
  paymentChips: string[];
  internalRef: string | null;
  licensePlate: string | null;
  surchargeMode: SurchargeMode;
  surchargeValue: number;
  surchargeDescription: string;
  photos: ProVehiclePhoto[];
  photoCount: number;
  maxPhotos: number;
};

export type VehicleWritePayload = Partial<
  Pick<
    ProVehicle,
    | "name" | "brand" | "model" | "trim" | "year" | "vehicleType" | "category" | "shortDescription" | "description"
    | "active" | "passengerMax" | "luggageLabel" | "largeBags" | "airConditioning" | "wifi" | "usbChargers"
    | "babySeats" | "accessible" | "features" | "paymentChips" | "internalRef" | "licensePlate"
    | "surchargeMode" | "surchargeValue"
  >
>;

export type VehicleBlock = {
  id: string;
  vehicleId: string;
  startDay: string;
  endDay: string;
  reason: "maintenance" | "repair" | "leave" | "immobilized" | "other";
  note: string | null;
};

export type CalendarOccupation = {
  id: string;
  vehicleId: string;
  day: string;
  leadId: string | null;
  blockId: string | null;
  block: { reason: VehicleBlock["reason"]; note: string | null } | null;
};

export type CalendarLead = {
  id: string;
  clientName: string;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  flatPayload: Record<string, unknown> | null;
};

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  return parseProData<T>(await proAuthenticatedFetch(path, init));
}

export const listProVehicles = (includeArchived = false) =>
  call<ProVehicle[]>(`/pro/vehicles${includeArchived ? "?archived=1" : ""}`);
export const getProVehicle = (id: string) => call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}`);
export const createProVehicle = (payload: VehicleWritePayload) =>
  call<ProVehicle>("/pro/vehicles", { method: "POST", ...json(payload) });
export const updateProVehicle = (id: string, payload: VehicleWritePayload) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}`, { method: "PATCH", ...json(payload) });
export const featureProVehicle = (id: string) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/featured`, { method: "POST" });
export const archiveProVehicle = (id: string) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/archive`, { method: "POST" });
export const restoreProVehicle = (id: string) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/restore`, { method: "POST" });

export function addVehiclePhoto(id: string, file: File, alt?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (alt) fd.append("alt", alt);
  return call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/photos`, { method: "POST", body: fd });
}
export function replaceVehiclePhoto(id: string, photoId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`, {
    method: "PUT",
    body: fd,
  });
}
export const removeVehiclePhoto = (id: string, photoId: string) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`, { method: "DELETE" });
export const reorderVehiclePhotos = (id: string, order: string[]) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/photos/order`, { method: "PUT", ...json({ order }) });
export const updateVehiclePhotoAlt = (id: string, photoId: string, alt: string) =>
  call<ProVehicle>(`/pro/vehicles/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`, {
    method: "PATCH",
    ...json({ alt }),
  });

export const listVehicleBlocks = (id: string) => call<VehicleBlock[]>(`/pro/vehicles/${encodeURIComponent(id)}/blocks`);
export const createVehicleBlock = (
  id: string,
  payload: { startDay: string; endDay: string; reason: VehicleBlock["reason"]; note?: string }
) => call<VehicleBlock>(`/pro/vehicles/${encodeURIComponent(id)}/blocks`, { method: "POST", ...json(payload) });
export const deleteVehicleBlock = (blockId: string) =>
  call<{ deleted: boolean }>(`/pro/vehicle-blocks/${encodeURIComponent(blockId)}`, { method: "DELETE" });

export const getVehicleCalendar = (from: string, to: string, vehicleId?: string) =>
  call<{ occupations: CalendarOccupation[]; leads: CalendarLead[] }>(
    `/pro/vehicle-calendar?from=${from}&to=${to}${vehicleId ? `&vehicleId=${encodeURIComponent(vehicleId)}` : ""}`
  );

export const changeLeadVehicle = (leadId: string, vehicleId: string | null, note?: string) =>
  call<{ priceBefore: number; priceAfter: number; vehicleId: string | null }>(
    `/pro/demandes/${encodeURIComponent(leadId)}/vehicle`,
    { method: "PATCH", ...json({ vehicleId, ...(note ? { note } : {}) }) }
  );

export const SURCHARGE_LABELS: Record<SurchargeMode, string> = {
  none: "Aucun supplément",
  fixed: "Montant fixe",
  per_km: "Montant par kilomètre",
  percent_km: "Pourcentage sur la composante kilométrique",
};

export function surchargeShort(v: Pick<ProVehicle, "surchargeMode" | "surchargeValue">): string {
  const n = String(v.surchargeValue).replace(".", ",");
  switch (v.surchargeMode) {
    case "fixed":
      return `+${n} €`;
    case "per_km":
      return `+${n} €/km`;
    case "percent_km":
      return `+${n} % km`;
    default:
      return "Aucun";
  }
}

export const BLOCK_REASON_LABELS: Record<VehicleBlock["reason"], string> = {
  maintenance: "Entretien",
  repair: "Réparation",
  leave: "Congés",
  immobilized: "Immobilisation",
  other: "Autre",
};
