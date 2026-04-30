"use client";

import { HelpTooltip } from "../HelpTooltip";
import { proBtnSecondaryClass, proInputClass, proLabelClass } from "./proFieldStyles";

type SimpleStringListEditorProps = {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  editing: boolean;
  hint?: string;
};

export function SimpleStringListEditor({
  label,
  items,
  onChange,
  editing,
  hint,
}: SimpleStringListEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className={proLabelClass}>{label}</p>
        {hint ? <HelpTooltip text={hint} /> : null}
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-2">
            {editing ? (
              <>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = e.target.value;
                    onChange(next);
                  }}
                  className={proInputClass}
                />
                <button
                  type="button"
                  className={proBtnSecondaryClass}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  Retirer
                </button>
              </>
            ) : (
              <span className="rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-3 py-2 text-sm text-[var(--pro-text)]">
                {item}
              </span>
            )}
          </li>
        ))}
      </ul>
      {editing ? (
        <button type="button" className={proBtnSecondaryClass} onClick={() => onChange([...items, ""])}>
          Ajouter
        </button>
      ) : null}
    </div>
  );
}
