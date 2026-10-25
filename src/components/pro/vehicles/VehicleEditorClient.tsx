"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProAlert, ProPageHead, ProPanel, ProSectionHeader, proInputClass } from "@/components/pro/ProUi";
import { proBtnPrimaryClass, proBtnSecondaryClass } from "@/components/pro/settings/editable/proFieldStyles";
import {
  addVehiclePhoto,
  createProVehicle,
  featureProVehicle,
  getProVehicle,
  removeVehiclePhoto,
  reorderVehiclePhotos,
  replaceVehiclePhoto,
  SURCHARGE_LABELS,
  updateProVehicle,
  type ProVehicle,
  type SurchargeMode,
  type VehicleWritePayload,
} from "@/lib/proVehiclesClient";
import { VehicleBlocksPanel } from "./VehicleBlocksPanel";
import { MAX_PHOTOS, VehiclePhotoManager, type PhotoItem } from "./VehiclePhotoManager";

type Form = {
  name: string;
  brand: string;
  model: string;
  trim: string;
  year: string;
  vehicleType: string;
  category: string;
  shortDescription: string;
  description: string;
  active: boolean;
  featured: boolean;
  passengerMax: string;
  luggageLabel: string;
  largeBags: string;
  airConditioning: boolean;
  wifi: boolean;
  usbChargers: boolean;
  babySeats: boolean;
  accessible: boolean;
  features: string;
  paymentChips: string;
  internalRef: string;
  licensePlate: string;
  surchargeMode: SurchargeMode;
  surchargeValue: string;
};

const EMPTY: Form = {
  name: "", brand: "", model: "", trim: "", year: "", vehicleType: "", category: "", shortDescription: "", description: "",
  active: true, featured: false, passengerMax: "4", luggageLabel: "", largeBags: "", airConditioning: true, wifi: false,
  usbChargers: false, babySeats: false, accessible: false, features: "", paymentChips: "", internalRef: "", licensePlate: "",
  surchargeMode: "none", surchargeValue: "",
};

const CATEGORIES = ["Standard", "Business", "Premium", "Van", "Luxe"];
const TYPES = ["Berline", "SUV", "Monospace", "Van", "Break", "Électrique"];

const list = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const numOrNull = (s: string) => {
  const n = Number.parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

function fromVehicle(v: ProVehicle): Form {
  return {
    name: v.name, brand: v.brand ?? "", model: v.model ?? "", trim: v.trim ?? "", year: v.year ? String(v.year) : "",
    vehicleType: v.vehicleType ?? "", category: v.category ?? "", shortDescription: v.shortDescription, description: v.description ?? "",
    active: v.active, featured: v.featured, passengerMax: String(v.passengerMax), luggageLabel: v.luggageLabel ?? "",
    largeBags: v.largeBags != null ? String(v.largeBags) : "", airConditioning: v.airConditioning, wifi: v.wifi,
    usbChargers: v.usbChargers, babySeats: v.babySeats, accessible: v.accessible, features: v.features.join(", "),
    paymentChips: v.paymentChips.join(", "), internalRef: v.internalRef ?? "", licensePlate: v.licensePlate ?? "",
    surchargeMode: v.surchargeMode, surchargeValue: v.surchargeMode === "none" ? "" : String(v.surchargeValue),
  };
}

function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[13px] font-bold text-[var(--pro-text)]">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-[var(--pro-text-muted)]">{hint}</span> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-2.5">
      <input type="checkbox" className="mt-0.5 h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-[var(--pro-text)]">{label}</span>
        {hint ? <span className="block text-xs text-[var(--pro-text-muted)]">{hint}</span> : null}
      </span>
    </label>
  );
}

function surchargeSentence(mode: SurchargeMode, raw: string): string {
  const n = numOrNull(raw);
  const v = n == null ? "…" : String(n).replace(".", ",");
  if (mode === "fixed") return `Ce véhicule ajoute ${v} € au tarif calculé.`;
  if (mode === "per_km") return `Ce véhicule ajoute ${v} € pour chaque kilomètre facturable.`;
  if (mode === "percent_km") return `Ce véhicule augmente de ${v} % la composante kilométrique du tarif.`;
  return "Ce véhicule est proposé au tarif calculé, sans supplément.";
}

