/**
 * Validation / bornage des champs contact (anti injection d'en-têtes SMTP).
 */

const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_PHONE = 40;
const MAX_COMMENT = 4000;
const MAX_ORG = 120;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripNewlines(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

export type ContactClientInput = {
  nom?: unknown;
  prenom?: unknown;
  email?: unknown;
  telephone?: unknown;
  organisation?: unknown;
};

export type ValidatedContact = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  organisation?: string;
  commentaires: string;
};

export function validateContactBody(body: unknown):
  | { ok: true; data: ValidatedContact }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Requête invalide." };
  }
  const o = body as Record<string, unknown>;
  const client = (o.client && typeof o.client === "object" ? o.client : {}) as ContactClientInput;
  const nom = stripNewlines(String(client.nom ?? "")).slice(0, MAX_NAME);
  const prenom = stripNewlines(String(client.prenom ?? "")).slice(0, MAX_NAME);
  const email = stripNewlines(String(client.email ?? "")).slice(0, MAX_EMAIL).toLowerCase();
  const telephone = stripNewlines(String(client.telephone ?? "")).slice(0, MAX_PHONE);
  const organisationRaw = client.organisation != null ? stripNewlines(String(client.organisation)).slice(0, MAX_ORG) : "";
  const commentaires = String(o.commentaires ?? "").slice(0, MAX_COMMENT).trim();

  if (!nom || !prenom || !email || !telephone) {
    return { ok: false, message: "Champs requis manquants." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Adresse e-mail invalide." };
  }

  return {
    ok: true,
    data: {
      nom,
      prenom,
      email,
      telephone,
      ...(organisationRaw ? { organisation: organisationRaw } : {}),
      commentaires,
    },
  };
}
