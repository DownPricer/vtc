import Image from "next/image";

type ReadonlyImagePreviewProps = {
  src: string;
  alt: string;
  caption?: string;
};

/** Aperçu image (chemins locaux `/…`). */
export function ReadonlyImagePreview({ src, alt, caption }: ReadonlyImagePreviewProps) {
  if (!src?.trim()) {
    return (
      <figure className="overflow-hidden rounded-xl border border-dashed border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-6 text-center">
        <figcaption className="text-xs text-[var(--pro-text-muted)]">{caption ? `${caption} — ` : ""}Aucune image</figcaption>
      </figure>
    );
  }
  return (
    <figure className="overflow-hidden rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]">
      <div className="flex max-h-40 items-center justify-center bg-[color-mix(in_srgb,var(--pro-panel-muted)_88%,var(--pro-border)_12%)] p-3">
        <Image
          key={src.trim()}
          src={src}
          alt={alt}
          width={360}
          height={160}
          className="max-h-36 w-auto object-contain"
          unoptimized
        />
      </div>
      {caption ? <figcaption className="px-3 py-2 text-xs text-[var(--pro-text-muted)]">{caption}</figcaption> : null}
    </figure>
  );
}
