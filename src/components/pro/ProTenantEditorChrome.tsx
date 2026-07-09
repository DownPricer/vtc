"use client";

import type { ReactNode } from "react";
import { ProPanel, ProSectionHeader } from "@/components/pro/ProUi";
import { SettingsEditToolbar } from "@/components/pro/settings/editable/SettingsEditToolbar";
import { UnsavedChangesBar } from "@/components/pro/settings/editable/UnsavedChangesBar";

type ProTenantEditorChromeProps = {
  title: string;
  description: string;
  editing: boolean;
  isDirty: boolean;
  saving: boolean;
  loadState: "loading" | "ready" | "error";
  loadMessage?: string | null;
  feedback?: { tone: "success" | "error" | "warning"; text: string } | null;
  onModify: () => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  showPreview?: boolean;
  onPreview?: () => void;
  saveLabel?: string;
  children: ReactNode;
};

export function ProTenantEditorChrome({
  title,
  description,
  editing,
  isDirty,
  saving,
  loadState,
  loadMessage,
  feedback,
  onModify,
  onCancel,
  onSave,
  showPreview = false,
  onPreview,
  saveLabel,
  children,
}: ProTenantEditorChromeProps) {
  return (
    <>
      <ProPanel>
        <ProSectionHeader
          title={title}
          description={description}
          action={
            <SettingsEditToolbar
              editing={editing}
              isDirty={isDirty}
              saving={saving}
              onModify={onModify}
              onCancel={onCancel}
              onSave={onSave}
              onPreview={onPreview}
              showPreview={showPreview}
              saveLabel={saveLabel}
            />
          }
        />
        {loadState === "loading" ? (
          <p className="mt-4 text-sm text-[var(--pro-text-muted)]">Chargement de la configuration…</p>
        ) : null}
        {loadMessage ? (
          <p className="mt-4 rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel-muted)] px-4 py-3 text-sm text-[var(--pro-text-muted)]">
            {loadMessage}
          </p>
        ) : null}
        {feedback ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-[var(--pro-text)]"
                : feedback.tone === "warning"
                  ? "border-amber-400/40 bg-amber-500/10 text-[var(--pro-text)]"
                  : "border-red-400/40 bg-red-500/10 text-[var(--pro-text)]"
            }`}
            role="status"
          >
            {feedback.text}
          </div>
        ) : null}
        <div className="mt-4">
          <UnsavedChangesBar visible={loadState === "ready" && editing && isDirty} />
        </div>
      </ProPanel>
      <div className={loadState === "loading" ? "pointer-events-none opacity-50" : ""}>{children}</div>
    </>
  );
}
