import { siteConfig } from "@/config/site.config";
import { getPublicSiteUrl } from "@/lib/siteUrl";

/**
 * Gabarit e-mail aligné sur vtc-core-api/src/modules/email/formatLeadEmail.ts
 * (mêmes briques HTML). Ici seuls les e-mails contact / devis / réservation sont exposés.
 */
type TenantConfig = {
  company: { name: string };
  branding?: { siteUrl?: string };
};

function currentTenant(): TenantConfig {
  return {
    company: { name: siteConfig.commercialName },
    branding: { siteUrl: getPublicSiteUrl() },
  };
}

const THEME = {
  pageBg: "#eef2f6",
  cardBg: "#ffffff",
  cardAlt: "#f8fafc",
  headerBg: "#111827",
  accent: "#f97316",
  accentDark: "#ea580c",
  accentSoft: "#fff4ec",
  text: "#172033",
  textSoft: "#475569",
  textMuted: "#64748b",
  border: "#e2e8f0",
  success: "#15803d",
  successBg: "#ecfdf3",
  successBorder: "#bbf7d0",
  danger: "#b91c1c",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  warning: "#9a3412",
  warningBg: "#fff7ed",
  warningBorder: "#fed7aa",
} as const;

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

type SectionId = "meta" | "client" | "trip" | "pricing" | "comment";

type RowDef = {
  key: string;
  label: string;
  value: string;
  section: SectionId;
};

type Fact = { label: string; value: string; emphasis?: boolean };

type Leg = { title: string; from: string; to: string; note?: string };

type ButtonVariant = "primary" | "secondary";

const SECTION_ORDER: SectionId[] = ["meta", "client", "trip", "pricing", "comment"];

const SECTION_TITLES: Record<SectionId, string> = {
  meta: "Demande",
  client: "Client",
  trip: "Prestation et trajet",
  pricing: "Tarif et paiement",
  comment: "Commentaire",
};

const FIELD_LABELS: Record<string, string> = {
  LeadId: "Référence interne",
  ID: "Référence dossier",
  TypeDemande: "Type de demande",
  Statut: "Statut",
  Prenom: "Prénom",
  Nom: "Nom",
  Telephone: "Téléphone",
  Email: "E-mail",
  Societe: "Société",
  NomSociete: "Société",
  Organisation: "Organisation",
  TypeService: "Type de service",
  TypeTrajet: "Type de trajet",
  Date: "Date",
  Heure: "Heure",
  DateAller: "Date aller",
  HeureAller: "Heure aller",
  DateRetour: "Date retour",
  HeureRetour: "Heure retour",
  AdresseDepart: "Adresse de départ",
  "AdresseDépart": "Adresse de départ",
  AdresseArrivee: "Adresse d'arrivée",
  "AdresseArrivée": "Adresse d'arrivée",
  AdresseDepart_1: "Départ",
  AdresseArrivee_1: "Arrivée",
  AdresseDepart_2: "Départ retour",
  AdresseArrivee_2: "Arrivée retour",
  Aeroport: "Aéroport",
  Passagers: "Passagers",
  NombrePassagers: "Passagers",
  Bagages: "Bagages",
  BagagesAller: "Bagages aller",
  BagagesRetour: "Bagages retour",
  Commentaires: "Commentaire client",
  Observations: "Commentaire client",
  TarifTotal: "Tarif total",
  "Payé": "Paiement reçu",
  Paye: "Paiement reçu",
  PaymentMethode: "Mode de paiement",
  "RésuméTrajet": "Résumé du trajet",
  ResumeTrajet: "Résumé du trajet",
  LieuEvenement: "Lieu de l'événement",
  HeuresMAD: "Durée M.A.D.",
  HeuresMADEvenementiel: "Durée M.A.D. événement",
  AllerNumeroVol: "Numéro de vol aller",
  AllerHeureVol: "Horaire vol aller",
  RetourNumeroVol: "Numéro de vol retour",
  RetourHeureVol: "Horaire vol retour",
  Options: "Options",
  NombreInvites: "Invités",
};

const ALLOWED_FIELDS = new Set(Object.keys(FIELD_LABELS));

const KEYS_SKIP_IN_ROWS = new Set(["DashboardLink"]);

