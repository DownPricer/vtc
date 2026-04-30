"use client";

import type { SettingsTabId } from "../SettingsTabs";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { ContactTab } from "./ContactTab";
import { HomeTab } from "./HomeTab";
import { CalculatorTab } from "./CalculatorTab";
import { PricingTab } from "./PricingTab";
import { ServicesTab } from "./ServicesTab";
import { VehiclesTab } from "./VehiclesTab";
import { BadgesTab } from "./BadgesTab";
import { TestimonialsTab } from "./TestimonialsTab";
import { FaqTab } from "./FaqTab";
import { SeoTab } from "./SeoTab";
import { LegalTab } from "./LegalTab";
import type { SettingsTabsSharedProps } from "./context";

type SettingsTabPanelsProps = SettingsTabsSharedProps & { tab: SettingsTabId };

export function SettingsTabPanels(props: SettingsTabPanelsProps) {
  const { tab, ...ctx } = props;
  switch (tab) {
    case "general":
      return <GeneralTab {...ctx} />;
    case "appearance":
      return <AppearanceTab {...ctx} />;
    case "contact":
      return <ContactTab {...ctx} />;
    case "home":
      return <HomeTab {...ctx} />;
    case "calculator":
      return <CalculatorTab {...ctx} />;
    case "pricing":
      return <PricingTab {...ctx} />;
    case "services":
      return <ServicesTab {...ctx} />;
    case "vehicles":
      return <VehiclesTab {...ctx} />;
    case "badges":
      return <BadgesTab {...ctx} />;
    case "testimonials":
      return <TestimonialsTab {...ctx} />;
    case "faq":
      return <FaqTab {...ctx} />;
    case "seo":
      return <SeoTab {...ctx} />;
    case "legal":
      return <LegalTab {...ctx} />;
    default:
      return null;
  }
}
