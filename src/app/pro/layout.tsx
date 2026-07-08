import type { ReactNode } from "react";
import { ProThemeProvider } from "@/components/pro/ProTheme";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <ProThemeProvider>
      <div className="min-h-screen bg-[var(--pro-bg)] text-[var(--pro-text)] transition-colors">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5 md:px-8 md:py-6 xl:px-10" role="main">
          {children}
        </div>
      </div>
    </ProThemeProvider>
  );
}
