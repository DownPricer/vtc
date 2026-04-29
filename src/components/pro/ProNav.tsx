"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutPro, proApi } from "@/lib/proApi";
import { useProTheme } from "./ProTheme";
import { translateAction } from "./proDisplay";

const links = [
  { href: "/pro/dashboard", label: "Tableau de bord" },
  { href: "/pro/demandes", label: "Demandes" },
  { href: "/pro/calendrier", label: "Calendrier" },
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
    <div className="mb-6 overflow-hidden rounded-[28px] border border-[var(--pro-border)] bg-[var(--pro-panel)] shadow-[var(--pro-shadow)]">
      <div className="flex flex-col gap-4 border-b border-[var(--pro-border)] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pro-accent)]">Espace professionnel</p>
          <p className="truncate text-xl font-semibold text-[var(--pro-text)]">{session?.tenantName ?? "Espace VTC"}</p>
          <p className="truncate text-sm text-[var(--pro-text-muted)]">{session?.operatorEmail ?? ""}</p>
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
      <nav className="flex flex-wrap gap-2 px-5 pb-5 pt-4 md:px-7">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "border border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
                  : "border border-transparent text-[var(--pro-text-muted)] hover:border-[var(--pro-border)] hover:bg-[var(--pro-panel-muted)] hover:text-[var(--pro-text)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
