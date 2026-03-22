"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AddressAutocomplete } from "./AddressAutocomplete";

type TypeService = "Transfert Aéroport" | "Trajet Classique" | "MAD Evenementiel";
type TypeTrajet = "Aller Simple" | "Aller/Retour" | "A/R + Mise à disposition";

const AIRPORTS = [
  { label: "Paris-Orly (ORY)", value: "ORY", address: "Aéroport de Paris-Orly, 94390 Orly, France" },
  { label: "Paris-Charles de Gaulle (CDG)", value: "CDG", address: "Aéroport de Paris-Charles de Gaulle, 95700 Roissy-en-France, France" },
  { label: "Beauvais-Tillé (BVA)", value: "BVA", address: "Aéroport de Beauvais-Tillé, 60000 Tillé, France" },
  { label: "Caen-Carpiquet (CC)", value: "CC", address: "Aéroport de Caen-Carpiquet, 14650 Carpiquet, France" },
];

function getAirportAddress(code: string): string {
  return AIRPORTS.find(a => a.value === code)?.address ?? "";
}

function toFrDate(isoDate: string): string {
  if (!isoDate || !isoDate.includes("-")) return "";
  const [y, m, d] = isoDate.split("-");
  if (!d || !m || !y) return "";
  return `${d}/${m}/${y}`;
}

export interface CalculatorFormProps {
  mode?: "reservation" | "devis";
}

/* ─── Composants UI ─── */
function SectionHeader({ step, title, icon }: { step: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="gauge-step flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-primary text-sm font-bold tracking-wider">
        {step}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-primary/60">{icon}</span>
        <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="flex-1 gauge-line" />
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-[0.12em]">
      {children} {required && <span className="text-primary">*</span>}
    </label>
  );
}

function StyledInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`dashboard-input w-full ${icon ? "pl-10" : "px-4"} pr-4 py-3 rounded-lg text-white placeholder-gray-600 focus:outline-none transition-all text-sm [color-scheme:dark] ${props.className ?? ""}`}
      />
    </div>
  );
}

function StyledSelect({ icon, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none z-10">
          {icon}
        </div>
      )}
      <select
        {...props}
        className={`dashboard-input w-full ${icon ? "pl-10" : "px-4"} pr-9 py-3 rounded-lg text-white focus:outline-none transition-all text-sm [color-scheme:dark] appearance-none ${props.className ?? ""}`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/30">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function PassagerStepper({ value, onChange, max = 4 }: { value: string; onChange: (v: string) => void; max?: number }) {
  const n = parseInt(value) || 1;
  return (
    <div className="flex items-center gap-0 rounded-lg overflow-hidden w-fit" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04)' }}>
      <button type="button" onClick={() => onChange(String(Math.max(1, n - 1)))}
        className="chrome-btn w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white active:text-primary transition-colors text-lg font-bold disabled:opacity-30 rounded-l-lg rounded-r-none"
        disabled={n <= 1}>−</button>
      <div className="min-w-[3rem] h-11 flex items-center justify-center text-primary font-bold text-lg border-x border-white/8" style={{ background: 'linear-gradient(180deg, #0a0a0c 0%, #141416 100%)' }}>{n}</div>
      <button type="button" onClick={() => onChange(String(Math.min(max, n + 1)))}
        className="chrome-btn w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white active:text-primary transition-colors text-lg font-bold disabled:opacity-30 rounded-r-lg rounded-l-none"
        disabled={n >= max}>+</button>
    </div>
  );
}

