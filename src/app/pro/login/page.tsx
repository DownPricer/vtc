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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = new URL(window.location.href).searchParams.get("next");
    if (current) setNextPath(current);
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-8 shadow-[var(--pro-shadow)]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--pro-accent)]">Espace VTC</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--pro-text)]">Connexion pro</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--pro-text-muted)]">
              Gérez vos demandes, devis, réservations et paiements.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-2 text-xs font-medium text-[var(--pro-text-soft)]"
          >
            {theme === "dark" ? "Clair" : "Sombre"}
          </button>
        </div>
            <form
              className="space-y-5"
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
                  className="w-full rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
                  placeholder="vous@exemple.fr"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pro-password" className="block text-sm font-medium text-[var(--pro-text-soft)]">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="pro-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 pr-12 text-sm text-[var(--pro-text)] placeholder:text-[var(--pro-text-muted)] focus:border-[var(--pro-accent)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
                    placeholder="Votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--pro-text-muted)] transition hover:bg-[var(--pro-panel)] hover:text-[var(--pro-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 3.029a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--pro-accent)] py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] py-3 text-sm font-semibold text-[var(--pro-text-soft)] transition hover:bg-[var(--pro-panel-strong)]"
              >
                Retour au site
              </button>
            </form>
      </div>
    </div>
  );
}
