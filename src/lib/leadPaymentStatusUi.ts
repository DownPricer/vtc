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
      return "Totalement remboursé";
    case "PARTIALLY_REFUNDED":
      return "Partiellement remboursé";
    case "REFUND_PENDING":
      return "Remboursement en cours";
    case "REFUND_FAILED":
      return "Remboursement échoué";
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
    case "REFUND_FAILED":
      return "pro-badge pro-badge--refused";
    case "EXPIRED":
      return "pro-badge pro-badge--archived";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
    case "REFUND_PENDING":
      return "pro-badge pro-badge--pending";
    case "PENDING":
      return "pro-badge pro-badge--done";
    case "NONE":
    default:
      return "pro-badge pro-badge--neutral";
  }
}

/** Le paiement a été encaissé (même s'il a ensuite été remboursé en tout ou partie). */
export function isCollectedPaymentStatus(raw?: string | null): boolean {
  return ["PAID", "PARTIALLY_REFUNDED", "REFUND_PENDING", "REFUND_FAILED", "REFUNDED"].includes(raw ?? "");
}

/** Un remboursement peut être demandé depuis l'espace pro pour ce statut de paiement. */
export function isRefundablePaymentStatus(raw?: string | null): boolean {
  return ["PAID", "PARTIALLY_REFUNDED", "REFUND_FAILED"].includes(raw ?? "");
}
