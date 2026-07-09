import type { ReactNode } from "react";
import { ProLayoutClient } from "@/components/pro/ProLayoutClient";

export default function ProLayout({ children }: { children: ReactNode }) {
  return <ProLayoutClient>{children}</ProLayoutClient>;
}
