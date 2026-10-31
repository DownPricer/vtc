/**
 * Codes d'erreur pour lesquels le même `clientRequestId` doit être réutilisé
 * (idempotence remboursement / annulation — ne pas en générer un nouveau).
 */
export const PRESERVE_CLIENT_REQUEST_ID_CODES = [
  "STRIPE_UNCERTAIN",
  "STRIPE_UNREACHABLE",
  "REFUND_UNCERTAIN",
] as const;

export type PreserveClientRequestIdCode = (typeof PRESERVE_CLIENT_REQUEST_ID_CODES)[number];

export function shouldPreserveClientRequestId(code: string | undefined | null): boolean {
  if (!code) return false;
  return (PRESERVE_CLIENT_REQUEST_ID_CODES as readonly string[]).includes(code);
}
