"use client";

import { proBtnPrimaryClass, proBtnSecondaryClass } from "./proFieldStyles";

type SettingsEditToolbarProps = {
  editing: boolean;
  isDirty: boolean;
  saving?: boolean;
  onModify: () => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  onPreview: () => void;
};

export function SettingsEditToolbar({
  editing,
  isDirty,
  saving = false,
  onModify,
  onCancel,
  onSave,
  onPreview,
}: SettingsEditToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {!editing ? (
        <button type="button" onClick={onModify} className={proBtnPrimaryClass}>
          Modifier
        </button>
      ) : (
        <>
          <button type="button" onClick={onCancel} className={proBtnSecondaryClass}>
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void onSave()}
            className={proBtnPrimaryClass}
            disabled={!isDirty || saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </>
      )}
      <button type="button" onClick={onPreview} className={proBtnSecondaryClass}>
        Previsualiser
      </button>
    </div>
  );
}
