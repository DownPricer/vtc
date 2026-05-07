"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutPro, proApi } from "@/lib/proApi";
import { useProTheme } from "./ProTheme";
import { translateAction } from "./proDisplay";

const mainLinks = [
  { href: "/pro/dashboard", label: "Tableau de bord" },
  { href: "/pro/demandes", label: "Demandes" },
  { href: "/pro/devis", label: "Devis" },
  { href: "/pro/calendrier", label: "Calendrier" },
  { href: "/pro/transactions", label: "Transactions" },
];

const iconGear = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

type SessionInfo = {
  operatorEmail: string;
  tenantName: string;
};

export function ProNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useProTheme();
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    proApi("/dashboard/session")
      .then((json) => {
        const data = json.data as SessionInfo | undefined;
        if (data?.operatorEmail || data?.tenantName) setSession(data ?? null);
      })
      .catch(() => setSession(null));
  }, []);

  return (
    <div className="mb-6 overflow-hidden rounded-[28px] border border-[var(--pro-border)] bg-[var(--pro-panel)] shadow-[var(--pro-shadow)]">
      <div className="flex flex-col gap-4 border-b border-[var(--pro-border)] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
        <div className="flex min-w-0 items-start justify-between gap-3 md:block">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pro-accent)]">Espace professionnel</p>
            <p className="truncate text-xl font-semibold text-[var(--pro-text)]">{session?.tenantName ?? "Espace VTC"}</p>
            <p className="truncate text-sm text-[var(--pro-text-muted)]">{session?.operatorEmail ?? ""}</p>
          </div>
          <Link
            href="/pro/parametres"
            title="Paramètres"
            aria-label="Paramètres du site et du compte"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] text-[var(--pro-text-soft)] transition hover:border-[var(--pro-accent)] hover:bg-[var(--pro-accent-soft)] hover:text-[var(--pro-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)] md:hidden"
          >
            {iconGear}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-medium text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)]"
          >
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
          <button
            type="button"
            onClick={async () => {
              await logoutPro();
              router.replace("/pro/login");
            }}
            className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-medium text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)]"
          >
            {translateAction("logout")}
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-2 px-5 pb-5 pt-4 md:px-7">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          {mainLinks.map((link) => {
            const active =
              link.href === "/pro/demandes"
                ? pathname.startsWith("/pro/demandes") && !pathname.startsWith("/pro/devis")
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "border border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
                    : "border border-transparent text-[var(--pro-text-muted)] hover:border-[var(--pro-border)] hover:bg-[var(--pro-panel-muted)] hover:text-[var(--pro-text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/pro/parametres"
          title="Paramètres"
          aria-label="Paramètres du site et du compte"
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] text-[var(--pro-text-soft)] transition hover:border-[var(--pro-accent)] hover:bg-[var(--pro-accent-soft)] hover:text-[var(--pro-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)] md:flex"
        >
          {iconGear}
        </Link>
      </nav>
    </div>
  );
}
