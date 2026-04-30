import type { ReactNode } from "react";

type ReadonlyListCardProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  children?: ReactNode;
};

export function ReadonlyListCard({ title, subtitle, meta, children }: ReadonlyListCardProps) {
  return (
    <article className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[var(--pro-text)]">{title}</h4>
          {subtitle ? <p className="mt-0.5 text-xs text-[var(--pro-text-muted)]">{subtitle}</p> : null}
        </div>
        {meta ? <div className="shrink-0 text-xs text-[var(--pro-text-muted)]">{meta}</div> : null}
      </div>
      {children != null ? (
        <div className="mt-3 space-y-2 text-sm text-[var(--pro-text-soft)]">{children}</div>
      ) : null}
    </article>
  );
}
