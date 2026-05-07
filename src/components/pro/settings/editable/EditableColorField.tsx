"use client";

import { useCallback, useEffect, useState } from "react";
import { HelpTooltip } from "../HelpTooltip";
import { proInputClass, proLabelClass } from "./proFieldStyles";
import { hexForColorInput, normalizeHexToSix } from "@/lib/branding/colorUtils";

type EditableColorFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  hint?: string;
};

export function EditableColorField({ label, value, onChange, editing, hint }: EditableColorFieldProps) {
  const [text, setText] = useState(value);
  const safePreview = hexForColorInput(value);
  const swatchColor = editing ? hexForColorInput(text) : safePreview;

  useEffect(() => {
    setText(value);
  }, [value]);

  const applyHex = useCallback(
    (raw: string) => {
      const normalized = normalizeHexToSix(raw);
      if (normalized) {
        onChange(normalized);
        setText(normalized);
      }
    },
    [onChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] px-4 py-3">
      <span
        className="h-9 w-9 shrink-0 rounded-lg border border-[var(--pro-border)] shadow-inner dark:border-white/10"
        style={{ backgroundColor: swatchColor }}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={proLabelClass}>{label}</span>
          {hint ? <HelpTooltip text={hint} /> : null}
        </div>
        {editing ? (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={safePreview}
              onChange={(e) => applyHex(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] p-1 dark:border-white/15"
              aria-label={`Choisir la couleur ${label}`}
            />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => {
                const normalized = normalizeHexToSix(text);
                if (normalized) applyHex(normalized);
                else setText(value);
              }}
              placeholder="#RRGGBB"
              spellCheck={false}
              className={`${proInputClass} min-w-[7.5rem] flex-1 font-mono text-[13px]`}
            />
          </div>
        ) : (
          <p className="font-mono text-[13px] text-[var(--pro-text-muted)]">{value}</p>
        )}
      </div>
    </div>
  );
}
