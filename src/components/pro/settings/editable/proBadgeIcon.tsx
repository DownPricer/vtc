"use client";

import type { ReactNode } from "react";
import type { IconKey } from "@/config/tenant-settings.types";

const stroke = { strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function SvgBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {children}
    </svg>
  );
}

/** Icône ligne pour la prévisualisation des badges / sélecteur (cohérent avec la vitrine). */
export function ProBadgeIcon({ iconKey, className = "h-5 w-5" }: { iconKey: IconKey; className?: string }) {
  switch (iconKey) {
    case "id_card":
      return (
        <SvgBox className={className}>
          <rect x="4" y="5" width="16" height="14" rx="2" {...stroke} />
          <path d="M8 9h4M8 13h8M8 17h5" {...stroke} />
        </SvgBox>
      );
    case "car":
      return (
        <SvgBox className={className}>
          <path d="M5 17h14v-3l-2-5H7L5 14v3zM7 17l-1 2M17 17l1 2M9 14h6" {...stroke} />
          <circle cx="7.5" cy="17" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="16.5" cy="17" r="1.2" fill="currentColor" stroke="none" />
        </SvgBox>
      );
    case "credit_card":
      return (
        <SvgBox className={className}>
          <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <path d="M3 10h18M7 15h2" {...stroke} />
        </SvgBox>
      );
    case "globe":
      return (
        <SvgBox className={className}>
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M3 12h18M12 3a14 14 0 000 18M12 3a14 14 0 010 18" {...stroke} />
        </SvgBox>
      );
    case "clock":
      return (
        <SvgBox className={className}>
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M12 7v6l3 2" {...stroke} />
        </SvgBox>
      );
    case "luggage_check":
      return (
        <SvgBox className={className}>
          <path d="M9 6V5a2 2 0 012-2h2a2 2 0 012 2v1M8 8h8v12a2 2 0 01-2 2H10a2 2 0 01-2-2V8z" {...stroke} />
          <path d="M10 13l2 2 4-4" {...stroke} />
        </SvgBox>
      );
    case "shield_check":
      return (
        <SvgBox className={className}>
          <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" {...stroke} />
          <path d="M9 12l2 2 4-4" {...stroke} />
        </SvgBox>
      );
    case "home":
      return (
        <SvgBox className={className}>
          <path d="M4 10l8-6 8 6v10a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1V10z" {...stroke} />
        </SvgBox>
      );
    case "check":
      return (
        <SvgBox className={className}>
          <path d="M5 13l4 4L19 7" {...stroke} />
        </SvgBox>
      );
    case "user_badge":
      return (
        <SvgBox className={className}>
          <circle cx="9" cy="8" r="3" {...stroke} />
          <path d="M5 20v-1a4 4 0 014-4h1M16 11l2 2 4-4M18 13l-4 4" {...stroke} />
        </SvgBox>
      );
    case "users":
      return (
        <SvgBox className={className}>
          <circle cx="9" cy="8" r="3" {...stroke} />
          <path d="M4 20v-1a5 5 0 015-5h1a5 5 0 015 5v1M17 10h3M19 8v4" {...stroke} />
        </SvgBox>
      );
    case "building":
      return (
        <SvgBox className={className}>
          <path d="M4 21V8l6-3 6 3v13M9 21V14h6v7" {...stroke} />
          <path d="M9 10h2M13 10h2M9 17h2M13 17h2" {...stroke} />
        </SvgBox>
      );
    case "refresh":
      return (
        <SvgBox className={className}>
          <path d="M4 5v5h5M20 19v-5h-5M5 19a8 8 0 008 3 8 8 0 003-11M19 5a8 8 0 00-8-3 8 8 0 00-3 11" {...stroke} />
        </SvgBox>
      );
    case "calendar":
      return (
        <SvgBox className={className}>
          <rect x="4" y="5" width="16" height="16" rx="2" {...stroke} />
          <path d="M8 3v4M16 3v4M4 11h16" {...stroke} />
        </SvgBox>
      );
    case "plane":
      return (
        <SvgBox className={className}>
          <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" {...stroke} />
        </SvgBox>
      );
    case "sparkle":
      return (
        <SvgBox className={className}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" {...stroke} />
        </SvgBox>
      );
    case "bank":
      return (
        <SvgBox className={className}>
          <path d="M4 10h16M6 10v10M10 10v10M14 10v10M18 10v10M2 20h20" {...stroke} />
          <path d="M12 4l10 4H2l10-4z" {...stroke} />
        </SvgBox>
      );
    case "cash":
      return (
        <SvgBox className={className}>
          <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <circle cx="12" cy="12" r="3" {...stroke} />
          <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" {...stroke} />
        </SvgBox>
      );
    case "document":
      return (
        <SvgBox className={className}>
          <path d="M9 3h6l4 4v14a2 2 0 01-2 2H9M9 3v6h6M9 13h6M9 17h4" {...stroke} />
        </SvgBox>
      );
    case "ban":
      return (
        <SvgBox className={className}>
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M5 5l14 14" {...stroke} />
        </SvgBox>
      );
    default:
      return (
        <SvgBox className={className}>
          <circle cx="12" cy="12" r="9" {...stroke} />
        </SvgBox>
      );
  }
}
