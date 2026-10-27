import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProLayoutClient } from "@/components/pro/ProLayoutClient";
import { getProPwaBranding, PRO_ICON_URL, PRO_MANIFEST_URL } from "@/lib/pro/pwaBranding";

/** Le manifeste PWA n'est relié qu'ici : le site public (layout racine) reste inchangé. */
export async function generateMetadata(): Promise<Metadata> {
  const b = await getProPwaBranding();
  const icon = (size: number) => `${PRO_ICON_URL}?size=${size}&purpose=any&v=${b.version}`;
  return {
    manifest: PRO_MANIFEST_URL,
    icons: {
      icon: [{ url: icon(192), sizes: "192x192", type: "image/png" }],
      apple: [{ url: icon(180), sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: { capable: true, title: b.shortName, statusBarStyle: "default" },
    other: { "mobile-web-app-capable": "yes" },
  };
}

export default function ProLayout({ children }: { children: ReactNode }) {
  return <ProLayoutClient>{children}</ProLayoutClient>;
}
