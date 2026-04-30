"use client";

import { useRef, useState } from "react";
import { ReadonlyImagePreview } from "../ReadonlyImagePreview";
import { HelpTooltip } from "../HelpTooltip";
import { isSafeSettingsUploadPublicPath } from "@/lib/settingsUploadPolicy";
import { deleteSettingsMediaFile, uploadSettingsMedia } from "@/lib/settingsMediaClient";
import { proBtnSecondaryClass, proInputClass, proLabelClass } from "./proFieldStyles";

const ACCEPT = "image/jpeg,image/png,image/webp";

type EditableImageFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  hint?: string;
  altPreview?: string;
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
    a.download = s.split("/").filter(Boolean).pop() || "image";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(s, "_blank", "noopener,noreferrer");
  }
}

export function EditableImageField({ label, value, onChange, editing, hint, altPreview = "Aperçu" }: EditableImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const onFile = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    const mime = file.type.toLowerCase().split(";")[0]?.trim() ?? "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
      setError("Format non accepté (JPEG, PNG ou WebP uniquement — pas de SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (max. 5 Mo).");
      return;
    }
    setBusy(true);
    try {
      const previous = value.trim() && isSafeSettingsUploadPublicPath(value.trim()) ? value.trim() : undefined;
      const { publicPath } = await uploadSettingsMedia(file, previous);
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
    if (v && isSafeSettingsUploadPublicPath(v)) {
      setBusy(true);
      try {
        await deleteSettingsMediaFile(v);
      } finally {
        setBusy(false);
      }
    }
    onChange("");
  };

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
      {editing ? (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`${proInputClass} font-mono text-[13px]`} />
      ) : (
        <p className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 font-mono text-[13px] text-[var(--pro-text-soft)]">
          {value.trim() ? value : "—"}
        </p>
      )}
      <ReadonlyImagePreview src={value} alt={altPreview} caption="Aperçu" />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={proBtnSecondaryClass} disabled={!value.trim() || busy} onClick={() => triggerDownload(value)}>
          Télécharger l’image actuelle
        </button>
        {editing ? (
          <>
            <button type="button" className={proBtnSecondaryClass} disabled={busy} onClick={openPicker}>
              {busy ? "Traitement…" : "Remplacer l’image"}
            </button>
            <button type="button" className={proBtnSecondaryClass} disabled={busy} onClick={() => void handleRemove()}>
              Supprimer l’image
            </button>
          </>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
