import type { ReactNode } from "react";
import { ProAppShell } from "@/components/pro/ProAppShell";

export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pro-theme-light">
      <ProAppShell>{children}</ProAppShell>
    </div>
  );
}
