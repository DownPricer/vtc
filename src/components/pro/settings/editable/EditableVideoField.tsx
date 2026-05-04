"use client";

import { useRef, useState } from "react";
import { HelpTooltip } from "../HelpTooltip";
import { isSafeSettingsUploadVideoPublicPath } from "@/lib/settingsUploadPolicy";
import { deleteSettingsMediaFile, uploadSettingsVideo } from "@/lib/settingsMediaClient";
import { proBtnSecondaryClass, proInputClass, proLabelClass } from "./proFieldStyles";

const ACCEPT = "video/mp4,video/webm,video/quicktime";

type EditableVideoFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  hint?: string;
};

function triggerDownload(src: string) {
  const s = src.trim();
  if (!s) return;
  if (s.startsWith("http://") || s.startsWith("https://")) {
    window.open(s, "_blank", "noopener,noreferrer");
    return;
  }
  try {
    const a = document.createElement("a");
    a.href = s;
    a.download = s.split("/").filter(Boolean).pop() || "video";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(s, "_blank", "noopener,noreferrer");
  }
}

function videoMimeFromPath(path: string): string {
  const lower = path.split("?")[0]?.toLowerCase() ?? "";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

export function EditableVideoField({ label, value, onChange, editing, hint }: EditableVideoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const onFile = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const previous = value.trim() && isSafeSettingsUploadVideoPublicPath(value.trim()) ? value.trim() : undefined;
      const { publicPath } = await uploadSettingsVideo(file, previous);
      onChange(publicPath);
    } catch (e) {
      setError((e as Error).message || "Échec de l’upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setError(null);
    const v = value.trim();
    if (v && isSafeSettingsUploadVideoPublicPath(v)) {
      setBusy(true);
      try {
        await deleteSettingsMediaFile(v);
      } finally {
        setBusy(false);
      }
    }
    onChange("");
  };

  const trimmed = value.trim();
  const showPreview = Boolean(trimmed);

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={proLabelClass}>{label}</span>
          {hint ? <HelpTooltip text={hint} /> : null}
        </div>
      </div>
      {editing ? (
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => void onFile(e.target.files)}
        />
      ) : null}
      {showPreview ? (
        <div className="overflow-hidden rounded-xl border border-[var(--pro-border)] bg-black/80">
          <video
            key={trimmed}
            controls
            className="aspect-video w-full max-h-56 bg-black"
            preload="metadata"
          >
            <source src={trimmed} type={videoMimeFromPath(trimmed)} />
          </video>
        </div>
      ) : (
        <figure className="rounded-xl border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-6 text-center">
          <figcaption className="text-xs text-[var(--pro-text-muted)]">
            {editing ? "Aucune vidéo — importez un fichier MP4, WebM ou MOV." : "Aucune vidéo enregistrée."}
          </figcaption>
        </figure>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={proBtnSecondaryClass} disabled={!trimmed || busy} onClick={() => triggerDownload(trimmed)}>
          Télécharger la vidéo actuelle
        </button>
        {editing ? (
          <>
            <button type="button" className={proBtnSecondaryClass} disabled={busy} onClick={openPicker}>
              {busy ? "Traitement…" : "Importer / remplacer la vidéo"}
            </button>
            <button type="button" className={proBtnSecondaryClass} disabled={busy} onClick={() => void handleRemove()}>
              Supprimer la vidéo
            </button>
          </>
        ) : null}
      </div>
      {editing ? (
        <details className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium text-[var(--pro-text-soft)]">Chemin ou URL (avancé)</summary>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${proInputClass} mt-2 font-mono text-[13px]`}
            placeholder="/uploads/settings/default/… ou URL https://"
          />
        </details>
      ) : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
