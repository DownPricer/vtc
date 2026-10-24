"use client";

import { SiteImagesPanel } from "../SiteImagesPanel";
import type { SettingsTabsSharedProps } from "./context";

export function ImagesTab(props: SettingsTabsSharedProps) {
  return <SiteImagesPanel {...props} />;
}
