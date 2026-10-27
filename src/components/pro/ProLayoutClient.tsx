"use client";

import type { ReactNode } from "react";
import { ProAppShell } from "@/components/pro/ProAppShell";
import { ProPwaProvider } from "@/components/pro/ProPwa";
import { ProThemeProvider } from "@/components/pro/ProTheme";

export function ProLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ProThemeProvider>
      <ProPwaProvider>
        <ProAppShell>{children}</ProAppShell>
      </ProPwaProvider>
    </ProThemeProvider>
  );
}
