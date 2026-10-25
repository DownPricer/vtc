"use client";

import { useEffect, useRef } from "react";
import { proBtnDangerClass, proBtnSecondaryClass } from "@/components/pro/settings/editable/proFieldStyles";

/** Une photo dans l'éditeur : déjà enregistrée (`id`) et/ou en attente d'envoi (`file`, aperçu local). */
export type PhotoItem = { key: string; id?: string; url: string; file?: File; alt: string };

export const MAX_PHOTOS = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type Props = {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
  vehicleName: string;
};

let seq = 0;
const newKey = () => `p_${Date.now()}_${seq++}`;

function checkFile(f: File): string | null {
  if (!ACCEPT.split(",").includes(f.type)) return `« ${f.name} » : format non autorisé (JPEG, PNG ou WebP uniquement).`;
  if (f.size > MAX_BYTES) return `« ${f.name} » : fichier trop volumineux (8 Mo maximum).`;
  if (f.size === 0) return `« ${f.name} » : fichier vide.`;
  return null;
}

/**
 * Gestion des 5 photos d'un véhicule : ajout (aperçu immédiat, envoi à l'enregistrement), remplacement,
 * suppression, réorganisation (◀ ▶) et choix de la photo principale (première position).
 */
export function VehiclePhotoManager({ photos, onChange, onError, disabled, vehicleName }: Props) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number>(-1);
  const created = useRef<Set<string>>(new Set());

  // Libère les aperçus locaux (object URLs) au démontage.
  useEffect(() => {
    const urls = created.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const preview = (f: File) => {
    const u = URL.createObjectURL(f);
    created.current.add(u);
    return u;
  };

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      onError(`Maximum ${MAX_PHOTOS} photos par véhicule. Supprimez une photo pour en ajouter une autre.`);
      return;
    }
    const accepted: PhotoItem[] = [];
    let problem: string | null = null;
    for (const f of files) {
      const err = checkFile(f);
      if (err) {
        problem = problem ?? err;
        continue;
      }
      if (accepted.length >= room) {
        problem = problem ?? `Maximum ${MAX_PHOTOS} photos : certaines images n'ont pas été ajoutées.`;
        break;
      }
      accepted.push({ key: newKey(), url: preview(f), file: f, alt: vehicleName });
    }
    onError(problem);
    if (accepted.length) onChange([...photos, ...accepted]);
  }

  function replaceWith(list: FileList | null) {
    const f = list?.[0];
    const i = replaceIndex.current;
    if (!f || i < 0 || i >= photos.length) return;
    const err = checkFile(f);
    if (err) {
      onError(err);
      return;
    }
    onError(null);
    const next = [...photos];
    next[i] = { ...next[i], url: preview(f), file: f };
    onChange(next);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] ?? null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--pro-text)]" aria-live="polite">
          {photos.length} photo{photos.length > 1 ? "s" : ""} sur {MAX_PHOTOS}
        </p>
        <button
          type="button"
          className={proBtnSecondaryClass}
          disabled={disabled || photos.length >= MAX_PHOTOS}
          onClick={() => addRef.current?.click()}
        >
          Ajouter des photos
        </button>
      </div>

      <input
        ref={addRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          replaceWith(e.target.files);
          e.target.value = "";
        }}
      />

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-3">
        {slots.map((p, i) =>
          p ? (
            <li key={p.key} className="flex flex-col gap-2 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--pro-panel-muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu d'administration (object URL ou /media) */}
                <img src={p.url} alt={`${vehicleName} — photo ${i + 1}`} className="h-full w-full object-cover" />
                <span
                  className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    i === 0 ? "bg-[var(--pro-accent)] text-white" : "bg-black/55 text-white"
                  }`}
                >
                  {i === 0 ? "Principale" : `Photo ${i + 1}`}
                </span>
                {p.file ? (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    À enregistrer
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Déplacer la photo ${i + 1} vers la gauche`}
                    disabled={disabled || i === 0}
                    onClick={() => move(i, i - 1)}
                    className={`${proBtnSecondaryClass} !px-2 !py-1 text-xs`}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    aria-label={`Déplacer la photo ${i + 1} vers la droite`}
                    disabled={disabled || i === photos.length - 1}
                    onClick={() => move(i, i + 1)}
                    className={`${proBtnSecondaryClass} !px-2 !py-1 text-xs`}
                  >
                    ▶
                  </button>
                </div>
                {i > 0 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => move(i, 0)}
                    className={`${proBtnSecondaryClass} !px-2 !py-1 text-xs`}
                  >
                    Couverture
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    replaceIndex.current = i;
                    replaceRef.current?.click();
                  }}
                  className={`${proBtnSecondaryClass} flex-1 whitespace-nowrap !px-2 !py-1 text-xs`}
                >
                  Remplacer
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onError(null);
                    onChange(photos.filter((_, j) => j !== i));
                  }}
                  className={`${proBtnDangerClass} flex-1 whitespace-nowrap !px-2 !py-1 text-xs`}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ) : (
            <li key={`empty-${i}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => addRef.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel-muted)] text-xs text-[var(--pro-text-muted)] transition hover:border-[var(--pro-accent)] hover:text-[var(--pro-text)] disabled:opacity-60"
              >
                <span className="text-xl leading-none">＋</span>
                {i === photos.length ? "Ajouter une photo" : `Photo ${i + 1}`}
              </button>
            </li>
          )
        )}
      </ul>
      <p className="mt-2 text-xs text-[var(--pro-text-muted)]">
        JPEG, PNG ou WebP, 8 Mo maximum. Les images sont optimisées à l&apos;enregistrement. La première photo est la photo principale.
      </p>
    </div>
  );
}
