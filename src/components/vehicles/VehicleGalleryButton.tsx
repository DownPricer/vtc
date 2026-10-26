"use client";

import { useState, type ReactNode } from "react";
import { VehicleLightbox, type LightboxPhoto } from "./VehicleLightbox";

type Props = {
  title: string;
  /** Ligne de caractéristiques affichée sous le nom dans la galerie. */
  subtitle?: string;
  photos: LightboxPhoto[];
  /** Photo affichée à l'ouverture (index dans `photos`). */
  startIndex?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Zone cliquable (photo / carte) qui ouvre la galerie plein écran.
 * Ne doit entourer QUE le visuel : les liens et boutons voisins (Réserver, etc.) restent en dehors, donc sans effet sur la galerie.
 * Sans photo exploitable, rien n'est cliquable.
 * La largeur est laissée à l'appelant (`w-full`, `w-24`…) : aucune largeur imposée ici, sinon une vignette à largeur fixe s'étire sur toute la ligne.
 */
export function VehicleGalleryButton({ title, subtitle, photos, startIndex = 0, className = "", children }: Props) {
  const [open, setOpen] = useState(false);
  const usable = photos.filter((p) => p.src?.trim());
  if (usable.length === 0) return <div className={className}>{children}</div>;

  const label = usable.length === 1 ? `Agrandir la photo — ${title}` : `Voir les ${usable.length} photos — ${title}`;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        aria-haspopup="dialog"
        className={`block cursor-zoom-in text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      >
        {children}
      </button>
      {open ? (
        <VehicleLightbox
          title={title}
          subtitle={subtitle}
          photos={usable}
          startIndex={Math.min(startIndex, usable.length - 1)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
