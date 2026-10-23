"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { logoutPro, proApi } from "@/lib/proApi";
import { translateAction } from "@/components/pro/proDisplay";
import { ProIcon, type ProIconName } from "@/components/pro/ProIcons";
import { ProThemeToggle } from "@/components/pro/ProThemeToggle";

type NavLink = { href: string; label: string; icon: ProIconName; badge?: "newRequests" };
type NavGroup = { label: string; links: NavLink[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Pilotage",
    links: [
      { href: "/pro/dashboard", label: "Tableau de bord", icon: "grid" },
      { href: "/pro/demandes", label: "Demandes", icon: "file", badge: "newRequests" },
      { href: "/pro/devis", label: "Devis", icon: "file" },
      { href: "/pro/reservations", label: "Réservations", icon: "calendar" },
      { href: "/pro/calendrier", label: "Calendrier", icon: "calendar" },
    ],
  },
  {
    label: "Gestion",
    links: [
      { href: "/pro/tarifs", label: "Tarifs", icon: "tag" },
      { href: "/pro/site", label: "Site internet", icon: "globe" },
      { href: "/pro/stripe", label: "Stripe / Paiements", icon: "card" },
      { href: "/pro/transactions", label: "Transactions", icon: "arrows" },
      { href: "/pro/parametres", label: "Paramètres", icon: "settings" },
    ],
  },
];

const NAV_LINKS = NAV_GROUPS.flatMap((group) => group.links);

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

const FOOTER_ITEM =
  "flex min-h-[42px] w-full items-center gap-[11px] rounded-md px-3 text-left text-xs text-[#e1e8f6] transition hover:bg-white/[0.09] hover:text-white";

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [newRequests, setNewRequests] = useState(0);

  useEffect(() => {
    proApi("/dashboard/session")
      .then((json) => setSession((json.data as SessionInfo) ?? null))
      .catch(() => setSession(null));
  }, []);

  // Compteur « nouvelles demandes » : rafraîchi à chaque changement de page.
  useEffect(() => {
    let mounted = true;
    proApi("/dashboard/summary")
      .then((json) => {
        const count = Number((json.data as { newCount?: number } | undefined)?.newCount);
        if (mounted) setNewRequests(Number.isFinite(count) && count > 0 ? count : 0);
      })
      .catch(() => {
        if (mounted) setNewRequests(0);
      });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  return (
    <div className="flex h-full flex-col bg-[var(--pro-sidebar)] text-[#e8eefb]">
      <div className="border-b border-white/10 px-[19px] pb-[22px] pt-[27px]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#b3c9ef]">Espace professionnel</p>
        <p className="mt-[13px] truncate text-base font-bold tracking-[-0.02em] text-white">
          {session?.tenantName ?? "Tableau de bord VTC"}
        </p>
        <p className="mt-[5px] truncate text-xs text-[#c2cee4]">{session?.operatorEmail ?? "Pilotage des demandes & courses"}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-[22px] pt-[15px]" aria-label="Navigation pro">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 pt-[17px] text-[11px] font-bold uppercase tracking-[0.12em] text-[#a5b5d1]">{group.label}</p>
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[46px] items-center gap-3 rounded-[7px] px-3 text-[13px] transition ${
                    active
                      ? "bg-[#2860e8] font-bold text-white shadow-[0_4px_14px_rgb(23_77_222/20%)]"
                      : "font-medium text-[#e1e8f6] hover:bg-white/[0.09] hover:text-white"
                  }`}
                >
                  <ProIcon name={link.icon} className="h-[17px] w-[17px]" />
                  <span className="truncate">{link.label}</span>
                  {link.badge === "newRequests" && newRequests > 0 ? (
                    <span className="ml-auto rounded-full bg-white/[0.21] px-[7px] py-0.5 text-[11px] tabular-nums">{newRequests}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/[0.11] px-2.5 py-[15px]">
        <ProThemeToggle variant="sidebar" />
        <Link href="/" target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={FOOTER_ITEM}>
          <ProIcon name="globe" className="h-4 w-4" />
          Voir le site
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logoutPro();
            router.replace("/pro/login");
            onNavigate?.();
          }}
          className={FOOTER_ITEM}
        >
          <ProIcon name="exit" className="h-4 w-4" />
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
  const [today, setToday] = useState("");

  // Date calculée côté client uniquement (évite un décalage d'hydratation).
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date()));
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

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
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:block lg:w-[252px]">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Mobile sidebar (drawer) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgb(7_15_30/55%)]"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            tabIndex={-1}
          />
          <div className="absolute inset-y-0 left-0 w-[260px] max-w-[calc(100vw-48px)] shadow-2xl">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[59px] items-center justify-between gap-4 border-b border-[var(--pro-border)] bg-[var(--pro-panel)] px-[18px] sm:h-[61px] lg:px-[clamp(20px,3vw,48px)]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text)] hover:bg-[var(--pro-panel-muted)] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
            >
              <ProIcon name="menu" />
            </button>
            <p className="flex min-w-0 items-center gap-2.5 text-[13px] text-[var(--pro-text-muted)]">
              <strong className="font-bold text-[var(--pro-text)]">Espace pro</strong>
              <span aria-hidden="true" className="text-[#a8b7ca]">
                /
              </span>
              <span className="truncate">{title}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {today ? <time className="hidden whitespace-nowrap text-[13px] text-[var(--pro-text-muted)] sm:block">{today}</time> : null}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden whitespace-nowrap rounded-[7px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--pro-text)] transition hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-muted)] min-[520px]:inline-flex"
            >
              Voir le site ↗
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1630px] px-[18px] pb-10 pt-[26px] sm:pb-[55px] sm:pt-8 lg:px-[clamp(20px,3vw,48px)]">
          <div className="space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
