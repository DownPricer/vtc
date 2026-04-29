"use client";

export const kindLabels: Record<string, string> = {
  contact: "Contact",
  devis: "Devis",
  reservation: "Réservation",
  quote: "Devis",
  request: "Demande",
};

export const statusLabels: Record<string, string> = {
  new: "Nouveau",
  pending: "En attente",
  accepted: "Accepté",
  refused: "Refusé",
  processed: "Traité",
  archived: "Archivé",
  completed: "Terminé",
  cancelled: "Annulé",
  expired: "Expiré",
  scheduled: "Planifié",
  refunded: "Remboursé",
  paid: "Payé",
  unpaid: "Non payé",
  failed: "Échoué",
  sent: "Envoyé",
};

export const paymentMethodLabels: Record<string, string> = {
  card: "Carte bancaire",
  carte: "Carte bancaire",
  cash: "Especes",
  especes: "Especes",
  bank_transfer: "Virement",
  transfer: "Virement",
  virement: "Virement",
  stripe: "Carte bancaire",
  cb: "Carte bancaire",
  paypal: "PayPal",
};

export const actionLabels: Record<string, string> = {
  accept: "Accepter",
  refuse: "Refuser",
  process: "Marquer comme traité",
  archive: "Archiver",
  complete: "Terminer",
  cancel: "Annuler",
  schedule: "Planifier",
  back: "Retour",
  view: "Voir",
  save: "Enregistrer",
  loading: "Chargement",
  error: "Erreur",
  logout: "Déconnexion",
  accepted: "Accepter",
  refused: "Refuser",
  processed: "Marquer comme traité",
  scheduled: "Planifier",
  completed: "Terminer",
  cancelled: "Annuler",
  archived: "Archiver",
};

const truthyLabels: Record<string, string> = {
  oui: "Oui",
  non: "Non",
  yes: "Oui",
  no: "Non",
  true: "Oui",
  false: "Non",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  agent: "Agent",
};

const HIDDEN_VALUES = new Set(["n/a", "na", "null", "undefined", "-", "non renseigne", "0", "0.00", "[]", "{}", "false"]);

export type CustomerNotificationMeta = {
  attempted?: boolean;
  sent?: boolean;
  skippedReason?: string;
  error?: string;
};

export type PatchStatusResponseMeta = {
  unchanged?: boolean;
  customerNotification?: CustomerNotificationMeta | null;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isEmptyObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0;
}

export function isUsefulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  if (isEmptyObject(value)) return false;
  const text = String(value).trim();
  if (!text) return false;
  return !HIDDEN_VALUES.has(normalizeText(text));
}

export function isMeaningfulValue(value: unknown): boolean {
  return isUsefulValue(value);
}

export function translateKind(value?: string | null): string {
  const key = normalizeText(value);
  if (!key) return "Demande";
  return kindLabels[key] ?? "Demande";
}

export function translateStatus(value?: string | null): string {
  const key = normalizeText(value);
  if (!key) return "Statut inconnu";
  return statusLabels[key] ?? "Statut inconnu";
}

export function translateAction(value?: string | null): string {
  const key = normalizeText(value);
  if (!key) return "";
  return actionLabels[key] ?? "";
}

export function translatePayment(value?: string | null): string {
  const key = normalizeText(value).replace(/\s+/g, "_");
  if (!key || key === "n/a") return "Non renseigné";
  return paymentMethodLabels[key] ?? statusLabels[key] ?? truthyLabels[key] ?? (isUsefulValue(value) ? String(value).trim() : "Non renseigné");
}

export function translateBooleanish(value?: string | null): string {
  const key = normalizeText(value);
  if (!key) return "";
  return truthyLabels[key] ?? (isUsefulValue(value) ? String(value).trim() : "");
}

export function labelKind(value?: string | null): string {
  return translateKind(value);
}

export function labelStatus(value?: string | null): string {
  return translateStatus(value);
}

export function translatePaymentMethod(value: string): string {
  return translatePayment(value);
}

export function translatePayField(value: string): string {
  return translateBooleanish(value) || translateStatus(value) || "";
}

