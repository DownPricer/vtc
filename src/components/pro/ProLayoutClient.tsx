"use client";

import type { ReactNode } from "react";
import { ProAppShell } from "@/components/pro/ProAppShell";
import { ProThemeProvider } from "@/components/pro/ProTheme";

export function ProLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ProThemeProvider>
      <ProAppShell>{children}</ProAppShell>
    </ProThemeProvider>
  );
}
