"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { proBtnPrimaryClass, proBtnSecondaryClass } from "./proFieldStyles";

type Insets = { left: number; right: number; top: number; bottom: number };

const NO_INSETS: Insets = { left: 0, right: 0, top: 0, bottom: 0 };
const MAX_INSET = 45;
const MAX_OUTPUT_SIDE = 2000;

type ImageCropModalProps = {
  src: string;
  title?: string;
  /** Sortie : même format que la source (JPEG, WebP, sinon PNG pour garder la transparence). */
  onApply: (file: File) => Promise<void> | void;
  onClose: () => void;
};

function outputMime(src: string): "image/jpeg" | "image/webp" | "image/png" {
  const ext = (src.split("?")[0] ?? "").split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

const MIME_EXT = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" } as const;

/** Repère le contenu utile : pixels non transparents, ou différents du fond uni (coin haut-gauche). */
function detectContentInsets(img: HTMLImageElement): Insets | null {
  const maxSide = 600;
  const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasTransparency = true;
      break;
    }
  }
  const [br, bg, bb] = [data[0], data[1], data[2]];
  const isContent = (i: number) =>
    hasTransparency
      ? data[i + 3] > 12
      : Math.abs(data[i] - br) > 28 || Math.abs(data[i + 1] - bg) > 28 || Math.abs(data[i + 2] - bb) > 28;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isContent((y * w + x) * 4)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;

  const pad = 0.015; // petite marge pour ne pas coller au bord
  const clamp = (v: number) => Math.min(MAX_INSET, Math.max(0, v));
  return {
    left: clamp((minX / w - pad) * 100),
    right: clamp(((w - 1 - maxX) / w - pad) * 100),
    top: clamp((minY / h - pad) * 100),
    bottom: clamp(((h - 1 - maxY) / h - pad) * 100),
  };
}

const SLIDERS: { key: keyof Insets; label: string }[] = [
  { key: "left", label: "Gauche" },
  { key: "right", label: "Droite" },
  { key: "top", label: "Haut" },
  { key: "bottom", label: "Bas" },
];

const CHECKERBOARD =
  "bg-[length:16px_16px] [background-image:conic-gradient(#d4d4d8_25%,#fafafa_0_50%,#d4d4d8_0_75%,#fafafa_0)]";

