"use client";

import { useState } from "react";
import { ProIcon } from "@/components/pro/ProIcons";
import { useProPwa } from "@/components/pro/ProPwa";

/** Bouton « Installer l'application » : invite native sur Android/desktop, consignes sur iPhone/iPad. */
export function ProInstallButton({ className }: { className?: string }) {
  const { installMode, promptInstall } = useProPwa();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (installMode === "none") return null;

  return (
    <div>
      <button
        type="button"
        className={className}
        aria-expanded={installMode === "ios" ? showIosHelp : undefined}
        onClick={() => {
          if (installMode === "prompt") void promptInstall();
          else setShowIosHelp((open) => !open);
        }}
      >
        <ProIcon name="download" className="h-4 w-4" />
        Installer l&apos;application
      </button>
      {installMode === "ios" && showIosHelp ? (
        <p className="mx-3 mb-2 mt-1 rounded-md bg-white/[0.07] px-3 py-2 text-xs leading-relaxed text-[#c2cee4]">
          Dans Safari, touchez <strong className="font-semibold text-white">Partager</strong> puis{" "}
          <strong className="font-semibold text-white">Sur l&apos;écran d&apos;accueil</strong>.
        </p>
      ) : null}
    </div>
  );
}