/** Adresses affichées dans le bloc itinéraire du HTML (elles restent dans la version texte). */
const ROUTE_KEYS = new Set([
  "AdresseDepart_1",
  "AdresseArrivee_1",
  "AdresseDepart_2",
  "AdresseArrivee_2",
  "AdresseDepart",
  "AdresseDépart",
  "AdresseArrivee",
  "AdresseArrivée",
]);

const SUMMARY_KEYS = new Set(["RésuméTrajet", "ResumeTrajet"]);

const KEY_ORDER: Record<SectionId, string[]> = {
  meta: ["LeadId", "ID", "TypeDemande", "Statut"],
  client: ["Organisation", "NomSociete", "Societe", "Prenom", "Nom", "Telephone", "Email"],
  trip: [
    "TypeService",
    "TypeTrajet",
    "RésuméTrajet",
    "ResumeTrajet",
    "DateAller",
    "HeureAller",
    "DateRetour",
    "HeureRetour",
    "Date",
    "Heure",
    "AdresseDepart_1",
    "AdresseArrivee_1",
    "AdresseDepart_2",
    "AdresseArrivee_2",
    "AdresseDepart",
    "AdresseDépart",
    "AdresseArrivee",
    "AdresseArrivée",
    "Aeroport",
    "LieuEvenement",
    "HeuresMAD",
    "HeuresMADEvenementiel",
    "AllerNumeroVol",
    "AllerHeureVol",
    "RetourNumeroVol",
    "RetourHeureVol",
    "NombrePassagers",
    "Passagers",
    "BagagesAller",
    "BagagesRetour",
    "Bagages",
    "NombreInvites",
    "Options",
  ],
  pricing: ["TarifTotal", "Payé", "Paye", "PaymentMethode"],
  comment: ["Commentaires", "Observations"],
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function publicSiteUrl(tenant: TenantConfig): string {
  return tenant.branding?.siteUrl?.trim() || "https://localhost";
}

function brandName(tenant: TenantConfig): string {
  return tenant.company.name.trim();
}

function telHref(phone: string): string {
  return `tel:${esc(phone.replace(/\s/g, ""))}`;
}

function money(value: string): string {
  const amount = Number(String(value).replace(",", "."));
  if (Number.isNaN(amount) || amount <= 0) return "";
  return `${amount.toLocaleString("fr-FR", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} €`;
}

function looksLikeIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function formatDateValue(value: string): string {
  if (!looksLikeIsoDate(value)) return value;
  const [year, month, day] = value.trim().split("-");
  return `${day}/${month}/${year}`;
}

function translateKind(value: string): string {
  const key = normalize(value);
  if (key === "contact") return "Contact";
  if (key === "devis" || key === "quote") return "Devis";
  if (key === "reservation") return "Réservation";
  if (key === "request") return "Demande";
  return "Demande";
}

function translateStatus(value: string): string {
  const key = normalize(value);
  const map: Record<string, string> = {
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
  return map[key] || value.trim();
}

function translatePaymentMethod(value: string): string {
  const key = normalize(value).replace(/\s+/g, "_");
  const map: Record<string, string> = {
    card: "Carte bancaire",
    carte: "Carte bancaire",
    stripe: "Carte bancaire",
    cash: "Espèces",
    especes: "Espèces",
    bank_transfer: "Virement",
    transfer: "Virement",
    virement: "Virement",
    paypal: "PayPal",
    paid: "Payé",
    unpaid: "Non payé",
    pending: "En attente",
    refunded: "Remboursé",
    failed: "Échoué",
  };
  return map[key] || value;
}

function translateBooleanish(value: string): string {
  const key = normalize(value);
  if (["oui", "yes", "true", "paid"].includes(key)) return "Oui";
  if (["non", "no", "false", "unpaid"].includes(key)) return "Non";
  return value;
}

function isMeaningfulValue(value: string | undefined): boolean {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  if (!text) return false;
  const key = normalize(text);
  return ![
    "n/a",
    "na",
    "null",
    "undefined",
    "non renseigne",
    "0",
    "0.00",
    "false",
    "[]",
    "{}",
    '""',
    "aucun extra selectionne",
    "aucune",
  ].includes(key);
}

function mapValue(key: string, rawValue: string): string {
  const value = rawValue.trim();
  if (key === "TypeDemande") return translateKind(value);
  if (key === "Statut") return translateStatus(value);
  if (key === "PaymentMethode") return translatePaymentMethod(value);
  if (key === "Payé" || key === "Paye") return translateBooleanish(value);
  if (key === "TarifTotal") return money(value);
  if (key.startsWith("Date")) return formatDateValue(value);
  return value;
}

function sectionForKey(key: string): SectionId {
  if (["LeadId", "ID", "TypeDemande", "Statut"].includes(key)) return "meta";
  if (["Prenom", "Nom", "Telephone", "Email", "Societe", "NomSociete", "Organisation"].includes(key)) return "client";
  if (["TarifTotal", "Payé", "Paye", "PaymentMethode"].includes(key)) return "pricing";
  if (["Commentaires", "Observations"].includes(key)) return "comment";
  return "trip";
}

function buildRowDefs(flat: Record<string, string>): RowDef[] {
  const rows: RowDef[] = [];
  const usedLabels = new Set<string>();

  const companyFromNom = isMeaningfulValue(flat.NomSociete) ? flat.NomSociete.trim() : "";
  const companyFromSoc = isMeaningfulValue(flat.Societe) ? flat.Societe.trim() : "";
  const company = companyFromNom || companyFromSoc;

  for (const [key, rawValue] of Object.entries(flat)) {
    if (KEYS_SKIP_IN_ROWS.has(key)) continue;
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (key === "NomSociete" || key === "Societe") continue;
    if (!isMeaningfulValue(rawValue)) continue;
    if (key === "Organisation" && normalize(rawValue) === "particulier") continue;

    const value = mapValue(key, rawValue);
    if (!isMeaningfulValue(value)) continue;

    const label = FIELD_LABELS[key] || key;
    if (usedLabels.has(label)) continue;
    usedLabels.add(label);

    rows.push({ key, label, value, section: sectionForKey(key) });
  }

  if (company && !usedLabels.has("Société")) {
    rows.push({
      key: "NomSociete",
      label: "Société",
      value: company,
      section: "client",
    });
  }

  if (isMeaningfulValue(flat.LeadId) && isMeaningfulValue(flat.ID) && flat.LeadId.trim() === flat.ID.trim()) {
    return rows.filter((row) => row.key !== "ID");
  }

  return rows;
}

function sortRows(section: SectionId, rows: RowDef[]): RowDef[] {
  const order = KEY_ORDER[section];
  return [...rows].sort((a, b) => {
    const aIndex = order.indexOf(a.key);
    const bIndex = order.indexOf(b.key);
    const aRank = aIndex === -1 ? 999 : aIndex;
    const bRank = bIndex === -1 ? 999 : bIndex;
    return aRank - bRank || a.label.localeCompare(b.label);
  });
}

/* -------------------------------------------------------------------------- */
/*  Briques HTML                                                              */
/* -------------------------------------------------------------------------- */

function valueHtml(row: RowDef): string {
  if (row.key === "Telephone" || row.key === "vtc-tel") {
    return `<a class="lnk" href="${telHref(row.value)}" style="color:${THEME.accentDark};text-decoration:none;font-weight:700">${esc(row.value)}</a>`;
  }
  if (row.key === "Email" || row.key === "vtc-mail") {
    return `<a class="lnk" href="mailto:${esc(row.value)}" style="color:${THEME.accentDark};text-decoration:none;font-weight:700">${esc(row.value)}</a>`;
  }
  return esc(row.value);
}

function eyebrowHtml(text: string): string {
  return `<div class="eyebrow" style="font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${THEME.accentDark}">${esc(text)}</div>`;
}

function rowTableHtml(rows: RowDef[]): string {
  if (!rows.length) return "";
  const lastIndex = rows.length - 1;
  const body = rows
    .map((row, index) => {
      const border = index === lastIndex ? "none" : `1px solid ${THEME.border}`;
      return `<tr>
<td class="row-label t-muted bd" width="38%" style="padding:11px 12px 11px 0;border-bottom:${border};font-size:13px;line-height:1.5;color:${THEME.textMuted};vertical-align:top">${esc(row.label)}</td>
<td class="row-value t-main bd" style="padding:11px 0;border-bottom:${border};font-size:14px;line-height:1.5;color:${THEME.text};font-weight:600;vertical-align:top;word-break:break-word">${valueHtml(row)}</td>
</tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${body}</table>`;
}

function cardHtml(title: string, inner: string): string {
  if (!inner) return "";
  return `<tr>
<td class="px" style="padding:0 32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-alt bd" style="border-collapse:separate;background:${THEME.cardAlt};border:1px solid ${THEME.border};border-radius:14px">
    <tr><td style="padding:16px 18px 6px">${eyebrowHtml(title)}</td></tr>
    <tr><td style="padding:0 18px 10px">${inner}</td></tr>
  </table>
</td>
</tr>`;
}

function cardSectionHtml(title: string, rows: RowDef[]): string {
  if (!rows.length) return "";
  return cardHtml(title, rowTableHtml(rows));
}

function commentCardHtml(title: string, text: string): string {
  return cardHtml(
    title,
    `<p class="t-main" style="margin:2px 0 8px;font-size:14px;line-height:1.7;color:${THEME.text};word-break:break-word;white-space:pre-line">${esc(text)}</p>`
  );
}

function legHtml(leg: Leg): string {
  const dot = (color: string) =>
    `<div style="width:10px;height:10px;border-radius:5px;background:${color};font-size:0;line-height:0">&nbsp;</div>`;
  const place = (caption: string, address: string) =>
    `<div class="t-muted" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${THEME.textMuted};font-weight:700">${caption}</div>
     <div class="t-main" style="margin-top:2px;font-size:15px;line-height:1.45;color:${THEME.text};font-weight:600;word-break:break-word">${esc(address)}</div>`;
  const note = leg.note
    ? `<tr><td></td><td style="padding:8px 0 0 12px"><span class="t-soft" style="font-size:12px;color:${THEME.textSoft}">${esc(leg.note)}</span></td></tr>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:2px 0 10px">
    ${leg.title ? `<tr><td colspan="2" style="padding:0 0 8px;font-size:12px;font-weight:800;color:${THEME.accentDark}">${esc(leg.title)}</td></tr>` : ""}
    <tr>
      <td width="10" valign="top" style="padding:5px 0 0">${dot(THEME.accent)}</td>
      <td style="padding:0 0 0 12px">${place("Départ", leg.from)}</td>
    </tr>
    <tr>
      <td width="10" style="padding:3px 0 3px 4px"><div style="width:0;height:20px;border-left:2px dotted #cbd5e1;font-size:0;line-height:0">&nbsp;</div></td>
      <td></td>
    </tr>
    <tr>
      <td width="10" valign="top" style="padding:5px 0 0">${dot(THEME.headerBg)}</td>
      <td style="padding:0 0 0 12px">${place("Arrivée", leg.to)}</td>
    </tr>
    ${note}
  </table>`;
}

function pickValue(flat: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = flat[key];
    if (isMeaningfulValue(value)) return value.trim();
  }
  return "";
}

function legsFromFlat(flat: Record<string, string>): Leg[] {
  const legs: Leg[] = [];
  const outFrom = pickValue(flat, "AdresseDepart_1", "AdresseDepart", "AdresseDépart");
  const outTo = pickValue(flat, "AdresseArrivee_1", "AdresseArrivee", "AdresseArrivée");
  const backFrom = pickValue(flat, "AdresseDepart_2");
  const backTo = pickValue(flat, "AdresseArrivee_2");

  if (outFrom && outTo) legs.push({ title: "Aller", from: outFrom, to: outTo });
  if (backFrom && backTo) legs.push({ title: "Retour", from: backFrom, to: backTo });
  if (legs.length === 1) legs[0].title = "";
  return legs;
}

/** « A → B — Aller simple » ou « A -> B » vers un trajet affichable. */
function legFromSummary(summary: string): Leg | null {
  const parts = summary.split(/\s*(?:→|->)\s*/);
  if (parts.length !== 2) return null;
  const from = parts[0].trim();
  const rest = parts[1].split(/\s+[—–]\s+/);
  const to = rest[0].trim();
  if (!from || !to) return null;
  const note = rest.slice(1).join(" — ").trim();
  return { title: "", from, to, note: note || undefined };
}

function factsHtml(facts: Fact[]): string {
  if (!facts.length) return "";
  const width = Math.floor(100 / facts.length);
  const cells = facts
    .map(
      (fact) => `<td class="stack" width="${width}%" valign="top" style="padding:0 4px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-alt bd" style="border-collapse:separate;background:${THEME.cardAlt};border:1px solid ${THEME.border};border-radius:12px">
          <tr><td style="padding:12px 14px">
            <div class="t-muted" style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.textMuted};font-weight:700">${esc(fact.label)}</div>
            <div class="${fact.emphasis ? "t-accent" : "t-main"}" style="margin-top:5px;font-size:${fact.emphasis ? "22px" : "15px"};line-height:1.3;color:${fact.emphasis ? THEME.accentDark : THEME.text};font-weight:800;word-break:break-word">${esc(fact.value)}</div>
          </td></tr>
        </table>
      </td>`
    )
    .join("");

  return `<tr>
<td class="px-facts" style="padding:6px 28px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>${cells}</tr></table>
</td>
</tr>`;
}

function badgeHtml(label: string, tone: "accent" | "success" | "danger"): string {
  const styles =
    tone === "success"
      ? `background:${THEME.successBg};color:${THEME.success};border:1px solid ${THEME.successBorder};`
      : tone === "danger"
        ? `background:${THEME.dangerBg};color:${THEME.danger};border:1px solid ${THEME.dangerBorder};`
        : `background:${THEME.warningBg};color:${THEME.warning};border:1px solid ${THEME.warningBorder};`;

  return `<span style="display:inline-block;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;${styles}">${esc(label)}</span>`;
}

function buttonHtml(label: string, href: string, variant: ButtonVariant = "primary"): string {
  const style =
    variant === "primary"
      ? `background:${THEME.accent};color:#ffffff;border:2px solid ${THEME.accent};`
      : `background:#ffffff;color:${THEME.accentDark};border:2px solid ${THEME.accent};`;
  return `<a class="btn${variant === "secondary" ? " btn-ghost" : ""}" href="${esc(href)}" style="display:inline-block;${style}text-decoration:none;padding:13px 24px;border-radius:12px;font-size:15px;line-height:1.2;font-weight:700;margin:0 4px 8px">${esc(label)}</a>`;
}

function actionsRowHtml(buttons: string[], align: "left" | "center" = "left"): string {
  const content = buttons.filter(Boolean).join("");
  if (!content) return "";
  return `<tr><td class="px" align="${align}" style="padding:12px 28px 14px;text-align:${align}">${content}</td></tr>`;
}

const EMAIL_CSS = `
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  a { word-break:break-word; }
  @media only screen and (max-width:540px) {
    .px { padding-left:18px !important; padding-right:18px !important; }
    .px-facts { padding-left:14px !important; padding-right:14px !important; }
    .stack { display:block !important; width:100% !important; box-sizing:border-box; }
    .h1 { font-size:24px !important; }
    .btn { display:block !important; margin:0 0 10px !important; text-align:center !important; }
    .row-label { display:block !important; width:100% !important; padding:11px 0 0 !important; border-bottom:0 !important; }
    .row-value { display:block !important; width:100% !important; padding:2px 0 11px !important; }
    .outer { padding:12px 8px !important; }
  }
  @media (prefers-color-scheme: dark) {
    body, .bg-page { background:#0b1120 !important; }
    .bg-card { background:#111827 !important; border-color:#273449 !important; }
    .bg-alt { background:#182236 !important; border-color:#273449 !important; }
    .bg-accent { background:#2a1a10 !important; border-color:#7c3a12 !important; }
    .bd { border-color:#273449 !important; }
    .t-main { color:#f1f5f9 !important; }
    .t-soft { color:#cbd5e1 !important; }
    .t-muted { color:#94a3b8 !important; }
    .t-accent, .eyebrow, .lnk { color:#fb923c !important; }
    .btn-ghost { background:transparent !important; color:#fb923c !important; }
    .foot { background:#0f172a !important; border-color:#273449 !important; }
  }
`;

function shellHtml(opts: {
  preheader: string;
  brand: string;
  badge: string;
  title: string;
  intro: string;
  bodyBlocks: string;
  /** Boutons placés juste sous l'introduction (actions prioritaires). */
  actionsTop?: string[];
  /** Boutons placés en fin de message (liens secondaires). */
  actionsBottom?: string[];
  reference?: string;
  footerSite: string;
  footerText: string;
}): string {
  const reference = opts.reference
    ? `<span class="t-muted" style="display:inline-block;margin-left:10px;font-size:12px;color:${THEME.textMuted};letter-spacing:0.03em;vertical-align:middle">Réf. ${esc(opts.reference)}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>${esc(opts.title)}</title>
<style>${EMAIL_CSS}</style>
</head>
<body class="bg-page" style="margin:0;padding:0;background:${THEME.pageBg};font-family:${FONT}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${THEME.pageBg}">${esc(opts.preheader)}${"&zwnj;&nbsp;".repeat(30)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-page outer" style="background:${THEME.pageBg};padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-card" style="max-width:600px;background:${THEME.cardBg};border:1px solid ${THEME.border};border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08)">
          <tr><td bgcolor="${THEME.accent}" style="height:4px;background:${THEME.accent};font-size:0;line-height:0">&nbsp;</td></tr>
          <tr>
            <td class="px" bgcolor="${THEME.headerBg}" style="padding:20px 32px;background:${THEME.headerBg}">
              <div style="font-size:16px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#ffffff">${esc(opts.brand)}</div>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:30px 32px 8px">
              <div>${opts.badge}${reference}</div>
              <h1 class="h1 t-main" style="margin:16px 0 0;font-size:28px;line-height:1.2;font-weight:800;color:${THEME.text}">${esc(opts.title)}</h1>
              <p class="t-soft" style="margin:12px 0 0;font-size:15px;line-height:1.7;color:${THEME.textSoft}">${opts.intro}</p>
            </td>
          </tr>
          ${actionsRowHtml(opts.actionsTop ?? [])}
          ${opts.bodyBlocks}
          ${actionsRowHtml(opts.actionsBottom ?? [])}
          <tr><td style="padding:0 0 8px;font-size:0;line-height:0">&nbsp;</td></tr>
          <tr>
            <td class="px foot" style="padding:22px 32px;background:${THEME.cardAlt};border-top:1px solid ${THEME.border};text-align:center">
              <div class="t-main" style="font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${THEME.text}">${esc(opts.brand)}</div>
              <p class="t-muted" style="margin:8px 0 0;font-size:12px;line-height:1.7;color:${THEME.textMuted}">
                ${esc(opts.footerText)}<br/>
                <a class="lnk" href="${esc(opts.footerSite)}" style="color:${THEME.accentDark};text-decoration:none;font-weight:700">${esc(opts.footerSite)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function rowsTextBySection(rows: RowDef[]): string {
  const grouped = new Map<SectionId, RowDef[]>();
  for (const section of SECTION_ORDER) grouped.set(section, []);
  for (const row of rows) grouped.get(row.section)!.push(row);

  const parts: string[] = [];
  for (const section of SECTION_ORDER) {
    const list = sortRows(section, grouped.get(section)!);
    if (!list.length) continue;
    parts.push(`[${SECTION_TITLES[section]}]`);
    for (const row of list) {
      parts.push(`${row.label} : ${row.value}`);
    }
    parts.push("");
  }
  return parts.join("\n").trim();
}

function summaryLineIsUseful(line: string): boolean {
  if (!isMeaningfulValue(line)) return false;
  const normalized = normalize(line);
  if (/^tarif(\s+estime)?\s*:\s*0(\.00)?\s*(eur|euro|euros)?$/i.test(normalized)) return false;
  if (/^paiement\s*:\s*non\s*[—-]\s*n\/a$/i.test(normalized)) return false;
  return true;
}

type SummaryItem = { label: string; value: string };

function parseSummaryLine(line: string): SummaryItem {
  const index = line.indexOf(" : ");
  if (index > 0 && index <= 32) {
    return { label: line.slice(0, index).trim(), value: line.slice(index + 3).trim() };
  }
  return { label: "", value: line.trim() };
}

function summaryLabelIsPrice(label: string): boolean {
  return /^(tarif|montant|prix)/i.test(normalize(label));
}

function summaryRowHtml(item: SummaryItem, isLast: boolean): string {
  const border = isLast ? "none" : `1px solid ${THEME.border}`;
  if (!item.label) {
    return `<tr><td colspan="2" class="t-main bd" style="padding:11px 0;border-bottom:${border};font-size:14px;line-height:1.55;color:${THEME.text};word-break:break-word">${esc(item.value)}</td></tr>`;
  }
  const isRef = /^r[ée]f/i.test(item.label);
  const isPrice = summaryLabelIsPrice(item.label);
  const valueStyle = isRef
    ? `font-family:Consolas,Menlo,monospace;font-size:12px;font-weight:600;color:${THEME.textSoft}`
    : isPrice
      ? `font-size:17px;font-weight:800;color:${THEME.accentDark}`
      : `font-size:14px;font-weight:600;color:${THEME.text}`;
  const valueClass = isRef ? "t-soft" : isPrice ? "t-accent" : "t-main";
  return `<tr>
<td class="row-label t-muted bd" width="38%" style="padding:11px 12px 11px 0;border-bottom:${border};font-size:13px;line-height:1.5;color:${THEME.textMuted};vertical-align:top">${esc(item.label)}</td>
<td class="row-value ${valueClass} bd" style="padding:11px 0;border-bottom:${border};line-height:1.5;vertical-align:top;word-break:break-word;${valueStyle}">${esc(item.value)}</td>
</tr>`;
}

function summaryListHtml(lines: string[]): string {
  if (!lines.length) return "";
  const items = lines.map(parseSummaryLine);

  let routeHtml = "";
  const rest: SummaryItem[] = [];
  for (const item of items) {
    const leg = /^trajet$/i.test(normalize(item.label)) ? legFromSummary(item.value) : null;
    if (leg && !routeHtml) routeHtml = legHtml(leg);
    else rest.push(item);
  }

  const table = rest.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rest
        .map((item, index) => summaryRowHtml(item, index === rest.length - 1))
        .join("")}</table>`
    : "";

  const divider = routeHtml && table ? `<div class="bd" style="height:1px;background:${THEME.border};margin:6px 0 4px;font-size:0;line-height:0">&nbsp;</div>` : "";
  return cardHtml("Récapitulatif", `${routeHtml}${divider}${table}`);
}

function bookingFacts(flat: Record<string, string>): Fact[] {
  const facts: Fact[] = [];

  const date = pickValue(flat, "DateAller", "Date");
  const time = pickValue(flat, "HeureAller", "Heure");
  if (date) {
    facts.push({ label: "Départ le", value: [formatDateValue(date), time].filter(Boolean).join(" · ") });
  } else if (isMeaningfulValue(flat.DateEnvoi)) {
    facts.push({ label: "Reçu le", value: flat.DateEnvoi.trim() });
  }

  const price = isMeaningfulValue(flat.TarifTotal) ? money(flat.TarifTotal) : "";
  if (price) facts.push({ label: "Tarif", value: price, emphasis: true });

  if (isMeaningfulValue(flat.Statut)) facts.push({ label: "Statut", value: translateStatus(flat.Statut) });

  return facts;
}

function referenceOf(flat: Record<string, string>): string {
  const id = pickValue(flat, "ID");
  if (id) return id;
  const lead = pickValue(flat, "LeadId");
  return lead.length > 14 ? `${lead.slice(0, 8)}…` : lead;
}

function buildOperatorBlocks(flat: Record<string, string>): {
  facts: string;
  sections: string;
} {
  const rows = buildRowDefs(flat);
  const legs = legsFromFlat(flat);
  const hasRoute = legs.length > 0;
  const grouped = new Map<SectionId, RowDef[]>();
  for (const section of SECTION_ORDER) grouped.set(section, []);
  for (const row of rows) grouped.get(row.section)!.push(row);

  const tripRows = sortRows("trip", grouped.get("trip")!).filter(
    (row) => !ROUTE_KEYS.has(row.key) && !(hasRoute && SUMMARY_KEYS.has(row.key))
  );
  const tripInner = `${legs.map(legHtml).join("")}${
    legs.length && tripRows.length
      ? `<div class="bd" style="height:1px;background:${THEME.border};margin:6px 0 4px;font-size:0;line-height:0">&nbsp;</div>`
      : ""
  }${rowTableHtml(tripRows)}`;

  const commentRows = grouped.get("comment")!;
  const commentText = commentRows.length ? sortRows("comment", commentRows)[0].value : "";

  const sections = [
    cardSectionHtml("Client", sortRows("client", grouped.get("client")!)),
    cardHtml("Prestation et trajet", legs.length || tripRows.length ? tripInner : ""),
    cardSectionHtml("Tarif et paiement", sortRows("pricing", grouped.get("pricing")!)),
    commentText ? commentCardHtml("Commentaire du client", commentText) : "",
  ]
    .filter(Boolean)
    .join("");

  return { facts: factsHtml(bookingFacts(flat)), sections };
}

function buildCustomerBodyBlocks(lines: string[], noteBlock: string): string {
  return `${summaryListHtml(lines)}${noteBlock}`;
}

/* -------------------------------------------------------------------------- */
/*  E-mails                                                                   */
/* -------------------------------------------------------------------------- */

export function buildOperatorEmail(opts: {
  type: "contact" | "devis" | "reservation";
  subjectPrefix: string;
  flat: Record<string, string>;
}): { subject: string; html: string; text: string } {
  const tenant = currentTenant();
  const brand = brandName(tenant);
  const site = publicSiteUrl(tenant);
  const title =
    opts.type === "contact"
      ? "Nouvelle demande de contact"
      : opts.type === "devis"
        ? "Nouvelle demande de devis"
        : "Nouvelle réservation";
  const subject = `${opts.subjectPrefix}${title} - ${brand}`;
  const dashboardLink =
    opts.flat.DashboardLink && isMeaningfulValue(opts.flat.DashboardLink) ? opts.flat.DashboardLink.trim() : "";

  const { facts, sections } = buildOperatorBlocks(opts.flat);
  const intro =
    opts.type === "contact"
      ? "Un client attend une réponse. Retrouvez les informations essentielles ci-dessous et ouvrez la fiche pour traiter la demande."
      : "Une nouvelle demande est arrivée dans votre espace professionnel. Ouvrez la fiche pour la consulter et agir rapidement.";

  const phone = pickValue(opts.flat, "Telephone");
  const email = pickValue(opts.flat, "Email");
  const firstName = pickValue(opts.flat, "Prenom");

  const actionsTop = [
    dashboardLink ? buttonHtml("Voir la demande", dashboardLink) : "",
    phone ? buttonHtml(firstName ? `Appeler ${firstName}` : "Appeler", telHref(phone), "secondary") : "",
    email ? buttonHtml("Répondre", `mailto:${email}`, "secondary") : "",
  ];

  const html = shellHtml({
    preheader: `${title} - ${brand}`,
    brand,
    badge: badgeHtml(title, "accent"),
    reference: referenceOf(opts.flat),
    title,
    intro,
    bodyBlocks: `${facts}${sections}`,
    actionsTop,
    footerSite: site,
    footerText: "Notification opérateur - espace professionnel",
  });

  const textParts = [
    title,
    brand,
    "",
    dashboardLink ? `Voir la demande : ${dashboardLink}` : "",
    "",
    rowsTextBySection(buildRowDefs(opts.flat)),
    "",
    `Site : ${site}`,
  ];

  return {
    subject,
    html,
    text: textParts.filter(Boolean).join("\n"),
  };
}

export function buildCustomerConfirmation(opts: {
  type: "devis" | "reservation";
  recipientName: string;
  summaryLines: string[];
}): { subject: string; html: string; text: string } {
  const tenant = currentTenant();
  const brand = brandName(tenant);
  const site = publicSiteUrl(tenant);
  const usefulLines = opts.summaryLines.filter(summaryLineIsUseful);
  const kindLabel = opts.type === "devis" ? "demande de devis" : "demande de réservation";
  const subject =
    opts.type === "devis"
      ? `${brand} - Nous avons bien reçu votre demande de devis`
      : `${brand} - Nous avons bien reçu votre demande de réservation`;

  const intro = `Bonjour ${esc(opts.recipientName)},<br/>Nous avons bien reçu votre ${esc(kindLabel)}. Notre équipe revient vers vous très rapidement avec la suite à donner.`;
  const bodyBlocks = buildCustomerBodyBlocks(usefulLines, "");

  const html = shellHtml({
    preheader: subject,
    brand,
    badge: badgeHtml(opts.type === "devis" ? "Demande de devis" : "Demande de réservation", "accent"),
    title: "Nous avons bien reçu votre demande",
    intro,
    bodyBlocks,
    actionsBottom: [buttonHtml("Visiter notre site", site)],
    footerSite: site,
    footerText: `${brand} - Accusé de réception`,
  });

  const text = [
    `Bonjour ${opts.recipientName},`,
    "",
    `Nous avons bien reçu votre ${kindLabel}.`,
    "Notre équipe revient vers vous très rapidement.",
    "",
    usefulLines.join("\n"),
    "",
    `${brand}`,
    site,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
