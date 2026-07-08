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
  { href: "/pro/calendrier", label: "Calendrier" },
  { href: "/pro/devis", label: "Devis" },
  { href: "/pro/transactions", label: "Transactions" },
  { href: "/pro/parametres", label: "Tarifs & site" },
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
    <div className="sticky top-3 z-30">
      <div className="overflow-hidden rounded-[34px] border border-[var(--pro-border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--pro-panel)_90%,white_10%)_0%,var(--pro-panel)_100%)] shadow-[var(--pro-shadow)] backdrop-blur">
        <div className="border-b border-[var(--pro-border)] px-5 py-5 md:px-7 xl:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--pro-accent)]">Espace pro VTC</p>
              <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
                <h2 className="truncate text-2xl font-semibold tracking-tight text-[var(--pro-text)]">
                  {session?.tenantName ?? "Pilotage de l'activité"}
                </h2>
                <p className="truncate text-sm text-[var(--pro-text-muted)]">
                  {session?.operatorEmail ?? "Gestion des demandes, réservations et suivi client"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-medium text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-panel-strong)]"
              >
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logoutPro();
                  router.replace("/pro/login");
                }}
                className="rounded-2xl border border-[var(--pro-border-strong)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] transition hover:bg-[var(--pro-panel-strong)]"
              >
                {translateAction("logout")}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 md:px-6 xl:px-7">
          <nav className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
            {mainLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border border-[var(--pro-accent)] bg-[var(--pro-accent)] text-white shadow-sm"
                      : "border border-transparent bg-[var(--pro-panel-muted)] text-[var(--pro-text-soft)] hover:border-[var(--pro-border-strong)] hover:bg-[var(--pro-panel-strong)] hover:text-[var(--pro-text)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