export function labelOperatorRole(role?: string | null): string {
  const key = normalizeText(role);
  return ROLE_LABELS[key] ?? "Rôle inconnu";
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateFr(value?: string | null): string {
  return formatDateTime(value);
}

export function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatPrice(value: unknown): string {
  if (!isUsefulValue(value)) return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EUR`;
}

export function formatValue(label: string, value: unknown): { label: string; value: string } | null {
  if (!isUsefulValue(value)) return null;
  return { label, value: String(value).trim() };
}

export function statusBadgeClass(status?: string | null): string {
  switch (normalizeText(status)) {
    case "new":
    case "pending":
    case "unpaid":
      return "border-amber-300/50 bg-amber-100 text-amber-900";
    case "accepted":
    case "scheduled":
    case "paid":
    case "sent":
      return "border-emerald-300/60 bg-emerald-100 text-emerald-900";
    case "refused":
    case "cancelled":
    case "failed":
      return "border-rose-300/60 bg-rose-100 text-rose-900";
    case "processed":
    case "completed":
      return "border-sky-300/60 bg-sky-100 text-sky-900";
    case "archived":
    case "refunded":
      return "border-slate-300/60 bg-slate-100 text-slate-700";
    case "expired":
      return "border-orange-300/60 bg-orange-100 text-orange-900";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function getStatusBadgeClass(status?: string | null): string {
  return statusBadgeClass(status);
}

export function actionButtonClass(intent: "primary" | "success" | "danger" | "neutral" | "warning" | "info"): string {
  switch (intent) {
    case "primary":
      return "border border-orange-400 bg-orange-500 text-white hover:bg-orange-600 focus-visible:outline-orange-500";
    case "success":
      return "border border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:outline-emerald-500";
    case "danger":
      return "border border-rose-300 bg-rose-500 text-white hover:bg-rose-600 focus-visible:outline-rose-500";
    case "warning":
      return "border border-amber-300 bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-amber-500";
    case "info":
      return "border border-sky-300 bg-sky-500 text-white hover:bg-sky-600 focus-visible:outline-sky-500";
    default:
      return "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400";
  }
}

export function buildStatusActionBanner(nextStatus: string, kind: string, meta?: PatchStatusResponseMeta | null): string {
  if (meta?.unchanged) {
    return "Le statut est déjà à jour.";
  }

  const normalizedKind = normalizeText(kind);
  const isQuoteOrReservation = normalizedKind === "devis" || normalizedKind === "reservation";
  const notif = meta?.customerNotification;

  const base: Record<string, string> = {
    accepted: "La demande a été acceptée.",
    refused: "La demande a été refusée.",
    processed: "La demande a été marquée comme traitée.",
    scheduled: "La demande a été planifiée.",
    completed: "La demande a été terminée.",
    cancelled: "La demande a été annulée.",
    archived: "La demande a été archivée.",
  };

  let msg = base[normalizeText(nextStatus)] ?? "Mise à jour enregistrée.";
  const mailRelevant = isQuoteOrReservation && ["accepted", "refused"].includes(normalizeText(nextStatus));

  if (mailRelevant && notif) {
    if (notif.attempted && notif.sent) {
      msg += " Le client a été notifié par e-mail.";
    } else if (notif.attempted && !notif.sent) {
      msg = msg.replace(/\.$/, "") + ", mais l'e-mail client n'a pas pu être envoyé.";
    } else if (notif.skippedReason === "no_client_email") {
      msg += " Aucun e-mail client valide n'est renseigné.";
    }
  }

  return msg;
}

export function statusActionList(status: string, kind: string): Array<{ action: string; nextStatus: string; intent: "success" | "danger" | "info" | "warning" | "neutral" }> {
  const normalizedStatus = normalizeText(status);
  const normalizedKind = normalizeText(kind);
  const out: Array<{ action: string; nextStatus: string; intent: "success" | "danger" | "info" | "warning" | "neutral" }> = [];

  if (["new", "pending"].includes(normalizedStatus)) {
    out.push({ action: "accept", nextStatus: "accepted", intent: "success" });
    out.push({ action: "refuse", nextStatus: "refused", intent: "danger" });
  }
  if (normalizedKind && !["refused", "cancelled", "archived", "expired", "processed"].includes(normalizedStatus)) {
    out.push({ action: "process", nextStatus: "processed", intent: "info" });
  }
  if (normalizedKind !== "contact" && normalizedStatus === "accepted") {
    out.push({ action: "schedule", nextStatus: "scheduled", intent: "warning" });
  }
  if (normalizedKind !== "contact" && ["accepted", "scheduled"].includes(normalizedStatus)) {
    out.push({ action: "complete", nextStatus: "completed", intent: "success" });
  }
  if (!["refused", "cancelled", "archived", "expired"].includes(normalizedStatus)) {
    out.push({ action: "cancel", nextStatus: "cancelled", intent: "danger" });
  }
  if (["processed", "completed"].includes(normalizedStatus)) {
    out.push({ action: "archive", nextStatus: "archived", intent: "neutral" });
  }
  return out;
}

export function mapApiErrorToFr(message: string): string {
  const normalized = normalizeText(message);
  if (normalized.includes("failed to fetch") || normalized.includes("networkerror") || normalized.includes("load failed")) {
    return "Impossible de contacter le serveur. Vérifiez votre connexion.";
  }
  if (normalized.includes("unauthorized") || normalized.includes("401")) {
    return "Session expirée ou accès refusé. Reconnectez-vous.";
  }
  if (normalized.includes("forbidden") || normalized.includes("403")) {
    return "Accès refusé pour cette action.";
  }
  if (normalized.includes("not found") || normalized.includes("404")) {
    return "Ressource introuvable.";
  }
  if (normalized === "erreur api" || normalized === "api error") {
    return "Une erreur s'est produite. Réessayez dans un instant.";
  }
  return message;
}

export function getJourneySummary(flatPayload?: Record<string, unknown> | null): string {
  if (!flatPayload) return "";
  const summary = flatPayload.ResumeTrajet ?? flatPayload["RésuméTrajet"];
  return isUsefulValue(summary) ? String(summary).trim() : "";
}

export function getDisplayName(name?: string | null): string {
  return isUsefulValue(name) ? String(name).trim() : "Client non renseigné";
}
