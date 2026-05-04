"use client";

import Image from "next/image";
import { useState } from "react";
import { isTenantDashboardUploadPath } from "@/lib/tenantVehiclesNormalize";

type ReadonlyImagePreviewProps = {
  src: string;
  alt: string;
  caption?: string;
};

/** Aperçu image : uploads dashboard en `<img>` natif (évite /_next/image), autres chemins en Next Image. */
export function ReadonlyImagePreview({ src, alt, caption }: ReadonlyImagePreviewProps) {
  const [broken, setBroken] = useState(false);

  if (!src?.trim()) {
    return (
      <figure className="overflow-hidden rounded-xl border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-6 text-center">
        <figcaption className="text-xs text-[var(--pro-text-muted)]">{caption ? `${caption} — ` : ""}Aucune image</figcaption>
      </figure>
    );
  }

  if (broken) {
    return (
      <figure className="overflow-hidden rounded-xl border border-dashed border-amber-400/40 bg-amber-500/10 px-3 py-6 text-center">
        <figcaption className="text-xs font-medium text-[var(--pro-text)]">
          {caption ? `${caption} — ` : ""}Image introuvable ou inaccessible.
        </figcaption>
      </figure>
    );
  }

  const wrapClass =
    "flex max-h-40 items-center justify-center bg-[color-mix(in_srgb,var(--pro-panel-muted)_88%,var(--pro-border)_12%)] p-3";

  if (isTenantDashboardUploadPath(src)) {
    return (
      <figure className="overflow-hidden rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]">
        <div className={wrapClass}>
          {/* eslint-disable-next-line @next/next/no-img-element -- uploads dashboard hors optimiseur */}
          <img
            src={src.trim()}
            alt={alt}
            className="max-h-36 w-auto max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        </div>
        {caption ? <figcaption className="px-3 py-2 text-xs text-[var(--pro-text-muted)]">{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]">
      <div className={wrapClass}>
        <Image
          key={src.trim()}
          src={src}
          alt={alt}
          width={360}
          height={160}
          className="max-h-36 w-auto object-contain"
          unoptimized
          onError={() => setBroken(true)}
        />
      </div>
      {caption ? <figcaption className="px-3 py-2 text-xs text-[var(--pro-text-muted)]">{caption}</figcaption> : null}
    </figure>
  );
}
