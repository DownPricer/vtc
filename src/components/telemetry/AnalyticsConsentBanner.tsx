"use client";

import { useEffect, useState } from "react";
import { setAnalyticsConsent, trackEvent } from "@/lib/telemetryClient";

const DISMISSED_KEY = "vtc_consent_banner_dismissed";

export function AnalyticsConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(DISMISSED_KEY) === "1";
      const hasChoice = window.localStorage.getItem("vtc_consent_analytics") != null;
      if (!dismissed && !hasChoice) setVisible(true);
    } catch {
      // ignore
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-dark/95 backdrop-blur-md shadow-2xl p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-300 leading-relaxed">
          <strong className="text-white">Cookies analytics</strong> : nous utilisons des mesures d’audience{" "}
          <span className="text-gray-400">(sans publicité)</span> pour améliorer le service. Vous pouvez refuser.
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-200 text-sm font-semibold hover:bg-white/10 transition-colors"
            onClick={() => {
              setAnalyticsConsent(false);
              window.localStorage.setItem(DISMISSED_KEY, "1");
              setVisible(false);
            }}
          >
            Refuser
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
            onClick={() => {
              setAnalyticsConsent(true);
              window.localStorage.setItem(DISMISSED_KEY, "1");
              setVisible(false);
              // déclenche un page_view immédiat après consentement
              trackEvent({ type: "page_view", throttleMs: 1000 });
            }}
          >
            Accepter
          </button>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-gray-500">
        En continuant, vous acceptez nos{" "}
        <a className="text-primary hover:underline" href="/mentions-legales#cookies">
          informations cookies
        </a>.
      </div>
    </div>
  );
}

