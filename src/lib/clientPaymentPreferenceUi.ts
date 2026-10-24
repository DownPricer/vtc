export function labelClientOnlinePaymentPreference(v: unknown): string {
  if (v === true) return "Paiement en ligne demandé";
  if (v === false) return "Paiement sur place";
  return "Non renseigné";
}

export function clientOnlinePaymentPreferenceBadgeClass(v: unknown): string {
  if (v === true) return "pro-badge pro-badge--accepted";
  if (v === false) return "pro-badge pro-badge--archived";
  return "pro-badge pro-badge--neutral";
}
