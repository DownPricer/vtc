import Image from "next/image";

type ReadonlyImagePreviewProps = {
  src: string;
  alt: string;
  caption?: string;
};

/** Aperçu image (chemins locaux `/…`). */
export function ReadonlyImagePreview({ src, alt, caption }: ReadonlyImagePreviewProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-[var(--pro-border)] bg-black/15">
      <div className="flex max-h-40 items-center justify-center bg-[var(--pro-panel-muted)] p-3">
        <Image src={src} alt={alt} width={360} height={160} className="max-h-36 w-auto object-contain" unoptimized />
      </div>
      {caption ? <figcaption className="px-3 py-2 text-xs text-[var(--pro-text-muted)]">{caption}</figcaption> : null}
    </figure>
  );
}
