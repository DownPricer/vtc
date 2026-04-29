"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ProTheme = "light" | "dark";

type ProThemeContextValue = {
  theme: ProTheme;
  toggleTheme: () => void;
};

const STORAGE_KEY = "vtc-pro-theme";

const ProThemeContext = createContext<ProThemeContextValue | null>(null);

export function ProThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ProTheme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <ProThemeContext.Provider value={value}>
      <div className={theme === "dark" ? "pro-theme-dark" : "pro-theme-light"}>{children}</div>
    </ProThemeContext.Provider>
  );
}

export function useProTheme() {
  const context = useContext(ProThemeContext);
  if (!context) {
    throw new Error("useProTheme must be used within ProThemeProvider");
  }
  return context;
}
