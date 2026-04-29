import { siteConfig } from "@/config/site.config";
import { assertSmtpConfigured, sendSmtpMessage } from "@/lib/email/smtp";
import {
  buildCustomerConfirmation,
  buildOperatorEmail,
} from "@/lib/email/formatLeadEmail";

function envFlag(name: string, fallback: boolean): boolean {
  const v = process.env[name]?.toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  if (v === "1" || v === "true" || v === "yes") return true;
  return fallback;
}

export async function sendContactLeadEmail(
  flat: Record<string, string>,
  replyToCustomerEmail?: string
): Promise<void> {
  const env = assertSmtpConfigured();
  const { subject, html, text } = buildOperatorEmail({
    type: "contact",
    subjectPrefix: "",
    flat,
  });
  await sendSmtpMessage({
    env,
    subject,
    html,
    text,
    replyTo: replyToCustomerEmail || flat.Email,
  });
}

export async function sendDevisLeadEmails(
  flat: Record<string, string>,
  customerEmail: string,
  customerDisplayName: string,
  summaryLines: string[]
): Promise<void> {
  const env = assertSmtpConfigured();
  const { subject, html, text } = buildOperatorEmail({
    type: "devis",
    subjectPrefix: "[DEVIS] ",
    flat,
  });
  await sendSmtpMessage({ env, subject, html, text, replyTo: customerEmail });

  const sendCopy = envFlag(
    "MAIL_SEND_CUSTOMER_CONFIRMATION",
    siteConfig.features.sendCustomerConfirmationEmail
  );
  if (sendCopy && customerEmail?.includes("@")) {
    const c = buildCustomerConfirmation({
      type: "devis",
      recipientName: customerDisplayName,
      summaryLines,
    });
    await sendSmtpMessage({
      env,
      subject: c.subject,
      html: c.html,
      text: c.text,
      to: customerEmail,
      omitAutoBcc: true,
    });
  }
}

export async function sendReservationLeadEmails(
  flat: Record<string, string>,
  customerEmail: string,
  customerDisplayName: string,
  summaryLines: string[]
): Promise<void> {
  const env = assertSmtpConfigured();
  const { subject, html, text } = buildOperatorEmail({
    type: "reservation",
    subjectPrefix: "[RÉSERVATION] ",
    flat,
  });
  await sendSmtpMessage({ env, subject, html, text, replyTo: customerEmail });

  const sendCopy = envFlag(
    "MAIL_SEND_CUSTOMER_CONFIRMATION",
    siteConfig.features.sendCustomerConfirmationEmail
  );
  if (sendCopy && customerEmail?.includes("@")) {
    const c = buildCustomerConfirmation({
      type: "reservation",
      recipientName: customerDisplayName,
      summaryLines,
    });
    await sendSmtpMessage({
      env,
      subject: c.subject,
      html: c.html,
      text: c.text,
      to: customerEmail,
      omitAutoBcc: true,
    });
  }
}
