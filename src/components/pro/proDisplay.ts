"use client";

import {
  actionButtonClass,
  buildStatusActionBanner,
  formatDateTime,
  formatPrice,
  formatValue,
  getDisplayName,
  getJourneySummary,
  isUsefulValue,
  labelKind,
  labelStatus,
  mapApiErrorToFr,
  statusActionList,
  statusBadgeClass,
  translateAction,
  translateBooleanish,
  translateKind,
  translatePayment,
  translatePaymentMethod,
  translatePayField,
  translateStatus,
  type PatchStatusResponseMeta,
} from "./proHelpers";

export {
  actionButtonClass,
  buildStatusActionBanner,
  formatDateTime,
  formatPrice,
  formatValue,
  getDisplayName,
  getJourneySummary,
  isUsefulValue,
  labelKind,
  labelStatus,
  mapApiErrorToFr,
  statusActionList,
  statusBadgeClass,
  translateAction,
  translateBooleanish,
  translateKind,
  translatePayment,
  translatePaymentMethod,
  translatePayField,
  translateStatus,
  type PatchStatusResponseMeta,
};

export function formatDateFr(value?: string | null): string {
  return formatDateTime(value);
}

export function getStatusBadgeClass(value?: string | null): string {
  return statusBadgeClass(value);
}
