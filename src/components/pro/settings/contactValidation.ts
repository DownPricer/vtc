import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactSection(contact: TenantSettingsV1["contact"]): Record<string, string> {
  const err: Record<string, string> = {};
  if (!contact.phoneDisplay.trim()) {
    err.phoneDisplay = "Le téléphone affiché est obligatoire.";
  }
  const e164 = contact.phoneE164.trim();
  if (e164 && !e164.startsWith("+")) {
    err.phoneE164 = "Le format E.164 doit commencer par « + ».";
  }
  const mail = contact.emailPublic.trim();
  if (mail && !EMAIL_RE.test(mail)) {
    err.emailPublic = "Adresse e-mail invalide.";
  }
  return err;
}
