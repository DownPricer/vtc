"use client";

import { useRouter } from "next/navigation";
import { logoutPro } from "@/lib/proApi";
import { translateAction } from "@/components/pro/proDisplay";
import { ProThemeToggle } from "@/components/pro/ProThemeToggle";
import { useProTheme } from "@/components/pro/ProTheme";
import { ProDescriptionList, ProPanel, ProSectionHeader } from "@/components/pro/ProUi";

type ProSettingsAppearancePanelProps = {
  commercialName: string;
  operatorHint?: string;
};

export function ProSettingsAppearancePanel({ commercialName, operatorHint }: ProSettingsAppearancePanelProps) {
  const { theme } = useProTheme();
  const router = useRouter();

  return (
    <ProPanel>
      <ProSectionHeader
        eyebrow="Compte & interface"
        title="Préférences"
        description="Apparence de l’espace pro et session utilisateur."
      />
      <div className="mt-6 space-y-6">
        <ProDescriptionList
          rows={[
            { label: "Entreprise", value: commercialName },
            { label: "Compte", value: operatorHint ?? "Connecté à l’espace pro" },
            {
              label: "Thème actuel",
              value: theme === "dark" ? "Mode sombre" : "Mode clair",
            },
          ]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <ProThemeToggle variant="topbar" />
          <button
            type="button"
            onClick={async () => {
              await logoutPro();
              router.replace("/pro/login");
            }}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--pro-text)] hover:bg-[var(--pro-panel-strong)]"
          >
            {translateAction("logout")}
          </button>
        </div>
      </div>
    </ProPanel>
  );
}
