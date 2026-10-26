import { TenantPublicImage } from "@/components/media/TenantPublicImage";
import { VehicleGalleryButton } from "@/components/vehicles/VehicleGalleryButton";
import type { VehicleListItem } from "@/config/tenant-settings.types";

const MAX_THUMBS = 4;

type Props = {
  vehicle: VehicleListItem;
  /** Carte horizontale (photo à gauche, détails à droite) : pour un véhicule unique. */
  wide?: boolean;
};

function CameraIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 7v6M7 10h6m5 0a8 8 0 11-16 0 8 8 0 0116 0z" />
    </svg>
  );
}

/** Carte véhicule commune à l'accueil et à la page Services : nom lisible, caractéristiques, photo principale et vignettes qui ouvrent la galerie. */
export function VehicleCard({ vehicle, wide = false }: Props) {
  const photos = vehicle.gallery.filter((g) => g.src?.trim());
  const main = photos[0];
  const specs = [
    vehicle.category?.trim(),
    `${vehicle.passengerMax} passager${vehicle.passengerMax > 1 ? "s" : ""} max.`,
    vehicle.baggageLabel?.trim(),
  ].filter(Boolean) as string[];
  const features = (vehicle.features ?? []).map((f) => f.trim()).filter(Boolean).slice(0, 5);
  const highlight = vehicle.highlightText?.trim();
  // Le texte d'accroche reprend souvent « N passagers max. · … » déjà affiché dans les pastilles.
  const text = vehicle.description?.trim() || (highlight && !/passager/i.test(highlight) ? highlight : "");
  const lightboxPhotos = photos.map((g) => ({ src: g.src, alt: g.alt, caption: g.tag }));
  const subtitle = specs.join(" · ");
  const thumbs = photos.slice(1, 1 + MAX_THUMBS);
  const hiddenCount = photos.length - 1 - thumbs.length;

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors hover:border-primary/30 ${
        wide ? "grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : "flex flex-col"
      }`}
    >
      <div className="min-w-0">
        <VehicleGalleryButton
          title={vehicle.name}
          subtitle={subtitle}
          photos={lightboxPhotos}
          className={`group relative w-full overflow-hidden bg-black/40 ${wide ? "aspect-[16/10] md:h-full md:min-h-[260px]" : "aspect-[16/10]"}`}
        >
          {main ? (
            <TenantPublicImage
              src={main.src}
              alt={main.alt || vehicle.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes={wide ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 1024px) 50vw, 33vw"}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">Photo à venir</div>
          )}
          {main ? (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <CameraIcon />
              {photos.length > 1 ? `Voir les ${photos.length} photos` : "Agrandir"}
            </span>
          ) : null}
        </VehicleGalleryButton>

        {thumbs.length > 0 ? (
          <ul className="flex gap-1.5 p-1.5" aria-label={`Autres photos — ${vehicle.name}`}>
            {thumbs.map((g, i) => (
              <li key={`${g.src}-${i}`} className="relative min-w-0 flex-1">
                <VehicleGalleryButton
                  title={vehicle.name}
                  subtitle={subtitle}
                  photos={lightboxPhotos}
                  startIndex={i + 1}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black/40"
                >
                  <TenantPublicImage src={g.src} alt={g.alt || vehicle.name} fill className="object-cover" sizes="120px" />
                  {i === thumbs.length - 1 && hiddenCount > 0 ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-bold text-white">+{hiddenCount}</span>
                  ) : null}
                </VehicleGalleryButton>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={`flex flex-col gap-3 p-5 ${wide ? "md:p-7" : ""}`}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Votre véhicule</p>
          <h3 className="mt-1 text-lg font-black leading-tight text-white md:text-xl">{vehicle.name}</h3>
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <li key={s} className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-gray-300">
              {s}
            </li>
          ))}
        </ul>
        {text ? <p className="line-clamp-3 text-sm leading-relaxed text-gray-400">{text}</p> : null}
        {features.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
