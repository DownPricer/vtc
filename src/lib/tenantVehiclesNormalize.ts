import type { FeaturedVehicle, TenantSettingsV1, VehicleListItem } from "@/config/tenant-settings.types";

/**
 * Chemins médias déposés depuis le dashboard (évite l’optimiseur Next) :
 * anciens uploads `/uploads/settings/…` et photos de flotte `/media/vehicles/…` (déjà redimensionnées en WebP côté API).
 */
export function isTenantDashboardUploadPath(src: string): boolean {
  const s = src.trim();
  return s.startsWith("/uploads/settings/") || s.startsWith("/media/");
}

export function vehicleToFeatured(v: VehicleListItem): FeaturedVehicle {
  return {
    id: v.id,
    name: v.name,
    headline: v.headline,
    passengerMax: v.passengerMax,
    highlightText: v.highlightText,
    paymentChips: v.paymentChips,
    gallery: v.gallery,
  };
}

/**
 * Garantit `vehicles.items[]`, synchronise `featured` / `featuredVehicleId` avec le véhicule mis en avant (actif).
 * Appeler après fusion des settings (API + défauts) et avant sauvegarde.
 */
export function normalizeTenantVehicles<T extends TenantSettingsV1>(settings: T): T {
  const out = structuredClone(settings) as T;
  const veh = out.vehicles;
  if (!veh?.featured) return out;

  let items: VehicleListItem[] = Array.isArray(veh.items) ? veh.items.map((x) => ({ ...x })) : [];

  if (items.length === 0) {
    items = [{ ...veh.featured, enabled: true, baggageLabel: "" }];
  }

  for (const it of items) {
    if (typeof it.enabled !== "boolean") it.enabled = true;
    if (!Array.isArray(it.gallery)) it.gallery = [];
    // Ancien format uniquement : une flotte issue de la base (`source: "fleet"`) n'emprunte JAMAIS les photos d'un autre véhicule.
    if (it.gallery.length === 0 && veh.source !== "fleet" && veh.featured.gallery?.length) {
      it.gallery = veh.featured.gallery.map((g) => ({ ...g }));
    }
    if (typeof it.passengerMax !== "number" || !Number.isFinite(it.passengerMax)) {
      it.passengerMax = Math.max(1, veh.featured.passengerMax || 1);
    }
  }

  const byId = (id: string) => items.find((x) => x.id === id);
  let spotlight = byId(veh.featuredVehicleId);
  if (!spotlight || !spotlight.enabled) {
    spotlight = items.find((x) => x.enabled) ?? items[0];
  }

  if (spotlight) {
    veh.featured = vehicleToFeatured(spotlight);
    veh.featuredVehicleId = spotlight.id;
  }

  veh.items = items;
  return out;
}

export function getEnabledVehicleItems(t: TenantSettingsV1): VehicleListItem[] {
  return normalizeTenantVehicles(structuredClone(t)).vehicles.items.filter((x) => x.enabled);
}
