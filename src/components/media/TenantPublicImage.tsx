import Image from "next/image";
import { isTenantDashboardUploadPath } from "@/lib/tenantVehiclesNormalize";

export type TenantPublicImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Si true, l’image remplit le parent `relative` (comme Next `fill`). */
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

/**
 * Images sous `/uploads/settings/...` : balise native (évite erreurs `/_next/image`).
 * Autres chemins : `next/image`.
 */
export function TenantPublicImage({ src, alt, className = "", fill, sizes, priority }: TenantPublicImageProps) {
  const s = src?.trim();
  if (!s) return null;

  if (isTenantDashboardUploadPath(s)) {
    if (fill) {
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- médias dashboard hors optimiseur Next */}
          <img
            src={s}
            alt={alt}
            className={`absolute inset-0 h-full w-full object-cover ${className}`.trim()}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </>
      );
    }
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- médias dashboard hors optimiseur Next */}
        <img src={s} alt={alt} className={className} loading={priority ? "eager" : "lazy"} decoding="async" />
      </>
    );
  }

  if (fill) {
    return <Image src={s} alt={alt} fill className={className} sizes={sizes ?? "100vw"} priority={priority} />;
  }

  return (
    <Image src={s} alt={alt} width={960} height={540} className={className} sizes={sizes} priority={priority} />
  );
}
