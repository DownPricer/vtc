"use client";

import { SettingsSectionCard } from "../SettingsSectionCard";
import { ReadonlyField } from "../ReadonlyField";
import { EditableField } from "../editable/EditableField";
import { EditableTextarea } from "../editable/EditableTextarea";
import { EditableNumberField } from "../editable/EditableNumberField";
import type { SettingsTabsSharedProps } from "./context";

export function ContactTab({ draft, setDraft, editing, mailMeta, siteFeatures, contactErrors }: SettingsTabsSharedProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Coordonnées publiques (vitrine)" description="Affichées sur contact, pied de page, etc.">
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Téléphone affiché"
            value={draft.contact.phoneDisplay}
            onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, phoneDisplay: v } }))}
            editing={editing}
            error={contactErrors.phoneDisplay}
            type="tel"
          />
          <EditableField
            label="Téléphone E.164"
            value={draft.contact.phoneE164}
            onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, phoneE164: v } }))}
            editing={editing}
            hint="Doit commencer par « + » si renseigné."
            error={contactErrors.phoneE164}
            mono
            type="tel"
          />
          <EditableField
            label="WhatsApp (chiffres)"
            value={draft.contact.whatsappDigits ?? ""}
            onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, whatsappDigits: v } }))}
            editing={editing}
            mono
          />
          <EditableField
            label="E-mail public"
            value={draft.contact.emailPublic}
            onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, emailPublic: v } }))}
            editing={editing}
            type="email"
            error={contactErrors.emailPublic}
          />
        </div>
        <EditableTextarea
          label="Message WhatsApp prérempli"
          value={draft.contact.whatsappPrefillText}
          onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, whatsappPrefillText: v } }))}
          editing={editing}
          rows={3}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <EditableField
            label="Adresse — rue"
            value={draft.contact.address.street}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                contact: { ...d.contact, address: { ...d.contact.address, street: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Code postal"
            value={draft.contact.address.postalCode}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                contact: { ...d.contact, address: { ...d.contact.address, postalCode: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Ville"
            value={draft.contact.address.city}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                contact: { ...d.contact, address: { ...d.contact.address, city: v } },
              }))
            }
            editing={editing}
          />
          <EditableField
            label="Pays"
            value={draft.contact.address.country}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                contact: { ...d.contact, address: { ...d.contact.address, country: v } },
              }))
            }
            editing={editing}
          />
          <EditableNumberField
            label="Latitude"
            value={draft.contact.address.latitude}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                contact: { ...d.contact, address: { ...d.contact.address, latitude: v } },
              }))
            }
            editing={editing}
            step={0.000001}
          />
          <EditableNumberField
            label="Longitude"
            value={draft.contact.address.longitude}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                contact: { ...d.contact, address: { ...d.contact.address, longitude: v } },
              }))
            }
            editing={editing}
            step={0.000001}
          />
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard
        title="Routage e-mails (hébergement)"
        description="Variables d’environnement côté serveur. Aucun mot de passe ni secret n’est affiché."
      >
        <ReadonlyField
          label="MAIL_TO (réception opérateur)"
          value={mailMeta.mailTo ?? "—"}
          hint="Destinataire principal des formulaires. Peut être différent de l’e-mail public."
        />
        <ReadonlyField label="MAIL_TO_COPY (copie)" value={mailMeta.mailToCopy ?? "—"} />
        <ReadonlyField label="MAIL_REPLY_TO" value={mailMeta.mailReplyTo ?? "—"} />
        <ReadonlyField label="MAIL_SEND_CUSTOMER_CONFIRMATION (brut)" value={mailMeta.customerConfirmationEnv || "—"} mono />
        <ReadonlyField label="Accusé client au voyageur (effectif)" value={mailMeta.customerConfirmationEffective} />
        <ReadonlyField
          label="Préférence site (repli)"
          value={siteFeatures.sendCustomerConfirmationEmail}
          hint="Utilisée si la variable d’environnement n’est pas positionnée."
        />
      </SettingsSectionCard>
    </div>
  );
}
