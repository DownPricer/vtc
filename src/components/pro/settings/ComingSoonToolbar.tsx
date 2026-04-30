"use client";

const MSG = "Édition disponible dans une prochaine étape.";

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => window.alert(MSG))}
      className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-2 text-sm font-medium text-[var(--pro-text-muted)] transition hover:border-[var(--pro-accent)]/40 hover:text-[var(--pro-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-accent)]"
    >
      {children}
    </button>
  );
}

export function ComingSoonToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <GhostButton>Modifier</GhostButton>
      <GhostButton>Enregistrer</GhostButton>
      <GhostButton onClick={() => window.open("/", "_blank", "noopener,noreferrer")}>Prévisualiser</GhostButton>
    </div>
  );
}
