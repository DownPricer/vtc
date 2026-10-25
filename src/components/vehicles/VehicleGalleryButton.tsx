"use client";

import { useState, type ReactNode } from "react";
import { VehicleLightbox, type LightboxPhoto } from "./VehicleLightbox";

type Props = {
  title: string;
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
 */
export function VehicleGalleryButton({ title, photos, startIndex = 0, className = "", children }: Props) {
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
        className={`block w-full cursor-zoom-in text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      >
        {children}
      </button>
      {open ? (
        <VehicleLightbox
          title={title}
          photos={usable}
          startIndex={Math.min(startIndex, usable.length - 1)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
