"use client";

import { useProTheme } from "@/components/pro/ProTheme";

export function UnsavedChangesBar({ visible }: { visible: boolean }) {
  const { theme } = useProTheme();
  if (!visible) return null;

  const isLight = theme === "light";

  return (
    <div
      role="status"
      className={
        isLight
          ? "flex items-center gap-2 rounded-xl border border-amber-300/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
          : "flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-3 text-sm text-amber-50"
      }
    >
      <span
        className={`inline-block h-2 w-2 shrink-0 animate-pulse rounded-full ${isLight ? "bg-amber-600" : "bg-amber-400"}`}
        aria-hidden
      />
      <span>
        <span className="font-semibold">Modifications non enregistrées</span>
        <span className={isLight ? "text-amber-900/90" : "text-amber-100/90"}>
          {" "}
          — elles restent sur cet appareil jusqu’à la prochaine sauvegarde persistante.
        </span>
      </span>
    </div>
  );
}
