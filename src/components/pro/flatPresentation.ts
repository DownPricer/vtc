import { isUsefulValue, translatePayField, translatePaymentMethod } from "./proDisplay";

const LABELS: Record<string, string> = {
  TypeService: "Type de service",
  TypeTrajet: "Type de trajet",
  "RésuméTrajet": "Resume du trajet",
  ResumeTrajet: "Resume du trajet",
  AdresseDepart_1: "Depart",
  AdresseArrivee_1: "Arrivee",
  AdresseDepart_2: "Depart retour",
  AdresseArrivee_2: "Arrivee retour",
  DateAller: "Date aller",
  HeureAller: "Heure aller",
  DateRetour: "Date retour",
  HeureRetour: "Heure retour",
  AllerNumeroVol: "Numero de vol aller",
  AllerHeureVol: "Horaire vol aller",
  RetourNumeroVol: "Numero de vol retour",
  RetourHeureVol: "Horaire vol retour",
  NombrePassagers: "Passagers",
  Passagers: "Passagers",
  BagagesAller: "Bagages aller",
  BagagesRetour: "Bagages retour",
  Bagages: "Bagages",
  Options: "Options",
  Commentaires: "Commentaire client",
  Observations: "Commentaire client",
  LieuEvenement: "Lieu de l'evenement",
  HeuresMAD: "Duree M.A.D.",
  HeuresMADEvenementiel: "Duree M.A.D. evenement",
  Organisation: "Organisation",
  NomSociete: "Societe",
  Societe: "Societe",
  TarifTotal: "Tarif total",
  "Payé": "Paiement recu",
  PaymentMethode: "Mode de paiement",
};

const PRESTATION_KEYS = [
  "TypeService",
  "TypeTrajet",
  "RésuméTrajet",
  "ResumeTrajet",
  "AdresseDepart_1",
  "AdresseArrivee_1",
  "AdresseDepart_2",
  "AdresseArrivee_2",
  "DateAller",
  "HeureAller",
  "DateRetour",
  "HeureRetour",
  "AllerNumeroVol",
  "AllerHeureVol",
  "RetourNumeroVol",
  "RetourHeureVol",
  "NombrePassagers",
  "Passagers",
  "BagagesAller",
  "BagagesRetour",
  "Bagages",
  "Options",
  "Commentaires",
  "Observations",
  "LieuEvenement",
  "HeuresMAD",
  "HeuresMADEvenementiel",
];

export type UiRow = { label: string; value: string };

function row(key: string, flat: Record<string, unknown>): UiRow | null {
  const raw = flat[key];
  if (!isUsefulValue(raw)) return null;
  const label = LABELS[key] ?? "Information complementaire";
  let value = String(raw).trim();
  if (key === "Payé") value = translatePayField(value);
  if (key === "PaymentMethode") value = translatePaymentMethod(value);
  if (!isUsefulValue(value)) return null;
  return { label, value };
}

export function clientRowsFromFlat(flat: Record<string, unknown>): UiRow[] {
  const out: UiRow[] = [];
  const org = row("Organisation", flat);
  if (org && org.value.toLowerCase() !== "particulier") out.push(org);
  const soc = row("NomSociete", flat) ?? row("Societe", flat);
  if (soc) out.push(soc);
  return out;
}

export function prestationRowsFromFlat(flat: Record<string, unknown>): UiRow[] {
  return PRESTATION_KEYS.map((key) => row(key, flat)).filter(Boolean) as UiRow[];
}

export function paiementRowsFromFlat(flat: Record<string, unknown>): UiRow[] {
  return ["Payé", "PaymentMethode", "TarifTotal"].map((key) => row(key, flat)).filter(Boolean) as UiRow[];
}
