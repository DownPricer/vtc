import type { ReactNode } from "react";
import { ProThemeProvider } from "@/components/pro/ProTheme";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <ProThemeProvider>
      <div className="min-h-screen bg-[linear-gradient(180deg,var(--pro-bg)_0%,color-mix(in_srgb,var(--pro-bg)_94%,black_6%)_100%)] text-[var(--pro-text)] transition-colors">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-28 top-0 h-72 w-72 rounded-full bg-[var(--pro-accent-soft)] blur-3xl" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--pro-accent)_22%,transparent)] opacity-20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        </div>
        <div className="relative mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-5 md:px-8 md:py-6 xl:px-10" role="main">
          {children}
        </div>
      </div>
    </ProThemeProvider>
  );
}
