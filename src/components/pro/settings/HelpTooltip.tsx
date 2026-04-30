type HelpTooltipProps = {
  text: string;
};

/** Infobulle native (accessibilité : survol + title). */
export function HelpTooltip({ text }: HelpTooltipProps) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full border border-[var(--pro-border)] bg-[var(--pro-panel)] text-[10px] font-bold text-[var(--pro-text-muted)]"
      title={text}
      aria-label={text}
      role="img"
    >
      ?
    </span>
  );
}
