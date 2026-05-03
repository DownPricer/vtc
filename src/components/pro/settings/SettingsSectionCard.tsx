import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSectionCard({ title, description, children }: SettingsSectionCardProps) {
  return (
    <section className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel)]/95 p-5 shadow-[var(--pro-shadow)] md:p-6">
      <header className="mb-5 space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight text-[var(--pro-text)] md:text-[1.05rem]">{title}</h3>
        {description ? <p className="max-w-3xl text-sm leading-relaxed text-[var(--pro-text-soft)]">{description}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type SettingsCalloutProps = {
  title: string;
  description: string;
  caption?: string;
};

export function SettingsCallout({ title, description, caption }: SettingsCalloutProps) {
  return (
    <div className="rounded-2xl border border-[var(--pro-border)] bg-[linear-gradient(135deg,var(--pro-accent-soft),transparent_72%)] px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--pro-panel)] text-sm font-semibold text-[var(--pro-accent)] shadow-sm"
        >
          i
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-[var(--pro-text)]">{title}</p>
          <p className="text-sm leading-relaxed text-[var(--pro-text-soft)]">{description}</p>
          {caption ? <p className="text-xs leading-relaxed text-[var(--pro-text-muted)]">{caption}</p> : null}
        </div>
      </div>
    </div>
  );
}
