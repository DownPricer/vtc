import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { IntroScreen } from "@/components/layout/IntroScreen";
import { getBrandCssVariables } from "@/lib/branding/cssVariables";
import { getPublicTenantSettings } from "@/lib/publicTenantSettingsClient";
import { buildSiteConfigFromTenant } from "@/config/siteConfigFromTenant";
import { buildBusinessConfigFromTenant } from "@/config/businessConfigFromTenant";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const tenantSettings = await getPublicTenantSettings();
  const runtimeSite = buildSiteConfigFromTenant(tenantSettings);
  const runtimeBusiness = buildBusinessConfigFromTenant(tenantSettings);

  return (
    <div style={getBrandCssVariables(runtimeSite.branding.colors)} className="bg-dark text-white min-h-screen flex flex-col">
      {runtimeSite.features.introScreen ? <IntroScreen runtimeSite={runtimeSite} /> : null}
      <Header runtimeSite={runtimeSite} />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer runtimeSite={runtimeSite} runtimeBusiness={runtimeBusiness} />
      <FloatingButtons runtimeSite={runtimeSite} />
      <MobileCtaBar runtimeSite={runtimeSite} tenantSettings={tenantSettings} />
    </div>
  );
}

