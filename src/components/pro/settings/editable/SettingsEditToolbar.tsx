"use client";

import { proBtnPrimaryClass, proBtnSecondaryClass } from "./proFieldStyles";

type SettingsEditToolbarProps = {
  editing: boolean;
  isDirty: boolean;
  onModify: () => void;
  onCancel: () => void;
  onSave: () => void;
  onPreview: () => void;
};

export function SettingsEditToolbar({
  editing,
  isDirty,
  onModify,
  onCancel,
  onSave,
  onPreview,
}: SettingsEditToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!editing ? (
        <button type="button" onClick={onModify} className={proBtnPrimaryClass}>
          Modifier
        </button>
      ) : (
        <>
          <button type="button" onClick={onCancel} className={proBtnSecondaryClass}>
            Annuler
          </button>
          <button type="button" onClick={onSave} className={proBtnPrimaryClass} disabled={!isDirty}>
            Enregistrer
          </button>
        </>
      )}
      <button type="button" onClick={onPreview} className={proBtnSecondaryClass}>
        Prévisualiser
      </button>
    </div>
  );
}
