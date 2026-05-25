export function labelClientOnlinePaymentPreference(v: unknown): string {
  if (v === true) return "Paiement en ligne demande";
  if (v === false) return "Paiement sur place";
  return "Non renseigne";
}

export function clientOnlinePaymentPreferenceBadgeClass(v: unknown): string {
  if (v === true) return "border-emerald-300 bg-emerald-50 text-emerald-900";
  if (v === false) return "border-slate-300 bg-slate-100 text-slate-800";
  return "border-[var(--pro-border)] bg-[var(--pro-panel-muted)] text-[var(--pro-text-soft)]";
}
