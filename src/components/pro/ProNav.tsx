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
  { href: "/pro/reservations", label: "Réservations" },
  { href: "/pro/calendrier", label: "Calendrier" },
  { href: "/pro/tarifs", label: "Tarifs" },
  { href: "/pro/site", label: "Site internet" },
  { href: "/pro/paiements", label: "Paiements" },
  { href: "/pro/transactions", label: "Transactions" },
  { href: "/pro/parametres", label: "Paramètres / Profil" },
];

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
    <aside className="lg:sticky lg:top-5 lg:row-span-[999]">
      <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] shadow-[var(--pro-shadow)]">
        <div className="border-b border-[var(--pro-border)] px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pro-accent)]">Espace pro VTC</p>
          <h2 className="mt-2 truncate text-lg font-semibold tracking-tight text-[var(--pro-text)]">
            {session?.tenantName ?? "Pilotage métier"}
          </h2>
          <p className="mt-1 truncate text-xs text-[var(--pro-text-muted)]">
            {session?.operatorEmail ?? "Demandes, devis et réservations"}
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:block lg:space-y-1 lg:overflow-visible" aria-label="Navigation professionnelle">
          {mainLinks.map((link) => {
            const baseHref = link.href.split("?")[0];
            const active = pathname === baseHref || pathname.startsWith(`${baseHref}/`);
            return (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`flex shrink-0 items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${
                  active
                    ? "bg-[var(--pro-accent)] text-white"
                    : "text-[var(--pro-text-soft)] hover:bg-[var(--pro-panel-muted)] hover:text-[var(--pro-text)]"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="grid gap-2 border-t border-[var(--pro-border)] px-3 py-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-2.5 text-sm font-medium text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-panel-strong)]"
          >
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
          <button
            type="button"
            onClick={async () => {
              await logoutPro();
              router.replace("/pro/login");
            }}
            className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
          >
            {translateAction("logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
