import type { ReactNode } from "react";

/** Jeu d'icônes de l'espace pro (trait 1.8, 24x24) — repris de la maquette du dashboard. */
const ICON_PATHS = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  file: (
    <>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M13 2v7h7M8 13h8M8 17h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </>
  ),
  tag: (
    <>
      <path d="M20 13 13 20a2 2 0 0 1-3 0l-8-8V3h9l9 8a2 2 0 0 1 0 2Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  arrows: <path d="M4 7h15m0 0-4-4m4 4-4 4M20 17H5m0 0 4-4m-4 4 4 4" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1 1.7-2 2-1.7-1-.1-.1a8 8 0 0 1-1.7.7L14.5 21h-5l-.5-2.6a8 8 0 0 1-1.7-.7l-.1.1-1.7 1-2-2 1-1.7.1-.1a8 8 0 0 1-.7-1.7L1.3 12l2.6-.5a8 8 0 0 1 .7-1.7l-.1-.1-1-1.7 2-2 1.7 1 .1.1A8 8 0 0 1 9 6.4L9.5 4h5l.5 2.4a8 8 0 0 1 1.7.7l.1-.1 1.7-1 2 2-1 1.7-.1.1a8 8 0 0 1 .7 1.7l2.6.5-2.6.5a8 8 0 0 1-.7 1.7Z" />
    </>
  ),
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  exit: <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6m0 4h.01" />
    </>
  ),
  chart: <path d="M5 20v-8m7 8V4m7 16v-5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type ProIconName = keyof typeof ICON_PATHS;

export function ProIcon({ name, className = "h-[19px] w-[19px]" }: { name: ProIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
