import type { ReactNode } from "react";
import { ProThemeProvider } from "@/components/pro/ProTheme";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <ProThemeProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--pro-bg-strong),_transparent_30%),linear-gradient(180deg,_var(--pro-bg)_0%,_color-mix(in_srgb,var(--pro-bg)_88%,black_12%)_100%)] text-[var(--pro-text)] transition-colors">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</div>
      </div>
    </ProThemeProvider>
  );
}
