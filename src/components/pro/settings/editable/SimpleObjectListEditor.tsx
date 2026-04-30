"use client";

import type { ReactNode } from "react";
import { proBtnSecondaryClass } from "./proFieldStyles";

type SimpleObjectListEditorProps<T> = {
  items: T[];
  onChange: (next: T[]) => void;
  editing: boolean;
  addLabel: string;
  onCreate: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void, remove: () => void) => ReactNode;
};

export function SimpleObjectListEditor<T>({
  items,
  onChange,
  editing,
  addLabel,
  onCreate,
  renderItem,
}: SimpleObjectListEditorProps<T>) {
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item, index) =>
          renderItem(
            item,
            index,
            (patch) => {
              const next = [...items];
              next[index] = { ...next[index], ...patch } as T;
              onChange(next);
            },
            () => onChange(items.filter((_, i) => i !== index))
          )
        )}
      </ul>
      {editing ? (
        <button type="button" className={proBtnSecondaryClass} onClick={() => onChange([...items, onCreate()])}>
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}
