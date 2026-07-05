"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/telemetryClient";
import { AnalyticsConsentBanner } from "./AnalyticsConsentBanner";

export function TelemetryRoot() {
  const pathname = usePathname();

  useEffect(() => {
    // page_view (respect consent via telemetryClient)
    trackEvent({ type: "page_view", path: pathname, throttleMs: 1500 });
  }, [pathname]);

  return <AnalyticsConsentBanner />;
}

