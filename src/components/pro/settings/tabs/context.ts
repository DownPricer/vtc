import type { Dispatch, SetStateAction } from "react";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import type { SiteConfig } from "@/config/site.config";
import type { ProSettingsMailMeta } from "../types";

export type SettingsTabsSharedProps = {
  draft: TenantSettingsV1;
  setDraft: Dispatch<SetStateAction<TenantSettingsV1>>;
  editing: boolean;
  siteFeatures: SiteConfig["features"];
  mailMeta: ProSettingsMailMeta;
  contactErrors: Record<string, string>;
};
