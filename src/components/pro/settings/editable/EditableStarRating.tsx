"use client";

import { useId } from "react";

type EditableStarRatingProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  editing: boolean;
  min?: number;
  max?: number;
  hint?: string;
};

export function EditableStarRating({
  label,
  value,
  onChange,
  editing,
  min = 1,
  max = 5,
  hint,
}: EditableStarRatingProps) {
  const id = useId();
  const clamped = Math.min(max, Math.max(min, Math.round(value)));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">{label}</span>
        {hint ? <span className="text-xs text-[var(--pro-text-muted)]">({hint})</span> : null}
      </div>
      {editing ? (
        <div
          className="inline-flex items-center gap-1 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-2 py-2"
          role="radiogroup"
          aria-label={label}
        >
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((star) => {
            const active = star <= clamped;
            const starId = `${id}-star-${star}`;
            return (
              <button
                key={star}
                id={starId}
                type="button"
                role="radio"
                aria-checked={clamped === star}
                tabIndex={clamped === star ? 0 : -1}
                className={`rounded-lg p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)] ${
                  active ? "text-[var(--pro-accent)]" : "text-[var(--pro-text-muted)] hover:text-[var(--pro-text-soft)]"
                }`}
                onClick={() => onChange(star)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    onChange(Math.min(max, clamped + 1));
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    onChange(Math.max(min, clamped - 1));
                  }
                }}
                title={`${star} sur ${max}`}
              >
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            );
          })}
          <span className="ml-1 min-w-[2.5rem] text-center text-sm font-semibold text-[var(--pro-text)]">{clamped}/{max}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 text-[var(--pro-accent)]">
            {Array.from({ length: max }, (_, i) => (
              <svg key={i} className="h-5 w-5" fill={i < clamped ? "currentColor" : "none"} viewBox="0 0 20 20" stroke="currentColor">
                <path
                  strokeWidth={1.2}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            ))}
          </div>
          <span className="text-sm text-[var(--pro-text-soft)]">
            {clamped}/{max}
          </span>
        </div>
      )}
    </div>
  );
}
