"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

function cloneTenant(t: TenantSettingsV1): TenantSettingsV1 {
  return structuredClone(t);
}

export function useTenantDraft(initial: TenantSettingsV1) {
  const baselineRef = useRef(cloneTenant(initial));
  const [draft, setDraft] = useState(() => cloneTenant(initial));
  const [editing, setEditing] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baselineRef.current), [draft]);

  const enterEdit = useCallback(() => setEditing(true), []);

  const cancelEdit = useCallback(() => {
    setDraft(cloneTenant(baselineRef.current));
    setEditing(false);
  }, []);

  return {
    draft,
    setDraft,
    editing,
    isDirty,
    enterEdit,
    cancelEdit,
  };
}
