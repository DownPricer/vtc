import type { ReactNode } from "react";
import { ProThemeProvider } from "@/components/pro/ProTheme";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <ProThemeProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--pro-bg-strong),_transparent_30%),linear-gradient(180deg,_var(--pro-bg)_0%,_color-mix(in_srgb,var(--pro-bg)_88%,black_12%)_100%)] text-[var(--pro-text)] transition-colors">
        <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-5 md:px-8 md:py-8 xl:px-10 2xl:px-12" role="main">
          {children}
        </div>
      </div>
    </ProThemeProvider>
  );
}
