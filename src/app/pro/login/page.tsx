"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProTheme } from "@/components/pro/ProTheme";
import { loginPro } from "@/lib/proApi";

function loginErrorMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("identifiants")) return "Identifiants incorrects.";
  return "Impossible de se connecter pour le moment.";
}

export default function ProLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useProTheme();
  const [nextPath, setNextPath] = useState("/pro/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = new URL(window.location.href).searchParams.get("next");
    if (current) setNextPath(current);
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl overflow-hidden rounded-[36px] border border-[var(--pro-border)] bg-[var(--pro-panel)] shadow-[var(--pro-shadow)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(145deg,var(--pro-accent-soft),transparent_70%)] px-8 py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.2),transparent_42%)]" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--pro-accent)] text-lg font-bold text-white shadow-lg">
                  PRO
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2 text-sm font-medium text-[var(--pro-text-soft)]"
                >
                  {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--pro-accent)]">Espace VTC</p>
              <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight text-[var(--pro-text)]">Espace professionnel</h1>
              <p className="mt-4 max-w-md text-base leading-7 text-[var(--pro-text-muted)]">
                Connectez-vous pour gérer vos demandes, suivre vos réservations et traiter vos devis dans une interface claire.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Demandes</p>
                  <p className="mt-1 text-sm text-[var(--pro-text-muted)]">Contacts, devis et réservations.</p>
                </div>
                <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Suivi</p>
                  <p className="mt-1 text-sm text-[var(--pro-text-muted)]">Statuts clairs et actions rapides.</p>
                </div>
                <div className="rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--pro-text)]">Calendrier</p>
                  <p className="mt-1 text-sm text-[var(--pro-text-muted)]">Vue rapide des courses à venir.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-10 lg:px-10 lg:py-12">
            <h2 className="text-2xl font-semibold text-[var(--pro-text)]">Connexion</h2>
            <p className="mt-2 text-sm text-[var(--pro-text-muted)]">Connectez-vous pour gérer vos demandes.</p>
            <form
              className="mt-8 space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError("");
                try {
                  await loginPro(email, password);
                  router.replace(nextPath);
                } catch (err) {
                  setError(loginErrorMessage((err as Error).message));
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-2">
                <label htmlFor="pro-email" className="block text-sm font-medium text-[var(--pro-text-soft)]">
                  Adresse e-mail
                </label>
                <input
                  id="pro-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
                  placeholder="vous@exemple.fr"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pro-password" className="block text-sm font-medium text-[var(--pro-text-soft)]">
                  Mot de passe
                </label>
                <input
                  id="pro-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
                  placeholder="Votre mot de passe"
                  required
                />
              </div>
              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[var(--pro-accent)] py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
