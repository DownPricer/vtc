"use client";

export function UnsavedChangesBar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-3 text-sm text-amber-50"
    >
      <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" aria-hidden />
      <span>
        <span className="font-semibold">Modifications non enregistrées</span>
        <span className="text-amber-100/90"> — elles restent sur cet appareil jusqu’à la prochaine sauvegarde persistante.</span>
      </span>
    </div>
  );
}