export function ImageCropModal({ src, title = "Recadrer l’image", onApply, onClose }: ImageCropModalProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [insets, setInsets] = useState<Insets>(NO_INSETS);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => setImg(el);
    el.onerror = () => setLoadError("Impossible de charger cette image pour la recadrer (fichier introuvable ou hébergé ailleurs).");
    el.src = src;
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const region = useMemo(() => {
    if (!img) return null;
    const sx = Math.round((insets.left / 100) * img.naturalWidth);
    const sy = Math.round((insets.top / 100) * img.naturalHeight);
    const sw = Math.max(1, img.naturalWidth - sx - Math.round((insets.right / 100) * img.naturalWidth));
    const sh = Math.max(1, img.naturalHeight - sy - Math.round((insets.bottom / 100) * img.naturalHeight));
    return { sx, sy, sw, sh };
  }, [img, insets]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !img || !region) return;
    const ratio = Math.min(1, 360 / region.sw, 160 / region.sh);
    canvas.width = Math.max(1, Math.round(region.sw * ratio));
    canvas.height = Math.max(1, Math.round(region.sh * ratio));
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(img, region.sx, region.sy, region.sw, region.sh, 0, 0, canvas.width, canvas.height);
  }, [img, region]);

  const setInset = (key: keyof Insets, value: number) => {
    setNotice(null);
    setInsets((cur) => {
      const other = key === "left" ? cur.right : key === "right" ? cur.left : key === "top" ? cur.bottom : cur.top;
      // Garde au moins 10 % de largeur/hauteur visible.
      return { ...cur, [key]: Math.min(value, 90 - other) };
    });
  };

  const autoTrim = () => {
    if (!img) return;
    const found = detectContentInsets(img);
    if (!found) {
      setNotice("Aucun contenu détecté : réglez les marges à la main.");
      return;
    }
    const total = found.left + found.right + found.top + found.bottom;
    setInsets(found);
    setNotice(total < 1 ? "Cette image n’a presque pas de marges à retirer." : "Marges vides retirées. Ajustez si besoin.");
  };

  const apply = useCallback(async () => {
    if (!img || !region) return;
    setBusy(true);
    try {
      const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(region.sw, region.sh));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(region.sw * scale));
      canvas.height = Math.max(1, Math.round(region.sh * scale));
      canvas.getContext("2d")?.drawImage(img, region.sx, region.sy, region.sw, region.sh, 0, 0, canvas.width, canvas.height);
      const mime = outputMime(src);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.92));
      if (!blob) throw new Error("Export impossible.");
      if (blob.size > 5 * 1024 * 1024) throw new Error("Le résultat dépasse 5 Mo : recadrez davantage.");
      await onApply(new File([blob], `recadre.${MIME_EXT[mime]}`, { type: mime }));
      onClose();
    } catch (e) {
      setNotice((e as Error).message || "Échec du recadrage.");
    } finally {
      setBusy(false);
    }
  }, [img, region, src, onApply, onClose]);

  const changed = insets.left + insets.right + insets.top + insets.bottom > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-5 shadow-2xl">
        <h3 className="text-base font-bold text-[var(--pro-text)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--pro-text-muted)]">
          Retirez les bords inutiles : le contenu occupera plus de place sur le site. Le fichier d’origine n’est pas supprimé.
        </p>

        {loadError ? (
          <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-[var(--pro-text)]">{loadError}</p>
        ) : !img ? (
          <p className="mt-6 text-sm text-[var(--pro-text-muted)]">Chargement de l’image…</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className={`relative mx-auto w-fit max-w-full overflow-hidden rounded-xl border border-[var(--pro-border)] ${CHECKERBOARD}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- recadrage : aperçu natif */}
              <img src={src} alt="Image à recadrer" className="block max-h-64 max-w-full select-none" draggable={false} />
              {/* Zone retirée assombrie + cadre de la zone conservée */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 bg-black/55" style={{ height: `${insets.top}%` }} />
                <div className="absolute inset-x-0 bottom-0 bg-black/55" style={{ height: `${insets.bottom}%` }} />
                <div
                  className="absolute bg-black/55"
                  style={{ left: 0, width: `${insets.left}%`, top: `${insets.top}%`, bottom: `${insets.bottom}%` }}
                />
                <div
                  className="absolute bg-black/55"
                  style={{ right: 0, width: `${insets.right}%`, top: `${insets.top}%`, bottom: `${insets.bottom}%` }}
                />
                <div
                  className="absolute border-2 border-dashed border-[var(--pro-accent)]"
                  style={{
                    left: `${insets.left}%`,
                    right: `${insets.right}%`,
                    top: `${insets.top}%`,
                    bottom: `${insets.bottom}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SLIDERS.map(({ key, label }) => (
                <label key={key} className="block text-sm text-[var(--pro-text)]">
                  <span className="flex justify-between text-xs font-medium text-[var(--pro-text-muted)]">
                    <span>Retirer à {label.toLowerCase()}</span>
                    <span>{Math.round(insets[key])} %</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={MAX_INSET}
                    step={0.5}
                    value={insets[key]}
                    onChange={(e) => setInset(key, Number(e.target.value))}
                    className="mt-1 w-full accent-[var(--pro-accent)]"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={proBtnSecondaryClass} onClick={autoTrim} disabled={busy}>
                Rogner les marges automatiquement
              </button>
              <button
                type="button"
                className={proBtnSecondaryClass}
                onClick={() => {
                  setInsets(NO_INSETS);
                  setNotice(null);
                }}
                disabled={busy || !changed}
              >
                Réinitialiser
              </button>
              {notice ? <span className="text-xs text-[var(--pro-text-muted)]">{notice}</span> : null}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--pro-text-muted)]">Résultat</p>
              <div className={`flex min-h-24 items-center justify-center rounded-xl border border-[var(--pro-border)] p-3 ${CHECKERBOARD}`}>
                <canvas ref={previewRef} className="max-w-full" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2.5">
          <button type="button" className={proBtnSecondaryClass} onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="button" className={proBtnPrimaryClass} onClick={() => void apply()} disabled={busy || !img || !changed}>
            {busy ? "Enregistrement…" : "Appliquer le recadrage"}
          </button>
        </div>
      </div>
    </div>
  );
}
