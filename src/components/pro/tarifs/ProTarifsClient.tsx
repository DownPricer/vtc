"use client";

import type { SiteConfig } from "@/config/site.config";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { ProGuard } from "@/components/pro/ProGuard";
import { ProTenantEditorChrome } from "@/components/pro/ProTenantEditorChrome";
import { CalculatorTab } from "@/components/pro/settings/tabs/CalculatorTab";
import { useProTenantEditor } from "@/hooks/useProTenantEditor";
import { validatePricingSection } from "@/lib/pricing/pricingValidation";

type ProTarifsClientProps = {
  defaults: TenantSettingsV1;
  siteFeatures: SiteConfig["features"];
};

const EMPTY_MAIL_META = {
  mailTo: null,
  mailToCopy: null,
  mailReplyTo: null,
  customerConfirmationEnv: "",
  customerConfirmationEffective: false,
};

export function ProTarifsClient({ defaults, siteFeatures }: ProTarifsClientProps) {
  const editor = useProTenantEditor(defaults);
  const { draft, setDraft, editing, enterEdit, cancelEdit, isDirty, loadState, loadMessage, saving, feedback, save } = editor;

  const handleSave = async () => {
    const { errors, warnings } = validatePricingSection(draft.pricing);
    await save({
      validate: () => (errors.length > 0 ? errors : null),
      warnings,
    });
  };

  return (
    <ProGuard>
      <ProTenantEditorChrome
        title="Tarifs"
        description="Paramètres utilisés par le calculateur. Les modifications s’appliquent après enregistrement."
        editing={editing}
        isDirty={isDirty}
        saving={saving}
        loadState={loadState}
        loadMessage={loadMessage}
        feedback={feedback}
        onModify={enterEdit}
        onCancel={cancelEdit}
        onSave={handleSave}
        saveLabel="Enregistrer les tarifs"
      >
        <CalculatorTab
          draft={draft}
          setDraft={setDraft}
          editing={editing}
          siteFeatures={siteFeatures}
          mailMeta={EMPTY_MAIL_META}
          contactErrors={{}}
        />
      </ProTenantEditorChrome>
    </ProGuard>
  );
}
