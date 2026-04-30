import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSectionCard({ title, description, children }: SettingsSectionCardProps) {
  return (
    <section className="rounded-[22px] border border-[var(--pro-border)] bg-[var(--pro-panel-muted)]/50 p-5 shadow-sm md:p-6">
      <header className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-[var(--pro-text)]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-relaxed text-[var(--pro-text-muted)]">{description}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
