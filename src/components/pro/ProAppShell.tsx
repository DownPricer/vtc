"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { logoutPro, proApi } from "@/lib/proApi";
import { translateAction } from "@/components/pro/proDisplay";
import { ProThemeToggle } from "@/components/pro/ProThemeToggle";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/pro/dashboard", label: "Tableau de bord" },
  { href: "/pro/demandes", label: "Demandes" },
  { href: "/pro/devis", label: "Devis" },
  { href: "/pro/reservations", label: "Réservations" },
  { href: "/pro/calendrier", label: "Calendrier" },
  { href: "/pro/tarifs", label: "Tarifs" },
  { href: "/pro/site", label: "Site internet" },
  { href: "/pro/stripe", label: "Stripe / Paiements" },
  { href: "/pro/transactions", label: "Transactions" },
  { href: "/pro/parametres", label: "Paramètres" },
];

type SessionInfo = {
  operatorEmail?: string;
  tenantName?: string;
};

function isActive(pathname: string, href: string) {
  const base = href.split("?")[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

function pageTitle(pathname: string) {
  const match = NAV_LINKS.find((l) => isActive(pathname, l.href));
  return match?.label ?? "Espace pro";
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    proApi("/dashboard/session")
      .then((json) => setSession((json.data as SessionInfo) ?? null))
      .catch(() => setSession(null));
  }, []);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Espace professionnel
        </p>
        <p className="mt-2 truncate text-base font-semibold text-white">
          {session?.tenantName ?? "Tableau de bord VTC"}
        </p>
        <p className="mt-1 truncate text-xs text-slate-400">
          {session?.operatorEmail ?? "Pilotage des demandes & courses"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Navigation pro">
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/10 space-y-2">
        <ProThemeToggle variant="sidebar" />
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Voir le site
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logoutPro();
            router.replace("/pro/login");
            onNavigate?.();
          }}
          className="w-full flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          {translateAction("logout")}
        </button>
      </div>
    </div>
  );
}

export function ProAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/pro";
  const title = useMemo(() => pageTitle(pathname), [pathname]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pages qui ne doivent PAS afficher le chrome pro (sidebar/topbar)
  if (pathname === "/pro/login" || pathname.includes("/devis/print")) {
    return (
      <div className="min-h-screen w-full bg-[var(--pro-bg)] text-[var(--pro-text)]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--pro-bg)] text-[var(--pro-text)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-[280px] lg:block">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Mobile sidebar (drawer) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-[var(--pro-border)] bg-[var(--pro-panel)]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text)] hover:bg-[var(--pro-panel-muted)]"
                onClick={() => setMobileOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{title}</p>
                <p className="text-xs text-[var(--pro-text-muted)] truncate">Espace pro — gestion et pilotage</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ProThemeToggle variant="topbar" />
              <Link
                href="/"
                className="hidden sm:inline-flex items-center justify-center rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3 py-2 text-sm font-semibold text-[var(--pro-text)] hover:bg-[var(--pro-panel-muted)]"
              >
                Voir le site
              </Link>
              <Link
                href="/pro/parametres"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--pro-accent)] px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                Paramètres
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-6 lg:py-6">
          <div className="space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

