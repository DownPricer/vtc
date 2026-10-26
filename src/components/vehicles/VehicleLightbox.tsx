"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type LightboxPhoto = { src: string; alt?: string; caption?: string };

type Props = {
  title: string;
  subtitle?: string;
  photos: LightboxPhoto[];
  startIndex?: number;
  onClose: () => void;
};

const SWIPE_THRESHOLD_PX = 48;

/** Galerie plein écran : flèches, clavier (←/→/Échap), balayage tactile, miniatures, focus piégé, défilement de page verrouillé. */
export function VehicleLightbox({ title, subtitle, photos, startIndex = 0, onClose }: Props) {
  const count = photos.length;
  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)));
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  useEffect(() => setMounted(true), []);

  // Verrouille le scroll de la page et rend le focus à l'élément d'origine à la fermeture.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        // Focus piégé dans la boîte de dialogue.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!mounted || count === 0) return null;

  const current = photos[index];
  const neighbours = [photos[(index + 1) % count], photos[(index - 1 + count) % count]];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos — ${title}`}
      className="fixed inset-0 z-[1000] flex flex-col bg-black/[0.97] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-white sm:text-lg">{title}</p>
          {subtitle ? <p className="truncate text-xs text-gray-300 sm:text-sm">{subtitle}</p> : null}
          <p className="text-xs text-gray-500" aria-live="polite">
            Photo {index + 1} / {count}
            {current.caption?.trim() ? ` · ${current.caption.trim()}` : ""}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer la galerie"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
        style={{ touchAction: "pan-y" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
        }}
      >
        {count > 1 ? (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Photo précédente"
            className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4 sm:flex"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}

        {failed[index] ? (
          <div className="flex h-64 w-full max-w-xl items-center justify-center rounded-xl border border-white/10 text-sm text-gray-400">
            Photo indisponible
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- galerie : ratio d'origine conservé (object-contain), pas d'optimiseur
          <img
            key={current.src}
            src={current.src}
            alt={current.alt || `${title} — photo ${index + 1}`}
            className="h-full w-full select-none object-contain"
            draggable={false}
            onError={() => setFailed((f) => ({ ...f, [index]: true }))}
          />
        )}

        {count > 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Photo suivante"
            className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:flex"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex items-center justify-center gap-3 px-4 pb-4 pt-3 sm:pb-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Photo précédente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white sm:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <ul className="flex max-w-full gap-2 overflow-x-auto" aria-label="Miniatures">
            {photos.map((p, i) => (
              <li key={`${p.src}-${i}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Voir la photo ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`block h-12 w-16 overflow-hidden rounded-md border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-14 sm:w-20 ${
                    i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniature */}
                  <img src={p.src} alt="" className="h-full w-full object-cover" draggable={false} loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Photo suivante"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white sm:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="pb-4" />
      )}

      {/* Préchargement des voisines (invisible). */}
      <div className="hidden" aria-hidden="true">
        {neighbours.map((n, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- préchargement
          <img key={`${n.src}-${i}`} src={n.src} alt="" />
        ))}
      </div>
    </div>,
    document.body
  );
}