const SURCHARGE_HELP: Record<SurchargeMode, string> = {
  none: "Le tarif du moteur est appliqué tel quel.",
  fixed: "Ajouté une seule fois au prix de la course, quel que soit le type de trajet.",
  per_km: "Multiplié par les kilomètres facturés par le moteur (approche et retour au dépôt inclus quand ils sont facturés). Sans effet sur une mise à disposition horaire.",
  percent_km: "Appliqué une seule fois à la partie kilométrique du tarif (pas au prix total, pas aux heures de mise à disposition). Sans effet sur une mise à disposition horaire.",
};

export function VehicleEditorClient({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const isNew = vehicleId === "nouveau";
  const [loaded, setLoaded] = useState(isNew);
  const [vehicle, setVehicle] = useState<ProVehicle | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const initialPhotos = useRef<ProVehicle["photos"]>([]);

  function hydrate(v: ProVehicle) {
    setVehicle(v);
    setForm(fromVehicle(v));
    initialPhotos.current = v.photos;
    setPhotos(v.photos.map((p) => ({ key: p.id, id: p.id, url: p.url, alt: p.alt })));
  }

  useEffect(() => {
    if (isNew) return;
    getProVehicle(vehicleId)
      .then((v) => {
        hydrate(v);
        setLoaded(true);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoaded(true);
      });
  }, [vehicleId, isNew]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const payload = useMemo<VehicleWritePayload>(
    () => ({
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      trim: form.trim.trim() || null,
      year: numOrNull(form.year),
      vehicleType: form.vehicleType.trim() || null,
      category: form.category.trim() || null,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim() || null,
      active: form.active,
      passengerMax: Math.max(1, Math.round(numOrNull(form.passengerMax) ?? 1)),
      luggageLabel: form.luggageLabel.trim() || null,
      largeBags: numOrNull(form.largeBags),
      airConditioning: form.airConditioning,
      wifi: form.wifi,
      usbChargers: form.usbChargers,
      babySeats: form.babySeats,
      accessible: form.accessible,
      features: list(form.features),
      paymentChips: list(form.paymentChips),
      internalRef: form.internalRef.trim() || null,
      licensePlate: form.licensePlate.trim() || null,
      surchargeMode: form.surchargeMode,
      surchargeValue: form.surchargeMode === "none" ? 0 : Math.max(0, numOrNull(form.surchargeValue) ?? 0),
    }),
    [form]
  );

  async function syncPhotos(id: string, initial: ProVehicle["photos"]): Promise<ProVehicle> {
    const keepIds = new Set(photos.filter((p) => p.id).map((p) => p.id!));
    let latest: ProVehicle | null = null;
    // 1) suppressions d'abord (libère des places), 2) remplacements, 3) ajouts, 4) ordre final.
    for (const old of initial) if (!keepIds.has(old.id)) latest = await removeVehiclePhoto(id, old.id);
    for (const p of photos) if (p.id && p.file) latest = await replaceVehiclePhoto(id, p.id, p.file);
    const finalIds: string[] = [];
    const known = new Set(photos.filter((p) => p.id).map((p) => p.id!));
    for (const p of photos) {
      if (p.id) {
        finalIds.push(p.id);
      } else if (p.file) {
        latest = await addVehiclePhoto(id, p.file, form.name.trim());
        const added = latest.photos.find((x) => !known.has(x.id));
        if (!added) throw new Error("Photo enregistrée mais introuvable : rechargez la page.");
        known.add(added.id);
        finalIds.push(added.id);
      }
    }
    if (finalIds.length > 1) latest = await reorderVehiclePhotos(id, finalIds);
    return latest ?? (await getProVehicle(id));
  }

  async function save() {
    setError(null);
    setNotice(null);
    if (!form.name.trim()) {
      setError("Le nom du véhicule est obligatoire.");
      return;
    }
    if (form.surchargeMode !== "none") {
      const n = numOrNull(form.surchargeValue);
      if (n == null || n < 0) return setError("Indiquez le montant du supplément (nombre positif).");
      if (form.surchargeMode === "percent_km" && n > 100) return setError("Le pourcentage doit être compris entre 0 et 100.");
    }
    setSaving(true);
    try {
      let saved: ProVehicle = isNew ? await createProVehicle(payload) : await updateProVehicle(vehicleId, payload);
      try {
        saved = await syncPhotos(saved.id, isNew ? [] : initialPhotos.current);
      } catch (e) {
        // Le véhicule est enregistré ; seules des photos ont échoué : on reste sur la fiche pour réessayer.
        if (isNew) router.replace(`/pro/vehicules/${saved.id}`);
        setError(`Véhicule enregistré, mais une photo n'a pas pu l'être : ${(e as Error).message}`);
        return;
      }
      if (form.featured && form.active && !saved.featured) saved = await featureProVehicle(saved.id);
      if (isNew) {
        router.replace(`/pro/vehicules/${saved.id}`);
      } else {
        hydrate(saved);
        setNotice("Véhicule enregistré.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const coverUrl = photos[0]?.url;
  const pending =
    photos.some((p) => p.file) ||
    (!isNew && (photos.length !== initialPhotos.current.length || photos.some((p, i) => p.id !== initialPhotos.current[i]?.id)));

  return (
    <ProGuard>
      <div className="space-y-5">
        <ProPageHead
          eyebrow="Mes véhicules"
          title={isNew ? "Nouveau véhicule" : form.name || "Véhicule"}
          description="Renseignez l'essentiel : le client voit le nom, les photos, la capacité et le supplément éventuel."
          action={
            <div className="flex gap-2">
              <Link href="/pro/vehicules" className={proBtnSecondaryClass}>
                Retour à la flotte
              </Link>
              <button type="button" onClick={save} disabled={saving || !loaded} className={proBtnPrimaryClass}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          }
        />

        {error ? <ProAlert tone="error">{error}</ProAlert> : null}
        {notice ? <ProAlert tone="success">{notice}</ProAlert> : null}
        {vehicle?.archived ? <ProAlert tone="warning">Ce véhicule est archivé : il n&apos;est plus proposé aux clients.</ProAlert> : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="space-y-5">
            {/* 1. Informations générales */}
            <ProPanel>
              <ProSectionHeader level="panel" title="1. Informations générales" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom commercial *" className="sm:col-span-2">
                  <input className={proInputClass} value={form.name} maxLength={80} onChange={(e) => set("name", e.target.value)} placeholder="Mercedes Classe V" />
                </Field>
                <Field label="Marque">
                  <input className={proInputClass} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Mercedes-Benz" />
                </Field>
                <Field label="Modèle">
                  <input className={proInputClass} value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Classe V" />
                </Field>
                <Field label="Version / finition">
                  <input className={proInputClass} value={form.trim} onChange={(e) => set("trim", e.target.value)} placeholder="Avantgarde Long" />
                </Field>
                <Field label="Année">
                  <input className={proInputClass} inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2023" />
                </Field>
                <Field label="Type de véhicule">
                  <input className={proInputClass} list="veh-types" value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} placeholder="Van" />
                  <datalist id="veh-types">{TYPES.map((t) => <option key={t} value={t} />)}</datalist>
                </Field>
                <Field label="Catégorie">
                  <input className={proInputClass} list="veh-cats" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Premium" />
                  <datalist id="veh-cats">{CATEGORIES.map((t) => <option key={t} value={t} />)}</datalist>
                </Field>
                <Field label="Description courte" className="sm:col-span-2" hint="Une phrase d'accroche affichée sous le nom.">
                  <input className={proInputClass} value={form.shortDescription} maxLength={160} onChange={(e) => set("shortDescription", e.target.value)} placeholder="7 passagers · Confort premium" />
                </Field>
                <Field label="Description détaillée" className="sm:col-span-2">
                  <textarea className={`${proInputClass} min-h-[96px]`} value={form.description} maxLength={2000} onChange={(e) => set("description", e.target.value)} />
                </Field>
              </div>
            </ProPanel>

            {/* 2. Photos */}
            <ProPanel>
              <ProSectionHeader level="panel" title="2. Photos" description="Jusqu'à 5 photos. L'envoi a lieu quand vous cliquez sur « Enregistrer »." />
              {photoError ? <div className="mb-3"><ProAlert tone="error">{photoError}</ProAlert></div> : null}
              <VehiclePhotoManager
                photos={photos}
                onChange={setPhotos}
                onError={setPhotoError}
                disabled={saving}
                vehicleName={form.name || "Véhicule"}
              />
              {pending ? <p className="mt-3 text-xs font-medium text-amber-600">Modifications de photos non enregistrées.</p> : null}
            </ProPanel>

            {/* 3. Capacités & équipements */}
            <ProPanel>
              <ProSectionHeader level="panel" title="3. Capacités et équipements" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Passagers maximum *">
                  <input className={proInputClass} type="number" min={1} max={99} value={form.passengerMax} onChange={(e) => set("passengerMax", e.target.value)} />
                </Field>
                <Field label="Gros bagages (nombre)" hint="Laisser vide = non limité.">
                  <input className={proInputClass} type="number" min={0} max={50} value={form.largeBags} onChange={(e) => set("largeBags", e.target.value)} />
                </Field>
                <Field label="Capacité bagages (texte)">
                  <input className={proInputClass} value={form.luggageLabel} maxLength={80} onChange={(e) => set("luggageLabel", e.target.value)} placeholder="Bagages inclus" />
                </Field>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Toggle label="Climatisation" checked={form.airConditioning} onChange={(v) => set("airConditioning", v)} />
                <Toggle label="Wi-Fi" checked={form.wifi} onChange={(v) => set("wifi", v)} />
                <Toggle label="Chargeurs USB" checked={form.usbChargers} onChange={(v) => set("usbChargers", v)} />
                <Toggle label="Sièges bébé disponibles" checked={form.babySeats} onChange={(v) => set("babySeats", v)} />
                <Toggle label="Accessible PMR" checked={form.accessible} onChange={(v) => set("accessible", v)} />
              </div>
              <Field label="Autres équipements" className="mt-4" hint="Séparés par des virgules : eau, presse, siège cuir…">
                <input className={proInputClass} value={form.features} onChange={(e) => set("features", e.target.value)} />
              </Field>
            </ProPanel>

            {/* 4. Tarification supplémentaire */}
            <ProPanel>
              <ProSectionHeader
                level="panel"
                title="4. Tarification supplémentaire"
                description="Le supplément s'ajoute au tarif calculé par votre grille. Il est calculé par le serveur, jamais par le navigateur."
              />
              <fieldset>
                <legend className="sr-only">Type de supplément</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(SURCHARGE_LABELS) as SurchargeMode[]).map((m) => (
                    <label
                      key={m}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                        form.surchargeMode === m ? "border-[var(--pro-accent)] bg-[var(--pro-accent-soft)]" : "border-[var(--pro-border)] bg-[var(--pro-panel-muted)]"
                      }`}
                    >
                      <input type="radio" name="surcharge" className="mt-1" checked={form.surchargeMode === m} onChange={() => set("surchargeMode", m)} />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--pro-text)]">{SURCHARGE_LABELS[m]}</span>
                        <span className="block text-xs text-[var(--pro-text-muted)]">{SURCHARGE_HELP[m]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {form.surchargeMode !== "none" ? (
                <Field
                  className="mt-4 max-w-xs"
                  label={form.surchargeMode === "fixed" ? "Montant fixe (€)" : form.surchargeMode === "per_km" ? "Supplément (€ par km)" : "Majoration (%)"}
                >
                  <input
                    className={proInputClass}
                    inputMode="decimal"
                    value={form.surchargeValue}
                    onChange={(e) => set("surchargeValue", e.target.value)}
                    placeholder={form.surchargeMode === "fixed" ? "50" : form.surchargeMode === "per_km" ? "0,50" : "20"}
                  />
                </Field>
              ) : null}
              <p className="mt-4 rounded-lg bg-[var(--pro-panel-muted)] px-3 py-2.5 text-sm font-medium text-[var(--pro-text)]" aria-live="polite">
                {surchargeSentence(form.surchargeMode, form.surchargeValue)}
              </p>
              <p className="mt-2 text-xs text-[var(--pro-text-muted)]">
                Les devis et réservations déjà envoyés gardent le prix communiqué : changer le supplément ne les modifie pas.
              </p>
            </ProPanel>

            {/* 5. Disponibilités */}
            <ProPanel id="disponibilites">
              <ProSectionHeader
                level="panel"
                title="5. Disponibilités"
                description="Un véhicule = une seule réservation confirmée par journée. Bloquez les jours d'entretien, de réparation ou de congés."
              />
              {isNew ? (
                <p className="text-sm text-[var(--pro-text-muted)]">Enregistrez d&apos;abord le véhicule pour bloquer des dates.</p>
              ) : (
                <>
                  <VehicleBlocksPanel vehicleId={vehicleId} />
                  <p className="mt-3 text-sm">
                    <Link href={`/pro/calendrier?vehicule=${vehicleId}`} className="font-semibold text-[var(--pro-accent)] hover:underline">
                      Voir le calendrier de ce véhicule →
                    </Link>
                  </p>
                </>
              )}
            </ProPanel>

            {/* 6. Publication */}
            <ProPanel>
              <ProSectionHeader level="panel" title="6. Publication sur le site" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Toggle label="Véhicule actif" checked={form.active} onChange={(v) => set("active", v)} hint="Inactif : plus proposé aux clients (les réservations existantes sont conservées)." />
                <Toggle
                  label="Mis en avant sur le site"
                  checked={form.featured}
                  onChange={(v) => set("featured", v)}
                  hint="Un seul véhicule est mis en avant (page d'accueil)."
                />
              </div>
              <Field label="Moyens de paiement affichés" className="mt-4" hint="Séparés par des virgules : CB, Virement, Espèces…">
                <input className={proInputClass} value={form.paymentChips} onChange={(e) => set("paymentChips", e.target.value)} />
              </Field>

              <details className="mt-4 rounded-lg border border-[var(--pro-border)] px-3 py-2">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--pro-text)]">Informations internes (jamais affichées au public)</summary>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Référence interne">
                    <input className={proInputClass} value={form.internalRef} onChange={(e) => set("internalRef", e.target.value)} placeholder="V-02" />
                  </Field>
                  <Field label="Immatriculation">
                    <input className={proInputClass} value={form.licensePlate} onChange={(e) => set("licensePlate", e.target.value)} placeholder="AB-123-CD" />
                  </Field>
                </div>
              </details>
            </ProPanel>

            <div className="flex justify-end gap-2">
              <Link href="/pro/vehicules" className={proBtnSecondaryClass}>
                Annuler
              </Link>
              <button type="button" onClick={save} disabled={saving || !loaded} className={proBtnPrimaryClass}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* Aperçu de la carte publique */}
          <aside className="xl:sticky xl:top-5">
            <ProPanel>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--pro-eyebrow)]">Aperçu pour vos clients</p>
              <div className="overflow-hidden rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]">
                <div className="relative aspect-[16/10] w-full bg-black/10">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- aperçu
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--pro-text-muted)]">Photo à venir</div>
                  )}
                  {photos.length > 1 ? (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {photos.length} photos
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1 p-3">
                  <p className="font-bold text-[var(--pro-text)]">{form.name || "Nom du véhicule"}</p>
                  <p className="text-xs text-[var(--pro-text-muted)]">
                    {form.passengerMax || 1} passagers max.
                    {form.luggageLabel ? ` · ${form.luggageLabel}` : ""}
                  </p>
                  {form.shortDescription ? <p className="text-xs text-[var(--pro-text-muted)]">{form.shortDescription}</p> : null}
                  <p className="pt-1 text-xs font-semibold text-[var(--pro-accent)]">
                    {form.surchargeMode === "none"
                      ? "Tarif standard"
                      : form.surchargeMode === "fixed"
                        ? `+${form.surchargeValue || 0} € sur votre trajet`
                        : form.surchargeMode === "per_km"
                          ? `+${form.surchargeValue || 0} €/km`
                          : `+${form.surchargeValue || 0} % sur la partie kilométrique`}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--pro-text-muted)]">
                {MAX_PHOTOS} photos maximum · {form.active ? "Visible par les clients" : "Masqué (inactif)"}
              </p>
            </ProPanel>
          </aside>
        </div>
      </div>
    </ProGuard>
  );
}