function TrajetTypeToggle({ value, options, onChange }: {
  value: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'linear-gradient(180deg, #0d0d0f 0%, #161618 100%)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03)' }}>
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${
            value === opt.value
              ? "bg-primary/15 text-primary shadow-glow border border-primary/30"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          }`}>
          <span className={value === opt.value ? "text-primary/70" : "text-gray-600"}>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({ value, onChange, labelOn, labelOff }: { value: boolean; onChange: (v: boolean) => void; labelOn: string; labelOff: string }) {
  return (
    <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'linear-gradient(180deg, #0d0d0f 0%, #161618 100%)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03)' }}>
      {[{ v: false, label: labelOff }, { v: true, label: labelOn }].map(({ v, label }) => (
        <button key={label} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${
            value === v
              ? "bg-primary/15 text-primary border border-primary/30 shadow-glow"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          }`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Annotation({ type, children }: { type: "error" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-500/25 text-red-400",
    warning: "border-amber-500/25 text-amber-400",
    info: "border-blue-500/25 text-blue-400"
  };
  const bgStyles = {
    error: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(15,15,17,0.9) 100%)',
    warning: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(15,15,17,0.9) 100%)',
    info: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(15,15,17,0.9) 100%)'
  };
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${styles[type]}`} style={{ background: bgStyles[type] }}>
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  );
}

/* ─── Icônes ─── */
const IconPlane = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const IconCar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6H5l-2 7v3h2m8-10l2 7H5m8-7v10m0-10h5l2 7v3h-2" /></svg>;
const IconStar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const IconPin = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconClock = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconUser = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconMail = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconFlight = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" /><polygon points="12 15 17 21 7 21 12 15" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} /></svg>;
const IconBuilding = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const IconLuggage = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

const EXTRAS_OPTIONS = [
  { id: "siege-auto", label: "Siège auto / Réhausseur", value: "Siège auto / Réhausseur" },
  { id: "bebe-bord", label: "Bébé à bord", value: "Bébé à bord" },
  { id: "fauteuil-roulant", label: "Fauteuil roulant", value: "Fauteuil roulant" },
  { id: "acces-difficile", label: "Accès difficile", value: "Accès difficile" },
];

const SERVICE_OPTIONS = [
  {
    value: "Transfert Aéroport" as TypeService,
    label: "Transfert Aéroport",
    sublabel: "Orly · CDG · Beauvais · Caen",
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  },
  {
    value: "Trajet Classique" as TypeService,
    label: "Trajet Classique",
    sublabel: "Point A → Point B",
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  },
  {
    value: "MAD Evenementiel" as TypeService,
    label: "Mise à Disposition",
    sublabel: "Mariage · Événement · Soirée",
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  },
];

const BAGAGES_OPTIONS = Array.from({ length: 9 }, (_, i) => ({ label: i === 0 ? "Aucun" : `${i} bagage${i > 1 ? "s" : ""}`, value: String(i) }));

/* ─── Composant principal ─── */
export function CalculatorForm({ mode = "reservation" }: CalculatorFormProps) {
  const isDevis = mode === "devis";

  const [typeService, setTypeService] = useState<TypeService>("Transfert Aéroport");
  const [typeTrajet, setTypeTrajet] = useState<TypeTrajet>("Aller Simple");
  const [tarif, setTarif] = useState<number | null>(null);
  const [tarifResult, setTarifResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [isEntreprise, setIsEntreprise] = useState(false);
  const [client, setClient] = useState({ nom: "", prenom: "", telephone: "", email: "", nomSociete: "", adresseSociete: "" });
  const [commentaires, setCommentaires] = useState("");
  const [optionsExtras, setOptionsExtras] = useState<string[]>([]);

  /* ── Spécificités Transfert Aéroport ── */
  const [departDepuisAeroport, setDepartDepuisAeroport] = useState(false);
  const [aeroportDepartCode, setAeroportDepartCode] = useState("");
  const [taRetourAdresseDifferente, setTaRetourAdresseDifferente] = useState(false);

  const [transfertAeroport, setTransfertAeroport] = useState({
    TApassagers: "1",
    TAallerpriseencharge: "" as string | { formatted: string },
    TAallerdestination: "" as string | { formatted: string },
    TAallerdate: "",
    TAallernumerovol: "",
    TAallerhoraire: "",
    TAtrajet: "Aller Simple" as string,
    // Retour
    TAretourpriseencharge: "" as string | { formatted: string },
    TAretourdestination: "" as string | { formatted: string },
    TAretourdate: "",
    TAretournumerovol: "",
    TAretourhoraire: "",
    // Aéroports retour (si différentes)
    TAaeroportRetourCode: "",
    // Bagages
    TAbagagesaller: "0",
    TAbagagesretour: "0",
    // Mode inversé (départ depuis aéroport)
    TAheureVolDepart: "",
    TANumeroVolDepart: "",
    TAvilleDestination: "" as string | { formatted: string },
  });

  /* ── Spécificités Trajet Classique ── */
  const [tcRetourAdresseDifferente, setTcRetourAdresseDifferente] = useState(false);

  const [trajetClassique, setTrajetClassique] = useState({
    TCpassagers: "1",
    TCallerpriseencharge: "" as string | { formatted: string },
    TCallerDestination: "" as string | { formatted: string },
    TCallerdate: "",
    TCallerheure: "",
    TCtrajet: "Aller Simple" as TypeTrajet,
    TCretourpriseencharge: "" as string | { formatted: string },
    TCretourDestination: "" as string | { formatted: string },
    TCretourdate: "",
    TCretourheure: "",
    HeureMADClassique: "",
    TCbagagesaller: "0",
    TCbagagesretour: "0",
  });

  /* ── MAD ── */
  const [madEvenementiel, setMadEvenementiel] = useState({
    LieuEvenement: "" as string | { formatted: string },
    DateEvenement: "",
    HeureEvenement: "",
    HeureMADEvenement: "",
    nombreinvites: "0",
  });

  const getAddr = (v: string | { formatted?: string }): string =>
    typeof v === "object" && v?.formatted ? v.formatted : String(v ?? "");

  const buildPayload = useCallback(() => {
    const clientData: Record<string, string> = { nom: client.nom, prenom: client.prenom, telephone: client.telephone, email: client.email };
    if (isEntreprise) { clientData.nomSociete = client.nomSociete; clientData.adresseSociete = client.adresseSociete; clientData.organisation = "Professionnel"; }
    else { clientData.organisation = "Particulier"; }

    const isAR = typeTrajet === "Aller/Retour" || typeTrajet === "A/R + Mise à disposition";
    const isAeroAR = transfertAeroport.TAtrajet === "Aller/Retour";

    const payload: Record<string, unknown> = {
      client: clientData,
      general: {
        TypeService: typeService,
        TypeTrajet: typeService === "Trajet Classique" ? typeTrajet : transfertAeroport.TAtrajet,
        commentaires,
        PaymentMethode: "N/A",
        options: optionsExtras,
        departDepuisAeroport: typeService === "Transfert Aéroport" ? departDepuisAeroport : false,
      },
      trajetClassique: {},
      transfertAeroport: {},
      madEvenementiel: {},
    };

    if (typeService === "Trajet Classique") {
      const t = { ...trajetClassique };
      t.TCallerpriseencharge = getAddr(t.TCallerpriseencharge);
      t.TCallerDestination = getAddr(t.TCallerDestination);
      t.TCallerdate = toFrDate(t.TCallerdate) || t.TCallerdate;
      // Retour
      if (isAR) {
        if (tcRetourAdresseDifferente) {
          t.TCretourpriseencharge = getAddr(t.TCretourpriseencharge);
          t.TCretourDestination = getAddr(t.TCretourDestination);
        } else {
          // Mêmes adresses inversées
          t.TCretourpriseencharge = getAddr(t.TCallerDestination);
          t.TCretourDestination = getAddr(t.TCallerpriseencharge);
        }
        t.TCretourdate = toFrDate(t.TCretourdate) || t.TCretourdate;
      }
      (payload.trajetClassique as Record<string, unknown>) = { ...t, tcRetourAdresseDifferente };
    }

    if (typeService === "Transfert Aéroport") {
      const a = { ...transfertAeroport };
      if (departDepuisAeroport && !isAeroAR) {
        // Mode inversé : Aéroport → Client
        a.TAallerpriseencharge = getAirportAddress(aeroportDepartCode);
        a.TAallerdestination = getAddr(a.TAvilleDestination);
        a.TAallerhoraire = a.TAheureVolDepart;
        a.TAallernumerovol = a.TANumeroVolDepart;
      } else {
        a.TAallerpriseencharge = getAddr(a.TAallerpriseencharge);
        a.TAallerdestination = getAddr(a.TAallerdestination);
      }
      a.TAallerdate = toFrDate(a.TAallerdate) || a.TAallerdate;
      if (isAeroAR) {
        if (taRetourAdresseDifferente) {
          a.TAretourpriseencharge = getAirportAddress(a.TAaeroportRetourCode);
          a.TAretourdestination = getAddr(a.TAretourdestination);
        } else {
          a.TAretourpriseencharge = getAddr(a.TAallerdestination);
          a.TAretourdestination = getAddr(a.TAallerpriseencharge);
        }
        a.TAretourdate = toFrDate(a.TAretourdate) || a.TAretourdate;
      }
      (payload.transfertAeroport as Record<string, unknown>) = { ...a, departDepuisAeroport, taRetourAdresseDifferente, aeroportDepartCode };
    }

    if (typeService === "MAD Evenementiel") {
      const e = { ...madEvenementiel };
      e.LieuEvenement = getAddr(e.LieuEvenement);
      e.DateEvenement = toFrDate(e.DateEvenement) || e.DateEvenement;
      (payload.madEvenementiel as Record<string, unknown>) = e;
    }

    return payload;
  }, [client, isEntreprise, typeService, typeTrajet, transfertAeroport, trajetClassique, madEvenementiel, commentaires, optionsExtras, departDepuisAeroport, aeroportDepartCode, taRetourAdresseDifferente, tcRetourAdresseDifferente]);

  const fetchTarif = useCallback(async () => {
    const payload = buildPayload();
    setLoading(true); setError(null); setTarif(null); setTarifResult(null);
    try {
      const res = await fetch("/api/calculer-tarif", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.tarif != null) { setTarif(data.tarif); setTarifResult(data); }
      else setError(data?.error || "Impossible de calculer le tarif");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [buildPayload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    const payload = buildPayload();
    const apiUrl = isDevis ? "/api/devis" : "/api/reservation";
    try {
      const res = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.success) { setSubmitStatus("success"); window.location.href = "/remerciements"; }
      else { setSubmitStatus("error"); setError(data?.message || "Erreur lors de l'envoi"); }
    } catch (err) { setSubmitStatus("error"); setError((err as Error).message); }
  };

  const isAR = typeTrajet === "Aller/Retour" || typeTrajet === "A/R + Mise à disposition";
  const isARMAD = typeTrajet === "A/R + Mise à disposition";
  const isAeroAR = transfertAeroport.TAtrajet === "Aller/Retour";

  const getMissingTarifFields = useCallback((): string[] => {
    const missing: string[] = [];
    if (typeService === "Transfert Aéroport") {
      if (departDepuisAeroport && !isAeroAR) {
        if (!aeroportDepartCode) missing.push("Aéroport de départ");
        if (!getAddr(transfertAeroport.TAvilleDestination)) missing.push("Destination");
        if (!transfertAeroport.TAallerdate) missing.push("Date du vol");
        if (!transfertAeroport.TAheureVolDepart) missing.push("Heure du vol");
      } else {
        if (!getAddr(transfertAeroport.TAallerpriseencharge)) missing.push("Lieu de prise en charge (aller)");
        if (!transfertAeroport.TAallerdestination) missing.push("Aéroport de destination (aller)");
        if (!transfertAeroport.TAallerdate) missing.push("Date du vol (aller)");
        if (!transfertAeroport.TAallerhoraire) missing.push("Heure du vol (aller)");
        if (isAeroAR) {
          if (!transfertAeroport.TAretourdate) missing.push("Date du vol (retour)");
          if (!transfertAeroport.TAretourhoraire) missing.push("Heure du vol (retour)");
          if (taRetourAdresseDifferente) {
            if (!transfertAeroport.TAaeroportRetourCode) missing.push("Aéroport retour");
            if (!getAddr(transfertAeroport.TAretourdestination)) missing.push("Destination retour");
          }
        }
      }
    } else if (typeService === "Trajet Classique") {
      if (!getAddr(trajetClassique.TCallerpriseencharge)) missing.push("Lieu de départ (aller)");
      if (!getAddr(trajetClassique.TCallerDestination)) missing.push("Destination (aller)");
      if (!trajetClassique.TCallerdate) missing.push("Date (aller)");
      if (!trajetClassique.TCallerheure) missing.push("Heure (aller)");
      if (isAR) {
        if (tcRetourAdresseDifferente) {
          if (!getAddr(trajetClassique.TCretourpriseencharge)) missing.push("Lieu de départ (retour)");
          if (!getAddr(trajetClassique.TCretourDestination)) missing.push("Destination (retour)");
        }
        if (!isARMAD && !trajetClassique.TCretourdate) missing.push("Date (retour)");
        if (!isARMAD && !trajetClassique.TCretourheure) missing.push("Heure (retour)");
        if (isARMAD && !trajetClassique.HeureMADClassique) missing.push("Durée mise à disposition");
      }
    } else if (typeService === "MAD Evenementiel") {
      if (!getAddr(madEvenementiel.LieuEvenement)) missing.push("Lieu de l'événement");
      if (!madEvenementiel.DateEvenement) missing.push("Date");
      if (!madEvenementiel.HeureEvenement) missing.push("Heure de début");
      if (!madEvenementiel.HeureMADEvenement) missing.push("Durée de mise à disposition");
    }
    return missing;
  }, [typeService, transfertAeroport, trajetClassique, madEvenementiel, isAR, isARMAD, isAeroAR, departDepuisAeroport, aeroportDepartCode, taRetourAdresseDifferente, tcRetourAdresseDifferente]);

  const getMissingCoordFields = useCallback((): string[] => {
    const missing: string[] = [];
    if (!client.nom?.trim()) missing.push("Nom");
    if (!client.prenom?.trim()) missing.push("Prénom");
    if (!client.telephone?.trim()) missing.push("Téléphone");
    if (!client.email?.trim()) missing.push("Email");
    if (isEntreprise && !client.nomSociete?.trim()) missing.push("Nom de la société");
    return missing;
  }, [client, isEntreprise]);

  const missingTarif = getMissingTarifFields();
  const missingCoord = getMissingCoordFields();
  const canCalculateTarif = missingTarif.length === 0;
  // En mode devis : bouton actif sans calcul de tarif préalable
  const canSubmitDevis = isDevis && canCalculateTarif && missingCoord.length === 0;
  const canSubmitReservation = !isDevis && tarif != null && tarifResult != null && missingCoord.length === 0;

  /* ─── Sous-section vol (aller ou départ depuis aéroport) ─── */
  const renderBagagesSelect = (label: string, value: string, onChange: (v: string) => void) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <StyledSelect icon={<IconLuggage />} value={value} onChange={e => onChange(e.target.value)}>
        {BAGAGES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </StyledSelect>
    </div>
  );

  const renderAeroportSelect = (label: string, value: string, onChange: (v: string) => void, required = true) => (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <StyledSelect icon={<IconPlane />} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Choisir un aéroport —</option>
        {AIRPORTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
      </StyledSelect>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-mode={isDevis ? "devis" : "reservation"}>

      {/* ── ÉTAPE 1 : Type de service ── */}
      <div className="dashboard-card rounded-2xl p-5 md:p-6">
        <SectionHeader step="1" title="Type de service" icon={<IconCar />} />
        <div className="flex flex-col gap-2">
          {SERVICE_OPTIONS.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => {
                setTypeService(opt.value);
                setTarif(null); setTarifResult(null); setError(null);
                setDepartDepuisAeroport(false); setAeroportDepartCode("");
                setTaRetourAdresseDifferente(false); setTcRetourAdresseDifferente(false);
                if (opt.value === "MAD Evenementiel") setOptionsExtras([]);
              }}
              className={`service-switch ${typeService === opt.value ? "active" : ""} flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeService === opt.value ? "bg-primary/20 text-primary" : "bg-white/5 text-gray-500"}`}>{opt.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm leading-tight ${typeService === opt.value ? "text-primary" : "text-gray-300"}`}>{opt.label}</p>
                <p className={`text-xs mt-0.5 ${typeService === opt.value ? "text-primary/60" : "text-gray-600"}`}>{opt.sublabel}</p>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${typeService === opt.value ? "bg-primary shadow-glow" : "bg-white/10"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* ── ÉTAPE 2 : Détails du trajet ── */}
      <div className="dashboard-card rounded-2xl p-5 md:p-6">
        <SectionHeader step="2" title={typeService === "MAD Evenementiel" ? "Détails de l'événement" : "Détails du trajet"} icon={<IconPin />} />

        {/* ════════════ TRANSFERT AÉROPORT ════════════ */}
        {typeService === "Transfert Aéroport" && (
          <div className="space-y-5">
            {/* Type de trajet */}
            <div>
              <FieldLabel>Type de trajet</FieldLabel>
              <TrajetTypeToggle
                value={transfertAeroport.TAtrajet}
                options={[
                  { value: "Aller Simple", label: "Aller Simple", icon: <IconPlane /> },
                  { value: "Aller/Retour", label: "Aller / Retour", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
                ]}
                onChange={(v) => { setTransfertAeroport(t => ({ ...t, TAtrajet: v })); setTarif(null); setTarifResult(null); setDepartDepuisAeroport(false); setTaRetourAdresseDifferente(false); }}
              />
            </div>

            {/* Passagers + Bagages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Nombre de passagers</FieldLabel>
                <div className="flex items-center gap-4">
                  <PassagerStepper value={transfertAeroport.TApassagers} max={4}
                    onChange={(v) => setTransfertAeroport(t => ({ ...t, TApassagers: v }))} />
                  <span className="text-gray-500 text-sm">max. 4</span>
                </div>
              </div>
              {!isAeroAR && (
                <div>
                  {renderBagagesSelect("Bagages", transfertAeroport.TAbagagesaller, (v) => setTransfertAeroport(t => ({ ...t, TAbagagesaller: v })))}
                </div>
              )}
              {isAeroAR && (
                <>
                  <div>
                    {renderBagagesSelect("Bagages aller", transfertAeroport.TAbagagesaller, (v) => setTransfertAeroport(t => ({ ...t, TAbagagesaller: v })))}
                  </div>
                  <div>
                    {renderBagagesSelect("Bagages retour", transfertAeroport.TAbagagesretour, (v) => setTransfertAeroport(t => ({ ...t, TAbagagesretour: v })))}
                  </div>
                </>
              )}
            </div>

            {/* Switch départ depuis aéroport — Aller Simple uniquement */}
            {!isAeroAR && (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'linear-gradient(135deg, rgba(255,133,51,0.04) 0%, rgba(20,20,22,0.8) 100%)', border: '1px solid rgba(255,133,51,0.12)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.12em]">Sens du trajet</p>
                </div>
                <ToggleSwitch
                  value={departDepuisAeroport}
                  onChange={(v) => { setDepartDepuisAeroport(v); setAeroportDepartCode(""); setTarif(null); setTarifResult(null); }}
                  labelOff="De chez moi → Aéroport"
                  labelOn="Aéroport → Chez moi"
                />
              </div>
            )}

            {/* ── Mode normal : Chez moi → Aéroport ── */}
            {!departDepuisAeroport && (
              <div className="rounded-xl p-4 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(20,20,22,0.7) 0%, rgba(15,15,17,0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
                <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.12em] flex items-center gap-2"><IconPlane /> Aller</p>
                <AddressAutocomplete label="Lieu de prise en charge (votre adresse)" required
                  placeholder="Votre adresse, ville..."
                  value={getAddr(transfertAeroport.TAallerpriseencharge)}
                  onChange={(v) => setTransfertAeroport(t => ({ ...t, TAallerpriseencharge: typeof v === "object" ? v : { formatted: v } }))} />
                {renderAeroportSelect("Aéroport de destination", getAddr(transfertAeroport.TAallerdestination as string), (v) => setTransfertAeroport(t => ({ ...t, TAallerdestination: v })))}
                <div className="grid grid-cols-2 gap-3">
                  <div><FieldLabel required>Date du vol</FieldLabel>
                    <StyledInput icon={<IconCalendar />} required type="date" value={transfertAeroport.TAallerdate}
                      onChange={(e) => setTransfertAeroport(t => ({ ...t, TAallerdate: e.target.value }))} /></div>
                  <div><FieldLabel required>Heure du vol</FieldLabel>
                    <StyledInput icon={<IconClock />} required type="time" value={transfertAeroport.TAallerhoraire}
                      onChange={(e) => setTransfertAeroport(t => ({ ...t, TAallerhoraire: e.target.value }))} /></div>
                </div>
                <div><FieldLabel>N° de vol</FieldLabel>
                  <StyledInput icon={<IconFlight />} type="text" value={transfertAeroport.TAallernumerovol}
                    onChange={(e) => setTransfertAeroport(t => ({ ...t, TAallernumerovol: e.target.value }))}
                    placeholder="Ex : AF1234" /></div>
              </div>
            )}

            {/* ── Mode inversé : Aéroport → Chez moi ── */}
            {departDepuisAeroport && !isAeroAR && (
              <div className="rounded-xl p-4 space-y-4" style={{ background: 'linear-gradient(135deg, rgba(255,133,51,0.06) 0%, rgba(15,15,17,0.9) 100%)', border: '1px solid rgba(255,133,51,0.2)', boxShadow: 'inset 0 0 20px rgba(255,133,51,0.03)' }}>
                <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.12em] flex items-center gap-2"><IconPlane /> Départ depuis l&apos;aéroport</p>
                {renderAeroportSelect("Aéroport de départ", aeroportDepartCode, setAeroportDepartCode)}
                <div className="grid grid-cols-2 gap-3">
                  <div><FieldLabel required>Date du vol</FieldLabel>
                    <StyledInput icon={<IconCalendar />} required type="date" value={transfertAeroport.TAallerdate}
                      onChange={(e) => setTransfertAeroport(t => ({ ...t, TAallerdate: e.target.value }))} /></div>
                  <div><FieldLabel required>Heure d&apos;atterrissage</FieldLabel>
                    <StyledInput icon={<IconClock />} required type="time" value={transfertAeroport.TAheureVolDepart}
                      onChange={(e) => setTransfertAeroport(t => ({ ...t, TAheureVolDepart: e.target.value }))} /></div>
                </div>
                <div><FieldLabel>N° de vol</FieldLabel>
                  <StyledInput icon={<IconFlight />} type="text" value={transfertAeroport.TANumeroVolDepart}
                    onChange={(e) => setTransfertAeroport(t => ({ ...t, TANumeroVolDepart: e.target.value }))}
                    placeholder="Ex : AF1234" /></div>
                <AddressAutocomplete label="Votre adresse de destination" required
                  placeholder="Votre adresse, ville..."
                  value={getAddr(transfertAeroport.TAvilleDestination)}
                  onChange={(v) => setTransfertAeroport(t => ({ ...t, TAvilleDestination: typeof v === "object" ? v : { formatted: v } }))} />
              </div>
            )}

            {/* ── Retour (AR) ── */}
            {isAeroAR && (
              <div className="rounded-xl p-4 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(20,20,22,0.7) 0%, rgba(15,15,17,0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
                <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.12em] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>Retour
                </p>

                {/* Adresse de retour différente ? */}
                <div>
                  <FieldLabel>Adresse de retour</FieldLabel>
                  <ToggleSwitch value={taRetourAdresseDifferente} onChange={setTaRetourAdresseDifferente}
                    labelOff="Mêmes adresses" labelOn="Adresses différentes" />
                </div>

                {taRetourAdresseDifferente && (
                  <>
                    {renderAeroportSelect("Aéroport de départ (retour)", transfertAeroport.TAaeroportRetourCode, (v) => setTransfertAeroport(t => ({ ...t, TAaeroportRetourCode: v })))}
                    <AddressAutocomplete label="Destination (retour — votre adresse)" required
                      placeholder="Votre adresse de destination..."
                      value={getAddr(transfertAeroport.TAretourdestination)}
                      onChange={(v) => setTransfertAeroport(t => ({ ...t, TAretourdestination: typeof v === "object" ? v : { formatted: v } }))} />
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div><FieldLabel required>Date du vol retour</FieldLabel>
                    <StyledInput icon={<IconCalendar />} required type="date" value={transfertAeroport.TAretourdate}
                      onChange={(e) => setTransfertAeroport(t => ({ ...t, TAretourdate: e.target.value }))} /></div>
                  <div><FieldLabel required>Heure du vol retour</FieldLabel>
                    <StyledInput icon={<IconClock />} required type="time" value={transfertAeroport.TAretourhoraire}
                      onChange={(e) => setTransfertAeroport(t => ({ ...t, TAretourhoraire: e.target.value }))} /></div>
                </div>
                <div><FieldLabel>N° de vol retour</FieldLabel>
                  <StyledInput icon={<IconFlight />} type="text" value={transfertAeroport.TAretournumerovol}
                    onChange={(e) => setTransfertAeroport(t => ({ ...t, TAretournumerovol: e.target.value }))}
                    placeholder="Ex : AF5678" /></div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ TRAJET CLASSIQUE ════════════ */}
        {typeService === "Trajet Classique" && (
          <div className="space-y-5">
            <div>
              <FieldLabel>Type de trajet</FieldLabel>
              <TrajetTypeToggle value={typeTrajet}
                options={[
                  { value: "Aller Simple", label: "Aller Simple", icon: <IconPlane /> },
                  { value: "Aller/Retour", label: "Aller / Retour", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
                  { value: "A/R + Mise à disposition", label: "A/R + MAD", icon: <IconStar /> },
                ]}
                onChange={(v) => { setTypeTrajet(v as TypeTrajet); setTarif(null); setTarifResult(null); setTcRetourAdresseDifferente(false); }}
              />
            </div>

            {/* Passagers + Bagages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Nombre de passagers</FieldLabel>
                <div className="flex items-center gap-4">
                  <PassagerStepper value={trajetClassique.TCpassagers} max={4}
                    onChange={(v) => setTrajetClassique(t => ({ ...t, TCpassagers: v }))} />
                  <span className="text-gray-500 text-sm">max. 4</span>
                </div>
              </div>
              <div>
                {renderBagagesSelect(isAR ? "Bagages aller" : "Bagages", trajetClassique.TCbagagesaller, (v) => setTrajetClassique(t => ({ ...t, TCbagagesaller: v })))}
              </div>
              {isAR && (
                <div>
                  {renderBagagesSelect("Bagages retour", trajetClassique.TCbagagesretour, (v) => setTrajetClassique(t => ({ ...t, TCbagagesretour: v })))}
                </div>
              )}
            </div>

            {/* Aller */}
            <div className="rounded-xl p-4 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(20,20,22,0.7) 0%, rgba(15,15,17,0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
              <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.12em] flex items-center gap-2"><IconPlane /> Aller</p>
              <AddressAutocomplete label="Lieu de départ" required
                value={getAddr(trajetClassique.TCallerpriseencharge)}
                onChange={(v) => setTrajetClassique(t => ({ ...t, TCallerpriseencharge: typeof v === "object" ? v : { formatted: v } }))} />
              <AddressAutocomplete label="Destination" required
                value={getAddr(trajetClassique.TCallerDestination)}
                onChange={(v) => setTrajetClassique(t => ({ ...t, TCallerDestination: typeof v === "object" ? v : { formatted: v } }))} />
              <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel required>Date</FieldLabel>
                  <StyledInput icon={<IconCalendar />} required type="date" value={trajetClassique.TCallerdate}
                    onChange={(e) => setTrajetClassique(t => ({ ...t, TCallerdate: e.target.value }))} /></div>
                <div><FieldLabel required>Heure</FieldLabel>
                  <StyledInput icon={<IconClock />} required type="time" value={trajetClassique.TCallerheure}
                    onChange={(e) => setTrajetClassique(t => ({ ...t, TCallerheure: e.target.value }))} /></div>
              </div>
            </div>

            {/* Retour */}
            {isAR && (
              <div className="rounded-xl p-4 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(20,20,22,0.7) 0%, rgba(15,15,17,0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
                <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.12em] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>Retour
                </p>

                {/* Adresse de retour différente ? */}
                {!isARMAD && (
                  <div>
                    <FieldLabel>Adresse de retour</FieldLabel>
                    <ToggleSwitch value={tcRetourAdresseDifferente} onChange={setTcRetourAdresseDifferente}
                      labelOff="Mêmes adresses (inversées)" labelOn="Adresses différentes" />
                  </div>
                )}

                {tcRetourAdresseDifferente && (
                  <>
                    <AddressAutocomplete label="Lieu de départ (retour)" required
                      value={getAddr(trajetClassique.TCretourpriseencharge)}
                      onChange={(v) => setTrajetClassique(t => ({ ...t, TCretourpriseencharge: typeof v === "object" ? v : { formatted: v } }))} />
                    <AddressAutocomplete label="Destination (retour)" required
                      value={getAddr(trajetClassique.TCretourDestination)}
                      onChange={(v) => setTrajetClassique(t => ({ ...t, TCretourDestination: typeof v === "object" ? v : { formatted: v } }))} />
                  </>
                )}

                {!isARMAD && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><FieldLabel required>Date (retour)</FieldLabel>
                      <StyledInput icon={<IconCalendar />} required type="date" value={trajetClassique.TCretourdate}
                        onChange={(e) => setTrajetClassique(t => ({ ...t, TCretourdate: e.target.value }))} /></div>
                    <div><FieldLabel required>Heure (retour)</FieldLabel>
                      <StyledInput icon={<IconClock />} required type="time" value={trajetClassique.TCretourheure}
                        onChange={(e) => setTrajetClassique(t => ({ ...t, TCretourheure: e.target.value }))} /></div>
                  </div>
                )}

                {isARMAD && (
                  <div>
                    <FieldLabel>Durée mise à disposition (heures)</FieldLabel>
                    <StyledInput icon={<IconClock />} type="number" min={0} step={0.5}
                      value={trajetClassique.HeureMADClassique}
                      onChange={(e) => setTrajetClassique(t => ({ ...t, HeureMADClassique: e.target.value }))}
                      placeholder="Ex : 2" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════ MAD ÉVÉNEMENTIEL ════════════ */}
        {typeService === "MAD Evenementiel" && (
          <div className="space-y-5">
            <AddressAutocomplete label="Lieu de l'événement" required
              value={getAddr(madEvenementiel.LieuEvenement)}
              onChange={(v) => setMadEvenementiel(e => ({ ...e, LieuEvenement: typeof v === "object" ? v : { formatted: v } }))} />
            <div className="grid grid-cols-2 gap-3">
              <div><FieldLabel required>Date</FieldLabel>
                <StyledInput icon={<IconCalendar />} required type="date" value={madEvenementiel.DateEvenement}
                  onChange={(e) => setMadEvenementiel(ev => ({ ...ev, DateEvenement: e.target.value }))} /></div>
              <div><FieldLabel required>Heure de début</FieldLabel>
                <StyledInput icon={<IconClock />} required type="time" value={madEvenementiel.HeureEvenement}
                  onChange={(e) => setMadEvenementiel(ev => ({ ...ev, HeureEvenement: e.target.value }))} /></div>
            </div>
            <div>
              <FieldLabel required>Durée de mise à disposition (heures)</FieldLabel>
              <StyledInput icon={<IconClock />} required type="number" min={1} step={0.5}
                value={madEvenementiel.HeureMADEvenement}
                onChange={(e) => setMadEvenementiel(ev => ({ ...ev, HeureMADEvenement: e.target.value }))}
                placeholder="Ex : 4" />
            </div>
            <div>
              <FieldLabel>Nombre d&apos;invités (indicatif)</FieldLabel>
              <div className="flex items-center gap-4">
                <PassagerStepper value={madEvenementiel.nombreinvites} max={100}
                  onChange={(v) => setMadEvenementiel(ev => ({ ...ev, nombreinvites: v }))} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ÉTAPE 3 : Estimation du tarif — MODE RÉSERVATION (avant les coordonnées) ── */}
      {!isDevis && (
        <div className="dashboard-card rounded-2xl p-5 md:p-6">
          <SectionHeader step="3" title="Estimation du tarif" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          } />
          {missingTarif.length > 0 && (
            <div className="mb-4"><Annotation type="warning">Pour calculer le tarif, veuillez renseigner : {missingTarif.join(", ")}.</Annotation></div>
          )}
          <button type="button" onClick={fetchTarif} disabled={loading || !canCalculateTarif}
            className="chrome-btn w-full py-3.5 rounded-lg text-primary font-bold text-sm uppercase tracking-widest hover:text-white active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3">
            {loading ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Calcul en cours…</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Calculer mon tarif</>
            )}
          </button>
          {tarif != null && (
            <div className="odometer-display mt-5 rounded-xl p-6 text-center relative overflow-hidden">
              <div className="stitch-line absolute top-0 left-4 right-4" />
              <p className="text-[10px] text-primary/60 uppercase tracking-[0.2em] font-bold mb-2">Tarif indicatif</p>
              <p className="text-5xl font-black text-white tabular-nums tracking-tight" style={{ textShadow: '0 0 20px rgba(255,133,51,0.3)' }}>{tarif} <span className="text-primary text-3xl font-bold">€</span></p>
              <div className="stitch-line mt-3 mb-2" />
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">Prix fixe TTC · Bagages inclus · Prise en charge à domicile</p>
            </div>
          )}
          {error && <div className="mt-4"><Annotation type="error">{error}</Annotation></div>}
        </div>
      )}

      {/* ── Coordonnées : Étape 3 (devis) / Étape 4 (réservation, après le tarif) ── */}
      <div className="dashboard-card rounded-2xl p-5 md:p-6">
        <SectionHeader step={isDevis ? "3" : "4"} title="Vos coordonnées" icon={<IconUser />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><FieldLabel required>Nom</FieldLabel>
            <StyledInput icon={<IconUser />} required value={client.nom} name="nom" autoComplete="family-name"
              onChange={(e) => setClient(c => ({ ...c, nom: e.target.value }))} placeholder="Votre nom" /></div>
          <div><FieldLabel required>Prénom</FieldLabel>
            <StyledInput icon={<IconUser />} required value={client.prenom} name="prenom" autoComplete="given-name"
              onChange={(e) => setClient(c => ({ ...c, prenom: e.target.value }))} placeholder="Votre prénom" /></div>
          <div><FieldLabel required>Téléphone</FieldLabel>
            <StyledInput icon={<IconPhone />} required type="tel" value={client.telephone} name="telephone" autoComplete="tel"
              onChange={(e) => setClient(c => ({ ...c, telephone: e.target.value }))} placeholder="06 XX XX XX XX" /></div>
          <div><FieldLabel required>Email</FieldLabel>
            <StyledInput icon={<IconMail />} required type="email" value={client.email} name="email" autoComplete="email"
              onChange={(e) => setClient(c => ({ ...c, email: e.target.value }))} placeholder="votre@email.fr" /></div>
        </div>

        {/* Options / Extras */}
        {typeService !== "MAD Evenementiel" && (
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-[0.12em]">Options / Extras</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXTRAS_OPTIONS.map((opt) => (
                <label key={opt.id}
                  className={`service-switch ${optionsExtras.includes(opt.value) ? "active" : ""} flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all`}>
                  <input type="checkbox" checked={optionsExtras.includes(opt.value)}
                    onChange={(e) => { if (e.target.checked) setOptionsExtras(prev => [...prev, opt.value]); else setOptionsExtras(prev => prev.filter(x => x !== opt.value)); }}
                    className="sr-only" />
                  <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${optionsExtras.includes(opt.value) ? "bg-primary border border-primary" : "border border-gray-600"}`}>
                    {optionsExtras.includes(opt.value) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </span>
                  <span className={`text-xs font-medium leading-tight ${optionsExtras.includes(opt.value) ? "text-primary" : "text-gray-400"}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Entreprise */}
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-[0.12em] flex items-center gap-2"><IconBuilding /> Professionnel ?</p>
          <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'linear-gradient(180deg, #0d0d0f 0%, #161618 100%)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03)' }}>
            <button type="button" onClick={() => setIsEntreprise(false)}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${!isEntreprise ? "bg-primary/15 text-primary border border-primary/30 shadow-glow" : "text-gray-500 hover:text-gray-300 border border-transparent"}`}>
              Particulier
            </button>
            <button type="button" onClick={() => setIsEntreprise(true)}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${isEntreprise ? "bg-primary/15 text-primary border border-primary/30 shadow-glow" : "text-gray-500 hover:text-gray-300 border border-transparent"}`}>
              Professionnel
            </button>
          </div>
          {isEntreprise && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><FieldLabel required>Nom de la société</FieldLabel>
                <StyledInput icon={<IconBuilding />} required value={client.nomSociete} name="nomSociete" autoComplete="organization"
                  onChange={(e) => setClient(c => ({ ...c, nomSociete: e.target.value }))} placeholder="ACME SAS" /></div>
              <div><FieldLabel>Adresse de la société</FieldLabel>
                <StyledInput icon={<IconPin />} value={client.adresseSociete} name="adresseSociete" autoComplete="street-address"
                  onChange={(e) => setClient(c => ({ ...c, adresseSociete: e.target.value }))} placeholder="1 rue de la Paix, 75001 Paris" /></div>
            </div>
          )}
        </div>

        {/* Commentaires */}
        <div className="mt-4">
          <FieldLabel>Commentaires / Informations complémentaires</FieldLabel>
          <textarea value={commentaires} onChange={(e) => setCommentaires(e.target.value)} rows={3}
            className="dashboard-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 focus:outline-none transition-all text-sm resize-none"
            placeholder="Informations complémentaires, accès difficile, bébé à bord..." />
        </div>
      </div>

      {/* ── BOUTON ENVOI ── */}

      {/* Mode DEVIS : bouton direct dès que le formulaire est rempli */}
      {isDevis && (
        <div className="space-y-4">
          {missingTarif.length > 0 && (
            <Annotation type="info">Complétez les informations du trajet : {missingTarif.join(", ")}.</Annotation>
          )}
          {missingCoord.length > 0 && canCalculateTarif && (
            <Annotation type="info">Complétez vos coordonnées : {missingCoord.join(", ")}.</Annotation>
          )}
          <button type="submit" disabled={submitStatus === "loading" || !canSubmitDevis}
            className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #FF8533 0%, #E07A2E 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(255,133,51,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            {submitStatus === "loading" ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Envoi en cours…</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Envoyer ma demande de devis</>
            )}
          </button>
          {submitStatus === "error" && <Annotation type="error">{error}</Annotation>}
          <p className="text-xs text-gray-600 text-center pt-2">
            En envoyant ce formulaire, vous acceptez nos{" "}
            <Link href="/mentions-legales" className="text-primary hover:underline">mentions légales</Link>.
          </p>
        </div>
      )}

      {/* Mode RÉSERVATION : bouton après calcul du tarif */}
      {!isDevis && tarif != null && tarifResult != null && (
        <div className="space-y-4">
          {missingCoord.length > 0 && (
            <Annotation type="info">Avant de confirmer, veuillez remplir vos coordonnées : {missingCoord.join(", ")}.</Annotation>
          )}
          <button type="submit" disabled={submitStatus === "loading" || !canSubmitReservation}
            className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #FF8533 0%, #E07A2E 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(255,133,51,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            {submitStatus === "loading" ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Envoi en cours…</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Confirmer ma réservation</>
            )}
          </button>
          {submitStatus === "error" && <Annotation type="error">{error}</Annotation>}
          <p className="text-xs text-gray-600 text-center pt-2">
            En envoyant ce formulaire, vous acceptez nos{" "}
            <Link href="/mentions-legales" className="text-primary hover:underline">mentions légales</Link>.
          </p>
        </div>
      )}
    </form>
  );
}
