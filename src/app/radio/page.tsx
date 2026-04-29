"use client";

import { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";

export default function RadioRedirectPage() {
  useEffect(() => {
    if (!siteConfig.features.radioPage) return;
    const target = siteConfig.features.radioHomeSection ? "/#radio" : "/";
    window.location.replace(target);
  }, []);

  if (!siteConfig.features.radioPage) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-gray-400 text-sm px-6 text-center">
        <p>La page radio dédiée est désactivée dans la configuration du site.</p>
        <Link href="/" className="text-primary hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
      Redirection vers la radio…
    </div>
  );
}
