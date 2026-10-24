export function labelLeadPaymentStatus(raw?: string | null): string {
  switch (raw) {
    case "LINK_SENT":
      return "Lien envoyé";
    case "PAID":
      return "Paiement validé";
    case "FAILED":
      return "Échec";
    case "PENDING":
      return "En cours";
    case "EXPIRED":
      return "Expiré";
    case "REFUNDED":
      return "Remboursé";
    case "CANCELLED":
      return "Annulé";
    case "NONE":
    default:
      return "Aucun paiement en ligne";
  }
}

export function leadPaymentStatusBadgeClass(raw?: string | null): string {
  switch (raw) {
    case "PAID":
      return "pro-badge pro-badge--accepted";
    case "LINK_SENT":
      return "pro-badge pro-badge--planned";
    case "FAILED":
    case "CANCELLED":
      return "pro-badge pro-badge--refused";
    case "EXPIRED":
      return "pro-badge pro-badge--archived";
    case "REFUNDED":
      return "pro-badge pro-badge--pending";
    case "PENDING":
      return "pro-badge pro-badge--done";
    case "NONE":
    default:
      return "pro-badge pro-badge--neutral";
  }
}
