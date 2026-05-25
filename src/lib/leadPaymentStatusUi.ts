export function labelLeadPaymentStatus(raw?: string | null): string {
  switch (raw) {
    case "LINK_SENT":
      return "Lien envoye";
    case "PAID":
      return "Paiement valide";
    case "FAILED":
      return "Echec";
    case "PENDING":
      return "En cours";
    case "EXPIRED":
      return "Expire";
    case "REFUNDED":
      return "Rembourse";
    case "CANCELLED":
      return "Annule";
    case "NONE":
    default:
      return "Aucun paiement en ligne";
  }
}

export function leadPaymentStatusBadgeClass(raw?: string | null): string {
  switch (raw) {
    case "PAID":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";
    case "LINK_SENT":
      return "border-violet-300 bg-violet-50 text-violet-900";
    case "FAILED":
      return "border-rose-300 bg-rose-50 text-rose-800";
    case "EXPIRED":
      return "border-slate-300 bg-slate-100 text-slate-700";
    case "CANCELLED":
      return "border-orange-300 bg-orange-50 text-orange-900";
    case "REFUNDED":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "PENDING":
      return "border-sky-300 bg-sky-50 text-sky-900";
    case "NONE":
    default:
      return "border-[var(--pro-border)] bg-[var(--pro-panel-muted)] text-[var(--pro-text-soft)]";
  }
}
